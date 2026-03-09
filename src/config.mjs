import os from "node:os";
import path from "node:path";

export function getConfig() {
  return {
    openAiApiKey: process.env.MPA_OPENAI_API_KEY || "",
    openAiBaseUrl: process.env.MPA_OPENAI_BASE_URL || "",
    chatModel: process.env.MPA_CHAT_MODEL || "gpt-4.1-mini",
    imageProvider: process.env.MPA_IMAGE_PROVIDER || "geekai",
    imageModel: process.env.MPA_IMAGE_MODEL || "gpt-image-1",
    imageBaseUrl:
      process.env.MPA_IMAGE_BASE_URL || "https://geekai.co/api/v1",
    imageResultBaseUrl:
      process.env.MPA_IMAGE_RESULT_BASE_URL ||
      process.env.MPA_IMAGE_BASE_URL ||
      "https://geekai.co/api/v1",
    imageApiUrl: process.env.MPA_IMAGE_API_URL || "",
    imageApiKey: process.env.MPA_IMAGE_API_KEY || "",
    imageSize: process.env.MPA_IMAGE_SIZE || "1024x1024",
    imageAspectRatio: process.env.MPA_IMAGE_ASPECT_RATIO || "1:1",
    imageQuality: process.env.MPA_IMAGE_QUALITY || "medium",
    imageResponseFormat:
      process.env.MPA_IMAGE_RESPONSE_FORMAT || "url",
    imageOutputFormat: process.env.MPA_IMAGE_OUTPUT_FORMAT || "png",
    imageAsync:
      (process.env.MPA_IMAGE_ASYNC || "true").toLowerCase() !== "false",
    imageRetries: Number(process.env.MPA_IMAGE_RETRIES || "0"),
    imagePollIntervalMs: Number(
      process.env.MPA_IMAGE_POLL_INTERVAL_MS || "2500"
    ),
    imagePollTimeoutMs: Number(
      process.env.MPA_IMAGE_POLL_TIMEOUT_MS || "120000"
    ),
    stateDir:
      process.env.MPA_STATE_DIR ||
      path.join(os.homedir(), ".material-proposal-agent", "sessions"),
    defaultCount: Number(process.env.MPA_DEFAULT_COUNT || "4")
  };
}
