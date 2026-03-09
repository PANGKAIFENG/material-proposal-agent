#!/usr/bin/env node

import "dotenv/config";
import { parseArgs } from "node:util";
import { buildPptForSession, generateForSession, replyToSession, saveSelection, startFromPdf, startFromText } from "../src/pipeline.mjs";
import { loadSession } from "../src/state.mjs";

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function readOptions(args, definitions) {
  return parseArgs({
    args,
    options: definitions,
    allowPositionals: true
  });
}

function help() {
  process.stdout.write(`material-proposal-agent

Commands:
  help
  start --input-text "..."
  start --pdf /absolute/path/file.pdf
  reply --session SESSION_ID --message "..."
  generate --session SESSION_ID [--count 4]
  select --session SESSION_ID --ids A1,A3
  ppt --session SESSION_ID [--output /absolute/path/out.pptx]
  status --session SESSION_ID
`);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === "help") {
    help();
    return;
  }

  if (command === "start") {
    const { values } = readOptions(rest, {
      session: { type: "string" },
      "input-text": { type: "string" },
      pdf: { type: "string" }
    });

    if (values["input-text"]) {
      print(
        await startFromText({
          sessionId: values.session,
          inputText: values["input-text"]
        })
      );
      return;
    }

    if (values.pdf) {
      print(
        await startFromPdf({
          sessionId: values.session,
          pdfPath: values.pdf
        })
      );
      return;
    }

    throw new Error("start requires --input-text or --pdf");
  }

  if (command === "reply") {
    const { values } = readOptions(rest, {
      session: { type: "string" },
      message: { type: "string" }
    });
    if (!values.session || !values.message) {
      throw new Error("reply requires --session and --message");
    }
    print(
      await replyToSession({
        sessionId: values.session,
        message: values.message
      })
    );
    return;
  }

  if (command === "generate") {
    const { values } = readOptions(rest, {
      session: { type: "string" },
      count: { type: "string" }
    });
    if (!values.session) {
      throw new Error("generate requires --session");
    }
    print(
      await generateForSession({
        sessionId: values.session,
        count: values.count
      })
    );
    return;
  }

  if (command === "select") {
    const { values } = readOptions(rest, {
      session: { type: "string" },
      ids: { type: "string" }
    });
    if (!values.session || !values.ids) {
      throw new Error("select requires --session and --ids");
    }
    print(
      await saveSelection({
        sessionId: values.session,
        ids: values.ids
      })
    );
    return;
  }

  if (command === "ppt") {
    const { values } = readOptions(rest, {
      session: { type: "string" },
      output: { type: "string" }
    });
    if (!values.session) {
      throw new Error("ppt requires --session");
    }
    print(
      await buildPptForSession({
        sessionId: values.session,
        outputPath: values.output
      })
    );
    return;
  }

  if (command === "status") {
    const { values } = readOptions(rest, {
      session: { type: "string" }
    });
    if (!values.session) {
      throw new Error("status requires --session");
    }
    print({
      session: await loadSession(values.session)
    });
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
