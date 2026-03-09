# Setup

## Requirements

- Node.js 20+
- Network access to a chat model and optionally an image model/API

## Install

```bash
npm install
```

## Environment

Copy the example file and fill it in:

```bash
cp assets/material-proposal-agent.env.example .env
```

### Variables

- `MPA_OPENAI_API_KEY`: API key for an OpenAI-compatible chat endpoint
- `MPA_OPENAI_BASE_URL`: Optional base URL when not using the default OpenAI endpoint
- `MPA_CHAT_MODEL`: Chat model used for brief extraction and candidate copy
- `MPA_IMAGE_PROVIDER`: `geekai`, `openai`, or `custom`. Default is `geekai`
- `MPA_IMAGE_API_KEY`: API key for the image vendor
- `MPA_IMAGE_MODEL`: Image model used by the selected image provider
- `MPA_IMAGE_BASE_URL`: Base URL for the image generation endpoint. GeekAI defaults to `https://geekai.co/api/v1`
- `MPA_IMAGE_RESULT_BASE_URL`: Base URL for async result lookup. Defaults to the same GeekAI base URL
- `MPA_IMAGE_API_URL`: Optional custom image endpoint if image generation is handled by another service
- `MPA_IMAGE_SIZE`: Default `1024x1024`
- `MPA_IMAGE_ASPECT_RATIO`: Default `1:1`
- `MPA_IMAGE_QUALITY`: Default `medium`
- `MPA_IMAGE_RESPONSE_FORMAT`: `url` or `b64_json`
- `MPA_IMAGE_OUTPUT_FORMAT`: `png`, `jpg`, or `webp`
- `MPA_IMAGE_ASYNC`: Whether to use async generation and result polling. Default `true`
- `MPA_IMAGE_RETRIES`: Retries sent to the image provider
- `MPA_IMAGE_POLL_INTERVAL_MS`: Poll interval for async image jobs
- `MPA_IMAGE_POLL_TIMEOUT_MS`: Poll timeout for async image jobs
- `MPA_STATE_DIR`: Where session files are stored. Defaults to `~/.material-proposal-agent/sessions`
- `MPA_DEFAULT_COUNT`: Default number of generated candidates

## OpenClaw recommendation

For OpenClaw/OpenCloud deployment, let the runtime configure:

```bash
MPA_IMAGE_PROVIDER=geekai
MPA_IMAGE_API_KEY=...
MPA_IMAGE_MODEL=gpt-image-1
```

The code already knows how to submit image jobs to GeekAI and poll task results.

## Fallback behavior

If chat model access is unavailable, the tool uses heuristic extraction.

If image generation is unavailable, the tool writes SVG placeholder images so the PPT flow still works for demos.
