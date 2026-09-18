# FOOH for Claude Code

Build and maintain your [FOOH.com](https://fooh.com) portfolio from Claude Code. FOOH is the social-first home for digital artists (CGI, VFX, 3D, 2D animation, AI video, mixed reality): where they get hired, awarded, inspired and seen. Publishing and being listed are free.

This plugin adds:

- **The FOOH connector** (`https://fooh.com/mcp`): your profile, your works, uploads, and FOOH's public talent and work search. The first time you use it, Claude opens FOOH so you can sign in and approve.
- **`publish-to-fooh`** skill: point it at a renders folder. It picks the finals, uploads them straight from your disk (resumable for big files), and creates the works with brand, year, work types and credits — after you confirm the plan.
- **`maintain-fooh-profile`** skill: checks your profile health (what the talent ranking counts as maintained) and fixes what's missing.

## Install

```
/plugin marketplace add fooh-hub/fooh-plugin
/plugin install fooh@fooh
```

Or only the connector, without the skills:

```
claude mcp add --transport http fooh https://fooh.com/mcp
```

Other assistants (Claude.ai, ChatGPT, Codex, Cursor) connect to the same address — see [fooh.com/ai](https://fooh.com/ai).

## Try

- "Publish the finals in ~/Renders/2026 to FOOH, one work per campaign."
- "Check my FOOH profile health and fix what's missing."
- "Find available Houdini artists in Berlin on FOOH."

## Notes

- Uploads go straight from your disk to FOOH's media host (`scripts/fooh-upload.mjs`, no dependencies, Node 20+). Videos: up to 30 minutes and 200 Mbps; images up to 10 MB.
- The assistant only acts on your own account. Disconnect any time at fooh.com → Account → Connected apps.
- Help: [fooh.com/support](https://fooh.com/support/creator-accounts/connecting-an-ai-assistant) · hello@fooh.com

MIT licensed.
