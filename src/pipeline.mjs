import path from "node:path";
import { analyzeBrief, appendClarificationToInput, buildClarifications } from "./brief.mjs";
import { getConfig } from "./config.mjs";
import { writeJson } from "./fs-utils.mjs";
import { generateCandidates, formatCandidateMessage } from "./image.mjs";
import { exportPpt } from "./ppt.mjs";
import { extractPdfText } from "./pdf.mjs";
import { initSession, loadSession, saveSession } from "./state.mjs";

export async function startFromText({ sessionId, inputText }) {
  const brief = await analyzeBrief(inputText, "text");
  const clarifications = buildClarifications(brief);
  const session = await initSession({
    sessionId,
    sourceType: "text",
    inputText,
    brief,
    clarifications
  });
  return {
    session,
    message:
      clarifications.length > 0
        ? clarifications.map((item) => item.question).join("\n")
        : "需求已解析完成，可以继续生成面料方向。"
  };
}

export async function startFromPdf({ sessionId, pdfPath }) {
  const extractedText = await extractPdfText(pdfPath);
  const brief = await analyzeBrief(extractedText, "pdf");
  const clarifications = buildClarifications(brief);
  const session = await initSession({
    sessionId,
    sourceType: "pdf",
    pdfPath,
    extractedText,
    brief,
    clarifications
  });
  return {
    session,
    message:
      clarifications.length > 0
        ? clarifications.map((item) => item.question).join("\n")
        : "PDF 已解析完成，可以继续生成面料方向。"
  };
}

export async function replyToSession({ sessionId, message }) {
  const session = await loadSession(sessionId);
  const mergedInput = appendClarificationToInput(session, message);
  const brief = await analyzeBrief(mergedInput, session.sourceType);
  const clarifications = buildClarifications(brief);

  const updated = await saveSession({
    ...session,
    brief,
    clarifications,
    clarificationHistory: [
      ...session.clarificationHistory,
      {
        at: new Date().toISOString(),
        message
      }
    ],
    status:
      clarifications.length > 0 ? "clarification_needed" : "ready_for_generation"
  });

  return {
    session: updated,
    message:
      clarifications.length > 0
        ? clarifications.map((item) => item.question).join("\n")
        : "补充信息已合并，可以继续生成面料方向。"
  };
}

export async function generateForSession({ sessionId, count }) {
  const session = await loadSession(sessionId);
  const nextCount = Number(count || getConfig().defaultCount);
  const candidates = await generateCandidates(session, nextCount);
  const updated = await saveSession({
    ...session,
    candidates,
    status: "candidates_ready"
  });

  await writeJson(
    path.join(getConfig().stateDir, sessionId, "candidates.json"),
    candidates
  );

  return {
    session: updated,
    message: formatCandidateMessage(updated)
  };
}

export async function saveSelection({ sessionId, ids }) {
  const session = await loadSession(sessionId);
  const selectedIds = ids
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const updated = await saveSession({
    ...session,
    selectedIds,
    status: "selection_saved"
  });

  return {
    session: updated,
    message: `已记录选择：${selectedIds.join("、") || "无"}`
  };
}

export async function buildPptForSession({ sessionId, outputPath }) {
  const session = await loadSession(sessionId);
  const target =
    outputPath ||
    path.join(getConfig().stateDir, sessionId, `${session.brief.theme}-proposal.pptx`);
  const pptPath = await exportPpt(session, target);
  const updated = await saveSession({
    ...session,
    pptPath,
    status: "ppt_generated"
  });
  return {
    session: updated,
    message: `PPT 已生成：${pptPath}`
  };
}
