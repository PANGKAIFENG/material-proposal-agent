#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-$HOME/.codex/skills/material-proposal-agent}"
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$(dirname "$TARGET_DIR")"
mkdir -p "$TARGET_DIR"
rsync -a --delete \
  --exclude node_modules \
  --exclude sessions \
  --exclude output \
  "$SOURCE_DIR"/ "$TARGET_DIR"/

cd "$TARGET_DIR"
npm install

echo "Installed material-proposal-agent to $TARGET_DIR"
echo "If needed, run: cd $TARGET_DIR && npm link"
