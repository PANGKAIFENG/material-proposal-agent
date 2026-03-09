# Architecture

## Commands

- `start`: create a session from text or PDF and return a brief
- `reply`: merge additional user answers into the existing brief
- `generate`: generate candidate material directions and images
- `select`: save the chosen candidate IDs
- `ppt`: export the final proposal PPT
- `status`: inspect session state

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
