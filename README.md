# Material Proposal Agent

Generate a fabric proposal PPT from a text request or a trend PDF, with a workflow designed for OpenClaw on Feishu IM.

Repository: [PANGKAIFENG/material-proposal-agent](https://github.com/PANGKAIFENG/material-proposal-agent)

## What it does

- Accepts a text request or a PDF
- Normalizes the input into a structured material brief
- Asks 1-2 clarification questions when the request is vague
- Generates 3-6 candidate material directions with images
- Lets the user choose candidates in Feishu by replying with short IDs like `A1 A3`
- Exports a final PPT proposal

## Recommended runtime model strategy

For PDF analysis, prefer the runtime model's native multimodal ability when available.

That means:

- In OpenClaw or Codex 5.4 style runtimes, pass the PDF directly to the model when the runtime already supports PDF understanding
- Use this skill to enforce the analysis structure, clarification rules, candidate generation flow, and PPT output
- Keep local PDF text extraction as a fallback for environments where direct PDF understanding is not available

This repository currently includes that fallback path through local PDF text extraction so the CLI can still run outside OpenClaw.

## Install

### Local development

```bash
git clone https://github.com/PANGKAIFENG/material-proposal-agent.git
cd material-proposal-agent
npm install
```

### Install into the local Codex/OpenClaw skill directory

```bash
./scripts/install-skill.sh
```

This copies the repo into `~/.codex/skills/material-proposal-agent` and installs dependencies there.

### Optional: expose the CLI globally

```bash
npm link
```

Then you can call:

```bash
material-proposal-agent help
```

## Configuration

Create a `.env` file from the example:

```bash
cp assets/material-proposal-agent.env.example .env
```

### Minimum useful config

```bash
MPA_OPENAI_API_KEY=...
MPA_CHAT_MODEL=codex-5.4
MPA_IMAGE_PROVIDER=geekai
MPA_IMAGE_API_KEY=...
MPA_IMAGE_MODEL=gpt-image-1
```

### GeekAI image generation

This project already supports GeekAI image generation with:

- `POST /images/generations`
- `GET /images/{task_id}` result polling

The integration is implemented in [src/image.mjs](./src/image.mjs).

Relevant vendor docs:

- [图片生成](https://docs.geekai.co/cn/api/image/generations)
- [生成结果查询](https://docs.geekai.co/cn/api/image/result)

## CLI usage

### Start from text

```bash
material-proposal-agent start --session demo01 --input-text "我想做一组适合夏季瑜伽服的环保面料，颜色偏多巴胺一点，偏再生材料，高弹支撑，预算中高。"
```

### Start from PDF

```bash
material-proposal-agent start --session demo02 --pdf /absolute/path/to/trend.pdf
```

### Reply to clarification

```bash
material-proposal-agent reply --session demo02 --message "偏细腻哑光，主要做高端通勤外套，性能更看重挺括和抗皱。"
```

### Generate candidates

```bash
material-proposal-agent generate --session demo02 --count 4
```

### Save user selection

```bash
material-proposal-agent select --session demo02 --ids A1,A3
```

### Export PPT

```bash
material-proposal-agent ppt --session demo02 --output /absolute/path/output/demo02.pptx
```

### Inspect session

```bash
material-proposal-agent status --session demo02
```

## Feishu IM pattern

Feishu mobile is not a good place for dense multi-select UI. The recommended pattern is plain text selection.

Example:

1. The bot returns 3-4 candidates
2. Each candidate has an ID like `A1`, `A2`, `A3`
3. The user replies:

```text
选 A1 A3
```

Or:

```text
A2 颜色浅一点，再来 2 个
```

This keeps the interaction stable on mobile IM and avoids complex card state handling.

## OpenClaw usage model

Recommended production usage:

1. OpenClaw receives text or PDF from Feishu
2. If the runtime supports PDF-native analysis, let the model inspect the PDF directly
3. Use this skill to normalize the result into a material brief
4. Ask only the required clarification questions
5. Generate candidate material images through GeekAI
6. Let the user choose by short IDs
7. Export the PPT

## Key files

- [SKILL.md](./SKILL.md): skill behavior and workflow
- [scripts/material-proposal-agent.mjs](./scripts/material-proposal-agent.mjs): CLI entrypoint
- [src/pipeline.mjs](./src/pipeline.mjs): workflow orchestration
- [src/image.mjs](./src/image.mjs): image provider adapters
- [src/ppt.mjs](./src/ppt.mjs): PPT export
- [references/setup.md](./references/setup.md): environment details

## Current scope

- Fabric recommendation only
- Text and PDF inputs
- Candidate generation via image API
- Feishu-friendly selection
- PPT export

Not in scope yet:

- Internal fabric database retrieval
- Brand website crawling
- Advanced image-to-fabric analysis
- Virtual try-on

## Fallback behavior

- If chat-model access is unavailable, the tool falls back to heuristic brief extraction
- If image generation is unavailable, the tool falls back to SVG placeholder assets
- If runtime-native PDF understanding is unavailable, the CLI falls back to local PDF text extraction
