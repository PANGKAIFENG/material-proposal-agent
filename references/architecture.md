# Architecture

## Commands

- `start`: create a session from text or PDF and return a brief
- `reply`: merge additional user answers into the existing brief
- `generate`: generate candidate material directions and images
- `select`: save the chosen candidate IDs
- `ppt`: export the final proposal PPT
- `status`: inspect session state

## PDF analysis strategy

There are two valid modes:

1. Native multimodal mode
   Use when the runtime model can directly inspect PDF files. This is the preferred path in OpenClaw if Codex 5.4 or another multimodal model already supports PDF understanding.

2. Fallback extraction mode
   Use the local PDF text extraction path when direct PDF understanding is unavailable.

In both modes, the output contract should be the same:

- theme
- use cases
- material direction
- color palette
- texture and finish
- performance needs
- constraints
- ambiguities
- missing info

The skill exists to keep that contract stable, not to force a single parsing implementation.

## Session state

Each session stores:

- original input text or PDF path
- extracted PDF text when applicable
- current material brief
- clarification history
- generated candidates and asset paths
- selected candidate IDs
- PPT output path

## Feishu IM pattern

The intended interaction is:

1. start
2. optional reply
3. generate
4. user replies with IDs
5. select
6. ppt

Keep candidate count low for mobile IM. Four is the default target.
