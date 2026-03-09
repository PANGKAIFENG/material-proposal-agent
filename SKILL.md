---
name: material-proposal-agent
description: Generate a material proposal PPT from a text request or a trend PDF. Use when OpenClaw needs to analyze a fabric requirement, ask 1-2 clarification questions, generate candidate material images through an API, let the user choose options in Feishu IM by replying with short IDs like A1/A2, and export a PPT proposal.
---

# Material Proposal Agent

Use the bundled CLI. Keep the workflow session-based so the same Feishu thread can continue across turns.

## What this skill does

- Accepts a text request or a PDF file path
- Produces a structured material brief
- Suggests clarification questions when the brief is too vague
- Generates 3-6 candidate material directions and images
- Supports Feishu-friendly selection via short IDs such as `A1 A3`
- Exports a PPT proposal with the selected candidates

## Quick workflow

1. Start a session from text:

```bash
material-proposal-agent start --input-text "我想做一组适合夏季瑜伽服的环保面料，颜色偏多巴胺一点"
```

2. Or start from a PDF:

```bash
material-proposal-agent start --pdf /absolute/path/to/trend.pdf
```

3. If the output says `clarification_needed`, ask the user the listed question(s), then continue:

```bash
material-proposal-agent reply --session SESSION_ID --message "偏再生材料，高弹支撑，预算中高"
```

4. Generate candidate directions:

```bash
material-proposal-agent generate --session SESSION_ID --count 4
```

5. In Feishu, present the returned message and ask the user to reply with short IDs. Example:

```text
请直接回复编号，例如：选 A1 A3；如果需要调整，也可以说“A2颜色浅一点，再来2个”。
```

6. Save the chosen candidates:

```bash
material-proposal-agent select --session SESSION_ID --ids A1,A3
```

7. Export the PPT:

```bash
material-proposal-agent ppt --session SESSION_ID --output /absolute/path/to/output/material-proposal.pptx
```

## Feishu mobile guidance

- Do not present long lists or complex multi-select cards.
- Show at most 4 candidates at once.
- Prefer plain text selection by IDs such as `A1`, `A2`, `A3`.
- If the user asks for changes, keep the same session and regenerate candidates instead of starting over.

## Environment

Read [references/setup.md](references/setup.md) before first use.

Core env vars:

- `MPA_OPENAI_API_KEY`
- `MPA_OPENAI_BASE_URL` if using an OpenAI-compatible gateway
- `MPA_CHAT_MODEL`
- `MPA_IMAGE_PROVIDER`
- `MPA_IMAGE_API_KEY`
- `MPA_IMAGE_MODEL`
- `MPA_STATE_DIR`

Recommended image setup for OpenClaw:

- `MPA_IMAGE_PROVIDER=geekai`
- `MPA_IMAGE_API_KEY=<your geekai token>`
- `MPA_IMAGE_MODEL=<the chosen image model>`

If no model or image API is configured, the CLI falls back to heuristic brief extraction and SVG placeholder candidate images so the demo can still run.

## Bundled resources

### `scripts/material-proposal-agent.mjs`

Main CLI entrypoint. Use this instead of rewriting the pipeline in the skill body.

### `references/setup.md`

Setup and environment variables.

### `references/publish.md`

How to push the repo to GitHub and install it into OpenClaw/OpenCloud.

### `references/architecture.md`

Shared session model, command flow, and output objects.
