#!/usr/bin/env node
// Upload one local file to the one-time URL a FOOH tool handed out
// (get_video_upload_url / get_image_upload_url). No dependencies — Node 20+.
//
//   node fooh-upload.mjs <file> <uploadUrl> [--tus]
//
// Without --tus: a single multipart POST (field "file") — images, and videos
// up to 200 MB. With --tus: a resumable chunked upload for larger videos; if a
// chunk fails it asks the server where to resume and carries on, and re-running
// the same command after a crash resumes from where it stopped.
import { openAsBlob, statSync, openSync, readSync, closeSync } from "node:fs";
import { basename } from "node:path";

const [file, url, flag] = process.argv.slice(2);
if (!file || !url) {
  console.error("usage: node fooh-upload.mjs <file> <uploadUrl> [--tus]");
  process.exit(2);
}
const size = statSync(file).size;
const CHUNK = 50 * 1024 * 1024; // multiple of 256 KiB, as tus on Cloudflare Stream requires
const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;

async function post() {
  const form = new FormData();
  form.append("file", await openAsBlob(file), basename(file));
  const res = await fetch(url, { method: "POST", body: form });
  const text = await res.text();
  if (!res.ok) throw new Error(`upload failed (${res.status}): ${text.slice(0, 300)}`);
  console.log(`uploaded ${basename(file)} (${mb(size)})`);
}

async function currentOffset() {
  const res = await fetch(url, { method: "HEAD", headers: { "Tus-Resumable": "1.0.0" } });
  if (!res.ok) throw new Error(`could not read upload offset (${res.status})`);
  return Number(res.headers.get("Upload-Offset") ?? 0);
}

async function tus() {
  let offset = await currentOffset();
  let failures = 0;
  const fd = openSync(file, "r");
  try {
    while (offset < size) {
      const len = Math.min(CHUNK, size - offset);
      const buf = Buffer.alloc(len);
      readSync(fd, buf, 0, len, offset);
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Offset": String(offset),
          "Content-Type": "application/offset+octet-stream",
        },
        body: buf,
      }).catch((err) => ({ ok: false, status: 0, err }));
      if (res.ok) {
        offset = Number(res.headers.get("Upload-Offset") ?? offset + len);
        failures = 0;
        process.stdout.write(`\r${mb(offset)} / ${mb(size)}`);
        continue;
      }
      if (++failures > 4) throw new Error(`upload stalled at ${mb(offset)} (${res.status || res.err?.message})`);
      await new Promise((r) => setTimeout(r, 1000 * 2 ** failures));
      offset = await currentOffset(); // the server may have kept part of the chunk
    }
  } finally {
    closeSync(fd);
  }
  process.stdout.write("\n");
  console.log(`uploaded ${basename(file)} (${mb(size)})`);
}

(flag === "--tus" ? tus() : post()).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
