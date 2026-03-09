import { parsePptSpec } from "./schema.mjs";

function joinOrFallback(items, fallback) {
  return items.length > 0 ? items.join("、") : fallback;
}

function normalizeProposalTitle(theme) {
  return theme.endsWith("提案") ? theme : `${theme}面料提案`;
}

export function buildPptSpec(session) {
  const selected =
    session.selectedIds.length > 0
      ? session.candidates.filter((item) => session.selectedIds.includes(item.id))
      : session.candidates.slice(0, 2);

  return parsePptSpec({
    title: normalizeProposalTitle(session.brief.theme),
    subject: "Material proposal",
    slides: [
      {
        slideType: "cover",
        title: normalizeProposalTitle(session.brief.theme),
        subtitle: session.brief.summary,
        body: [
          `受众：${session.brief.audience}`,
          `用途：${joinOrFallback(session.brief.useCases, "未指定")}`,
          `日期：${new Date().toLocaleDateString("zh-CN")}`
        ],
        notes: {
          coverTitle: normalizeProposalTitle(session.brief.theme),
          coverAudience: `受众：${session.brief.audience}`,
          coverUseCases: `用途：${joinOrFallback(session.brief.useCases, "未指定")}`,
          coverDate: new Date().toLocaleDateString("zh-CN")
        }
      },
      {
        slideType: "summary",
        title: "需求与策略摘要",
        subtitle: session.brief.summary,
        body: [
          `主题：${session.brief.theme}`,
          `材质方向：${joinOrFallback(session.brief.materialDirection, "待明确")}`,
          `色彩：${joinOrFallback(session.brief.colorPalette, "待明确")}`,
          `肌理与整理：${joinOrFallback(session.brief.textureAndFinish, "待明确")}`,
          `性能：${joinOrFallback(session.brief.performance, "待明确")}`,
          `预算：${session.brief.budget || "未指定"}`,
          `风格关键词：${joinOrFallback(session.brief.styleKeywords, "未指定")}`,
          `约束：${joinOrFallback(session.brief.constraints, "未指定")}`,
          `排除项：${joinOrFallback(session.brief.exclusions, "无")}`
        ],
        notes: {
          summaryTitle: "需求与策略摘要",
          summarySummary: session.brief.summary,
          summaryLeft: [
            `主题：${session.brief.theme}`,
            `材质方向：${joinOrFallback(session.brief.materialDirection, "待明确")}`,
            `色彩：${joinOrFallback(session.brief.colorPalette, "待明确")}`,
            `肌理与整理：${joinOrFallback(session.brief.textureAndFinish, "待明确")}`,
            `性能：${joinOrFallback(session.brief.performance, "待明确")}`,
            `预算：${session.brief.budget || "未指定"}`
          ].join("\n"),
          summaryRight: [
            `风格关键词：${joinOrFallback(session.brief.styleKeywords, "未指定")}`,
            `约束：${joinOrFallback(session.brief.constraints, "未指定")}`,
            `排除项：${joinOrFallback(session.brief.exclusions, "无")}`
          ].join("\n")
        }
      },
      ...selected.map((candidate) => ({
        slideType: "candidate",
        title: candidate.title,
        subtitle: candidate.description,
        imagePath: candidate.imagePath,
        body: [
          `编号：${candidate.id}`,
          ...candidate.sellingPoints,
          `提示词摘要：${candidate.prompt.slice(0, 120)}...`
        ],
        notes: {
          candidateTitle: candidate.title,
          candidateDescription: candidate.description,
          candidateBullets: [
            `编号：${candidate.id}`,
            ...candidate.sellingPoints,
            `提示词摘要：${candidate.prompt.slice(0, 120)}...`
          ].join("\n")
        }
      })),
      {
        slideType: "closing",
        title: "感谢查看",
        subtitle: "",
        body: ["如需继续细化颜色、性能或预算区间，可在当前会话内继续补充。"],
        notes: {
          closingTitle: "感谢查看",
          closingBody: "如需继续细化颜色、性能或预算区间，可在当前会话内继续补充。"
        }
      }
    ]
  });
}
