import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "./config.mjs";
import { createClient, runJsonTask } from "./llm.mjs";
import { getAssetDir } from "./state.mjs";

function candidateId(index) {
  return `A${index + 1}`;
}

function promptSummary(brief) {
  const parts = [
    brief.theme,
    brief.materialDirection.join(" / "),
    brief.colorPalette.join(" / "),
    brief.textureAndFinish.join(" / "),
    brief.performance.join(" / ")
  ];
  return parts.filter(Boolean).join(" | ");
}

function fallbackCandidates(brief, count) {
  const baseColors =
    brief.colorPalette.length > 0 ? brief.colorPalette : ["亮黄", "草木绿", "棕咖", "米白"];
  const textures =
    brief.textureAndFinish.length > 0
      ? brief.textureAndFinish
      : ["哑光细腻", "轻磨毛", "高密紧实", "柔软垂坠"];

  return Array.from({ length: count }).map((_, index) => ({
    id: candidateId(index),
    title: `${brief.theme}方向 ${index + 1}`,
    description: `围绕${brief.useCases[0] || "面料应用"}场景的${baseColors[index % baseColors.length]} ${textures[index % textures.length]}方向。`,
    prompt: `A premium fashion textile swatch board for ${brief.useCases.join(", ") || "fashion fabric"}, focus on ${brief.materialDirection.join(", ") || "textile innovation"}, ${baseColors[index % baseColors.length]} palette, ${textures[index % textures.length]} finish, photorealistic textile photography, draped fabric details, clean neutral background.`,
    sellingPoints: [
      `色彩方向：${baseColors[index % baseColors.length]}`,
      `材质观感：${textures[index % textures.length]}`,
      `应用场景：${brief.useCases.join("、") || "多场景"}`
    ]
  }));
}

async function buildCandidatePlan(brief, count) {
  const fallback = () => ({ candidates: fallbackCandidates(brief, count) });
  const result = await runJsonTask({
    system:
      "You create material concept directions for an AI proposal. Return JSON with a candidates array. Each item must contain title, description, prompt, and sellingPoints. The directions must stay on fabric, textile texture, finish, drape, and application moodboard. Keep candidate count exactly as requested.",
    user: `Count: ${count}\nBrief summary: ${promptSummary(brief)}`,
    fallback
  });
  return (result.candidates || fallback().candidates).slice(0, count);
}

function placeholderSvg({ title, description, sellingPoints }) {
  const bullets = sellingPoints
    .slice(0, 3)
    .map((item, index) => `<text x="60" y="${240 + index * 36}" font-size="22" fill="#123534">• ${escapeXml(item)}</text>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5f0dd"/>
      <stop offset="100%" stop-color="#d7eadf"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect x="60" y="60" width="904" height="904" rx="42" fill="#fffaf1" stroke="#234b47" stroke-width="6"/>
  <text x="60" y="140" font-size="52" font-weight="700" fill="#123534">${escapeXml(title)}</text>
  <text x="60" y="190" font-size="24" fill="#365c58">${escapeXml(description)}</text>
  <g opacity="0.9">
    <path d="M120 520 C240 420, 380 420, 500 520 S760 620, 900 520" fill="none" stroke="#234b47" stroke-width="20"/>
    <path d="M120 600 C240 500, 380 500, 500 600 S760 700, 900 600" fill="none" stroke="#d8733f" stroke-width="20"/>
    <path d="M120 680 C240 580, 380 580, 500 680 S760 780, 900 680" fill="none" stroke="#d5c25f" stroke-width="20"/>
  </g>
  ${bullets}
</svg>`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function savePlaceholder(assetPath, candidate) {
  const svg = placeholderSvg(candidate);
  await fs.writeFile(assetPath, svg, "utf8");
  return {
    imagePath: assetPath,
    mimeType: "image/svg+xml",
    provider: "placeholder"
  };
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildImageHeaders(config) {
  const headers = { "content-type": "application/json" };
  if (config.imageApiKey) {
    headers.authorization = `Bearer ${config.imageApiKey}`;
  }
  return headers;
}

function normalizeImageResult(data) {
  const payload =
    data?.data?.[0]?.b64_json ||
    data?.data?.[0]?.image_base64 ||
    data?.image_base64 ||
    data?.result?.data?.[0]?.b64_json ||
    data?.result?.data?.[0]?.image_base64 ||
    "";
  const url =
    data?.data?.[0]?.url ||
    data?.url ||
    data?.result?.data?.[0]?.url ||
    data?.result?.url ||
    "";
  const taskId = data?.task_id || data?.id || data?.taskId || "";
  const taskStatus =
    data?.task_status ||
    data?.status ||
    data?.task?.status ||
    data?.result?.task_status ||
    "";
  const errorMessage =
    data?.error?.message ||
    data?.error_message ||
    data?.message ||
    "";

  return {
    b64: payload,
    url,
    taskId,
    taskStatus,
    errorMessage
  };
}

async function pollGeekAiResult(taskId) {
  const config = getConfig();
  const startedAt = Date.now();
  const endpoint = `${config.imageResultBaseUrl.replace(/\/$/, "")}/images/${taskId}`;

  while (Date.now() - startedAt < config.imagePollTimeoutMs) {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: config.imageApiKey
        ? { authorization: `Bearer ${config.imageApiKey}` }
        : {}
    });

    if (!response.ok) {
      throw new Error(`GeekAI result lookup failed with ${response.status}`);
    }

    const data = await response.json();
    const result = normalizeImageResult(data);
    const status = String(result.taskStatus || "").toLowerCase();

    if (result.b64 || result.url) {
      return result;
    }

    if (["succeed", "succeeded", "success", "completed", "done"].includes(status)) {
      return result;
    }

    if (["failed", "error", "cancelled", "canceled"].includes(status)) {
      throw new Error(
        `GeekAI task ${taskId} failed with status ${status}${
          result.errorMessage ? `: ${result.errorMessage}` : ""
        }`
      );
    }

    await sleep(config.imagePollIntervalMs);
  }

  throw new Error(`GeekAI task ${taskId} timed out`);
}

async function callGeekAiImageApi(prompt) {
  const config = getConfig();
  const endpoint = `${config.imageBaseUrl.replace(/\/$/, "")}/images/generations`;
  const body = {
    model: config.imageModel,
    prompt,
    size: config.imageSize,
    aspect_ratio: config.imageAspectRatio,
    quality: config.imageQuality,
    response_format: config.imageResponseFormat,
    output_format: config.imageOutputFormat,
    async: config.imageAsync,
    retries: config.imageRetries
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: buildImageHeaders(config),
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`GeekAI image API failed with ${response.status}`);
  }

  const data = await response.json();
  const result = normalizeImageResult(data);
  const status = String(result.taskStatus || "").toLowerCase();

  if (result.b64 || result.url) {
    return result;
  }

  if (result.errorMessage && ["failed", "error"].includes(status)) {
    throw new Error(result.errorMessage);
  }

  if (
    result.taskId &&
    (config.imageAsync ||
      ["queued", "pending", "processing", "running", "submitted"].includes(status))
  ) {
    return pollGeekAiResult(result.taskId);
  }

  return result;
}

async function callCustomImageApi(prompt) {
  const config = getConfig();
  const response = await fetch(config.imageApiUrl, {
    method: "POST",
    headers: buildImageHeaders(config),
    body: JSON.stringify({
      model: config.imageModel,
      prompt,
      size: config.imageSize,
      aspect_ratio: config.imageAspectRatio,
      quality: config.imageQuality,
      response_format: config.imageResponseFormat,
      output_format: config.imageOutputFormat
    })
  });

  if (!response.ok) {
    throw new Error(`Image API failed with ${response.status}`);
  }

  const data = await response.json();
  return normalizeImageResult(data);
}

async function savePngFromB64(assetPath, payload) {
  const buffer = Buffer.from(payload, "base64");
  await fs.writeFile(assetPath, buffer);
  return {
    imagePath: assetPath,
    mimeType: "image/png",
    provider: "remote"
  };
}

async function saveFromUrl(assetPath, url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image download failed with ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(assetPath, buffer);
  return {
    imagePath: assetPath,
    mimeType: "image/png",
    provider: "remote"
  };
}

async function renderOneCandidate(sessionId, candidate) {
  const assetDir = getAssetDir(sessionId);
  const pngPath = path.join(assetDir, `${candidate.id}.png`);
  const svgPath = path.join(assetDir, `${candidate.id}.svg`);
  const client = createClient();
  const config = getConfig();

  try {
    if (config.imageProvider === "geekai" && config.imageApiKey) {
      const result = await callGeekAiImageApi(candidate.prompt);
      if (result.b64) {
        return savePngFromB64(pngPath, result.b64);
      }
      if (result.url) {
        return saveFromUrl(pngPath, result.url);
      }
    }

    if (
      (config.imageProvider === "custom" ||
        (config.imageProvider === "auto" && config.imageApiUrl)) &&
      config.imageApiUrl
    ) {
      const result = await callCustomImageApi(candidate.prompt);
      if (result.b64) {
        return savePngFromB64(pngPath, result.b64);
      }
      if (result.url) {
        return saveFromUrl(pngPath, result.url);
      }
    }

    if (
      (config.imageProvider === "openai" || config.imageProvider === "auto") &&
      client &&
      config.openAiApiKey
    ) {
      const result = await client.images.generate({
        model: config.imageModel,
        prompt: candidate.prompt,
        size: config.imageSize
      });
      const item = result.data?.[0];
      if (item?.b64_json) {
        return savePngFromB64(pngPath, item.b64_json);
      }
      if (item?.url) {
        return saveFromUrl(pngPath, item.url);
      }
    }
  } catch {
    return savePlaceholder(svgPath, candidate);
  }

  return savePlaceholder(svgPath, candidate);
}

export async function generateCandidates(session, count) {
  const plans = await buildCandidatePlan(session.brief, count);
  const candidates = [];

  for (const [index, plan] of plans.entries()) {
    const candidate = {
      id: candidateId(index),
      title: plan.title || `${session.brief.theme}方向 ${index + 1}`,
      description: plan.description || "",
      prompt: plan.prompt || "",
      sellingPoints: plan.sellingPoints || []
    };
    const image = await renderOneCandidate(session.sessionId, candidate);
    candidates.push({
      ...candidate,
      ...image
    });
  }

  return candidates;
}

export function formatCandidateMessage(session) {
  const lines = [
    `已生成 ${session.candidates.length} 个面料方向，请直接回复编号选择，例如：选 A1 A3。`,
    ""
  ];

  for (const candidate of session.candidates) {
    lines.push(`${candidate.id}｜${candidate.title}`);
    lines.push(candidate.description);
    for (const point of candidate.sellingPoints.slice(0, 3)) {
      lines.push(`- ${point}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
