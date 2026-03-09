import OpenAI from "openai";
import { getConfig } from "./config.mjs";

export function hasChatModel() {
  return Boolean(getConfig().openAiApiKey);
}

export function createClient() {
  const config = getConfig();
  if (!config.openAiApiKey) {
    return null;
  }

  return new OpenAI({
    apiKey: config.openAiApiKey,
    baseURL: config.openAiBaseUrl || undefined
  });
}

export async function runJsonTask({ system, user, fallback }) {
  const client = createClient();
  if (!client) {
    return fallback();
  }

  try {
    const response = await client.chat.completions.create({
      model: getConfig().chatModel,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });
    const content = response.choices?.[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch {
    return fallback();
  }
}
