---
name: publish-to-fooh
description: Publish work from a local folder (renders, finals, exports) to the user's FOOH.com portfolio — scan the folder, group files into works, upload videos and stills, and create the works with brand, year, work types and credits. Use when the user asks to put work on FOOH, publish a renders folder, update their FOOH portfolio from disk, or upload a reel/campaign to fooh.com.
---

# Publish a folder of work to FOOH

FOOH.com is the social-first home for digital artists (CGI, VFX, 3D, 2D animation, AI video, mixed reality). The `fooh` MCP server acts for the signed-in member on their own profile. Its tools are prefixed `mcp__fooh__` (or `mcp__plugin_fooh_fooh__`).

## 1. Account

Call `get_my_profile`. If `profile` is null, help the user create one: `check_handle`, then `create_profile`. Fill the basics with `update_profile` if they're empty (bio, links, capabilities/tools/industries — use `list_vocabulary` for existing spellings).

## 2. Find the finals

List video (`.mp4 .mov .webm .m4v`) and image (`.jpg .jpeg .png .webp`) files under the folder the user named. Group them into **works** — usually one per subfolder, campaign or brand name in the filename. Within a work prefer finals: names with `final`, `master`, `delivery`, the highest version number; skip `wip`, `draft`, `test`, proxies and older versions.

If `ffprobe` is available, check each video: duration ≤ 30 min and bitrate ≤ 200 Mbps (`ffprobe -v error -show_entries format=duration,bit_rate -of json FILE`). FOOH's host rejects higher bitrates (typical of ProRes). Offer to transcode with `ffmpeg -i IN -c:v libx264 -crf 18 -preset slow -c:a aac -b:a 192k -movflags +faststart OUT.mp4` — ask first, and write the output next to the original, never over it.

## 3. Confirm before anything goes live

Show the user a short plan: per work the title, files, client project or spec work, brand, year, work types, credits. Ask for what you can't infer (brand, year, credits, whether it's commissioned). Publishing rules: at least one image or video and one work type; a client project also needs a brand and a year. Only publish work the user made or co-made — and ask if a client piece is cleared to share publicly.

## 4. Upload each file

For each file, get its exact size (`stat -f%z FILE` on macOS, `stat -c%s FILE` on Linux), then:

- Video: `get_video_upload_url {fileName, sizeBytes}`. Image: `get_image_upload_url {fileName}`.
- Upload with the bundled script (handles both single POST and resumable chunks):
  - single POST (images, videos ≤ 200 MB): `node "${CLAUDE_PLUGIN_ROOT}/scripts/fooh-upload.mjs" FILE UPLOAD_URL`
  - resumable (method says tus): `node "${CLAUDE_PLUGIN_ROOT}/scripts/fooh-upload.mjs" FILE UPLOAD_URL --tus`
- Keep the returned `streamUid` (video) or `workImageUrl` (image).

## 5. Create the works

`create_work` with `media` in display order (hero video first), plus `types`, `brands`, `year`, `credits`, `tools`, `description`. Videos process for a few minutes; they can be attached right away. If the user wants to check first, create with `publish: false` and publish later with `update_work {id, publish: true}`.

Finish with `get_upload_status` for each video until `ready`, then give the user the work URLs, and `get_profile_health` if anything is left to do.
