import os from "node:os";
import path from "node:path";

export function getConfig() {
  return {
    openAiApiKey: process.env.MPA_OPENAI_API_KEY || "",
    openAiBaseUrl: process.env.MPA_OPENAI_BASE_URL || "",
    chatModel: process.env.MPA_CHAT_MODEL || "gpt-4.1-mini",
    imageModel: process.env.MPA_IMAGE_MODEL || "gpt-image-1",
    imageApiUrl: process.env.MPA_IMAGE_API_URL || "",
    imageApiKey: process.env.MPA_IMAGE_API_KEY || "",
    stateDir:
      process.env.MPA_STATE_DIR ||
      path.join(os.homedir(), ".material-proposal-agent", "sessions"),
    defaultCount: Number(process.env.MPA_DEFAULT_COUNT || "4")
  };
}
