# Publish

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial material proposal agent"
gh repo create material-proposal-agent --private --source=. --remote=origin --push
```

Switch `--private` to `--public` if the repository should be publicly installable.

## Use with OpenClaw / OpenCloud

Recommended path:

1. Push this repository to GitHub.
2. Sync the skill to ClawHub as a standard skill bundle rooted at this directory.
3. In the runtime host, clone the repo and run `npm install`.
4. Install the skill into the local skill directory or point OpenClaw at the repository.
5. Ensure `material-proposal-agent` is on `PATH`, or call it through `node /absolute/path/scripts/material-proposal-agent.mjs`.

## Minimal install helper

If you want a local install:

```bash
npm install
npm link
```

This makes `material-proposal-agent` available globally on the current machine.
