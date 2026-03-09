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
- `MPA_IMAGE_MODEL`: Image model used with the OpenAI images API
- `MPA_IMAGE_API_URL`: Optional custom image endpoint if image generation is handled by another service
- `MPA_IMAGE_API_KEY`: Optional key for the custom image endpoint
- `MPA_STATE_DIR`: Where session files are stored. Defaults to `~/.material-proposal-agent/sessions`
- `MPA_DEFAULT_COUNT`: Default number of generated candidates

## Fallback behavior

If chat model access is unavailable, the tool uses heuristic extraction.

If image generation is unavailable, the tool writes SVG placeholder images so the PPT flow still works for demos.
