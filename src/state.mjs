import path from "node:path";
import crypto from "node:crypto";
import { getConfig } from "./config.mjs";
import { ensureDir, readJson, writeJson } from "./fs-utils.mjs";
import { parseSession } from "./schema.mjs";

function nowIso() {
  return new Date().toISOString();
}

export function createSessionId() {
  return crypto.randomUUID().slice(0, 8);
}

export function getSessionDir(sessionId) {
  return path.join(getConfig().stateDir, sessionId);
}

export function getSessionFile(sessionId) {
  return path.join(getSessionDir(sessionId), "state.json");
}

export function getAssetDir(sessionId) {
  return path.join(getSessionDir(sessionId), "assets");
}

export async function saveSession(session) {
  const next = {
    ...session,
    updatedAt: nowIso()
  };
  await ensureDir(getSessionDir(session.sessionId));
  await writeJson(getSessionFile(session.sessionId), next);
  return next;
}

export async function loadSession(sessionId) {
  const session = await readJson(getSessionFile(sessionId));
  return parseSession(session);
}

export async function initSession(payload) {
  const session = parseSession({
    sessionId: payload.sessionId || createSessionId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    sourceType: payload.sourceType,
    inputText: payload.inputText || "",
    pdfPath: payload.pdfPath || "",
    extractedText: payload.extractedText || "",
    brief: payload.brief,
    clarifications: payload.clarifications || [],
    clarificationHistory: [],
    candidates: [],
    selectedIds: [],
    pptPath: "",
    status:
      payload.clarifications && payload.clarifications.length > 0
        ? "clarification_needed"
        : "ready_for_generation"
  });
  await ensureDir(getAssetDir(session.sessionId));
  return saveSession(session);
}
