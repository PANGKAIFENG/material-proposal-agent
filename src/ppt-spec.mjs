import { parsePptSpec } from "./schema.mjs";

function joinOrFallback(items, fallback) {
  return items.length > 0 ? items.join("、") : fallback;
}

function normalizeProposalTitle(theme) {
  return theme.endsWith("提案") ? theme : `${theme}面料提案`;
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function groupCandidatesForComparison(items) {
  if (items.length <= 4) {
    return [items];
  }
  if (items.length <= 6) {
    return chunk(items, 3);
  }
  return chunk(items, 4);
}

function buildPaletteAssets(colors) {
  return colors.slice(0, 5).map((color, index) => ({
    id: `palette-${index + 1}`,
    type: "palette_chip",
    path: "",
    caption: color,
    priority: index === 0 ? "primary" : "accent",
    tags: ["palette"]
  }));
}

function selectCandidates(session) {
  const selected =
    session.selectedIds.length > 0
      ? session.candidates.filter((item) => session.selectedIds.includes(item.id))
      : session.candidates.slice(0, 4);

  return selected.length > 0 ? selected : session.candidates.slice(0, 2);
}

function decideShowcaseLimit(selectedCount) {
  if (selectedCount <= 2) {
    return selectedCount;
  }
  if (selectedCount <= 4) {
    return 3;
  }
  return 4;
}

function createCoverSlide(session, selected) {
  const hero = selected[0];
  const title = normalizeProposalTitle(session.brief.theme);
  return {
    slideType: "cover",
    title,
    subtitle: session.brief.summary,
    body: [
      `受众：${session.brief.audience}`,
      `用途：${joinOrFallback(session.brief.useCases, "未指定")}`,
      `日期：${new Date().toLocaleDateString("zh-CN")}`
    ],
    imagePath: hero?.imagePath || "",
    layoutIntent: {
      visualFocus: "hero_story",
      density: "light",
      composition: "centered_cover"
    },
    assets: [
      ...(hero
        ? [
            {
              id: `${hero.id}-cover`,
              type: "hero_model",
              path: hero.imagePath,
              caption: hero.title,
              priority: "primary",
              aspectRatio: "portrait",
              tags: ["candidate", hero.id]
            }
          ]
        : []),
      ...buildPaletteAssets(session.brief.colorPalette)
    ],
    textBlocks: [
      {
        role: "title",
        content: title,
        emphasis: "hero"
      },
      ...(session.brief.summary
        ? [
            {
              role: "subtitle",
              content: session.brief.summary,
              emphasis: "muted"
            }
          ]
        : []),
      {
        role: "small_note",
        content: `用途：${joinOrFallback(session.brief.useCases, "未指定")}`,
        emphasis: "muted"
      }
    ],
    notes: {
      pageFamily: "cover"
    }
  };
}

function createMoodboardSlide(session, selected) {
  const moodAssets = selected.slice(0, 3).map((candidate, index) => ({
    id: `${candidate.id}-mood-${index + 1}`,
    type: index === 0 ? "hero_model" : "mood_image",
    path: candidate.imagePath,
    caption: candidate.title,
    priority: index === 0 ? "primary" : "secondary",
    aspectRatio: "portrait",
    tags: ["candidate", candidate.id]
  }));

  return {
    slideType: "inspiration_moodboard",
    title: "INSPIRATION",
    subtitle: session.brief.summary,
    body: [
      `风格关键词：${joinOrFallback(session.brief.styleKeywords, "未指定")}`,
      `材质方向：${joinOrFallback(session.brief.materialDirection, "待明确")}`,
      `肌理与整理：${joinOrFallback(session.brief.textureAndFinish, "待明确")}`
    ],
    imagePath: moodAssets[0]?.path || "",
    layoutIntent: {
      visualFocus: "hero_story",
      density:
        moodAssets.length >= 3 ? "dense" : moodAssets.length === 2 ? "medium" : "light",
      composition:
        moodAssets.length >= 2 ? "collage_with_copy" : "left_text_right_image"
    },
    assets: moodAssets,
    textBlocks: [
      {
        role: "section_label",
        content: "INSPIRATION",
        emphasis: "strong"
      },
      {
        role: "body",
        content: [
          `风格关键词：${joinOrFallback(session.brief.styleKeywords, "未指定")}`,
          `材质方向：${joinOrFallback(session.brief.materialDirection, "待明确")}`,
          `肌理与整理：${joinOrFallback(session.brief.textureAndFinish, "待明确")}`
        ].join("；"),
        emphasis: "normal"
      }
    ],
    notes: {
      pageFamily: "moodboard"
    }
  };
}

function createSummarySlide(session, selected) {
  const summaryAssets = selected.slice(0, 2).map((candidate, index) => ({
    id: `${candidate.id}-summary-${index + 1}`,
    type: index === 0 ? "hero_model" : "supporting_image",
    path: candidate.imagePath,
    caption: candidate.title,
    priority: index === 0 ? "primary" : "secondary",
    aspectRatio: "portrait",
    tags: ["candidate", candidate.id]
  }));

  const summaryLines = [
    `主题：${session.brief.theme}`,
    `风格关键词：${joinOrFallback(session.brief.styleKeywords, "未指定")}`,
    `材质方向：${joinOrFallback(session.brief.materialDirection, "待明确")}`,
    `肌理与整理：${joinOrFallback(session.brief.textureAndFinish, "待明确")}`,
    `性能：${joinOrFallback(session.brief.performance, "待明确")}`,
    `预算：${session.brief.budget || "未指定"}`,
    `约束：${joinOrFallback(session.brief.constraints, "未指定")}`,
    `排除项：${joinOrFallback(session.brief.exclusions, "无")}`
  ];

  return {
    slideType: "summary",
    title: "需求与策略摘要",
    subtitle: session.brief.summary,
    body: summaryLines,
    imagePath: summaryAssets[0]?.path || "",
    layoutIntent: {
      visualFocus: "hero_story",
      density: summaryAssets.length >= 2 ? "medium" : "light",
      composition: "left_text_right_image"
    },
    assets: [...summaryAssets, ...buildPaletteAssets(session.brief.colorPalette)],
    textBlocks: [
      {
        role: "section_label",
        content: "SUMMARY",
        emphasis: "strong"
      },
      {
        role: "body",
        content: summaryLines.join("；"),
        emphasis: "normal"
      }
    ],
    notes: {
      pageFamily: "summary"
    }
  };
}

function createColorSlide(session, selected) {
  if (session.brief.colorPalette.length === 0) {
    return null;
  }

  const moodAssets = selected.slice(0, 3).map((candidate, index) => ({
    id: `${candidate.id}-color-${index + 1}`,
    type: index === 0 ? "supporting_image" : "mood_image",
    path: candidate.imagePath,
    caption: candidate.title,
    priority: index === 0 ? "primary" : "secondary",
    aspectRatio: "square",
    tags: ["candidate", candidate.id, "palette-reference"]
  }));

  return {
    slideType: "color_reference",
    title: "COLOR REFERENCE",
    subtitle: joinOrFallback(session.brief.colorPalette, "待明确"),
    body: [
      `主题：${session.brief.theme}`,
      `色彩建议：${joinOrFallback(session.brief.colorPalette, "待明确")}`
    ],
    imagePath: moodAssets[0]?.path || "",
    layoutIntent: {
      visualFocus: "color_story",
      density:
        moodAssets.length >= 3 ? "dense" : moodAssets.length >= 1 ? "medium" : "light",
      composition:
        moodAssets.length >= 2 ? "banded_color_story" : "left_text_right_image"
    },
    assets: [...moodAssets, ...buildPaletteAssets(session.brief.colorPalette)],
    textBlocks: [
      {
        role: "section_label",
        content: "COLOR REFERENCE",
        emphasis: "strong"
      },
      {
        role: "body",
        content: `建议围绕 ${joinOrFallback(session.brief.colorPalette, "核心主色")} 建立系列色盘。`,
        emphasis: "normal"
      }
    ],
    notes: {
      pageFamily: "color-reference"
    }
  };
}

function createComparisonSlides(selected) {
  if (selected.length < 2) {
    return [];
  }

  return groupCandidatesForComparison(selected)
    .filter((group) => group.length > 1)
    .map((group, groupIndex, groups) => ({
    slideType: "comparison_board",
    title:
      groups.length > 1
        ? `OPTION BOARD ${groupIndex + 1}`
        : "OPTION BOARD",
    subtitle:
      groups.length > 1
        ? `候选方向对比 ${groupIndex + 1}/${groups.length}`
        : "候选方向对比",
    body: group.map((candidate) => `${candidate.id} ${candidate.title}`),
    imagePath: group[0]?.imagePath || "",
    layoutIntent: {
      visualFocus: "product_mix",
      density:
        group.length >= 4 ? "dense" : group.length === 3 ? "medium" : "light",
      composition: "grid_showcase"
    },
    assets: group.map((candidate, index) => ({
      id: `${candidate.id}-comparison-${groupIndex + 1}-${index + 1}`,
      type: "supporting_image",
      path: candidate.imagePath,
      caption: `${candidate.id} ${candidate.title}`,
      priority: index === 0 ? "primary" : "secondary",
      aspectRatio: "square",
      tags: ["candidate", candidate.id]
    })),
    textBlocks: [
      {
        role: "title",
        content:
          groups.length > 1
            ? `OPTION BOARD ${groupIndex + 1}`
            : "OPTION BOARD",
        emphasis: "hero"
      },
      {
        role: "small_note",
        content: "用于飞书端快速编号选择与比较。",
        emphasis: "muted"
      }
    ],
    notes: {
      pageFamily: "comparison",
      groupIndex: String(groupIndex + 1)
    }
    }));
}

function createShowcaseSlide(session, candidate, index) {
  const paletteAssets = buildPaletteAssets(session.brief.colorPalette);
  return {
    slideType: "fabric_showcase",
    title: candidate.title,
    subtitle: candidate.description,
    body: [
      `编号：${candidate.id}`,
      ...candidate.sellingPoints,
      `材质方向：${joinOrFallback(session.brief.materialDirection, "待明确")}`
    ],
    imagePath: candidate.imagePath,
    layoutIntent: {
      visualFocus: "fabric_texture",
      density: candidate.sellingPoints.length >= 3 ? "medium" : "light",
      composition: candidate.imagePath ? "split_story" : "left_text_right_image"
    },
    assets: [
      {
        id: `${candidate.id}-swatch`,
        type: "fabric_swatch",
        path: candidate.imagePath,
        caption: candidate.title,
        priority: "primary",
        aspectRatio: "square",
        tags: ["candidate", candidate.id]
      },
      ...paletteAssets
    ],
    textBlocks: [
      {
        role: "title",
        content: candidate.title,
        emphasis: "hero"
      },
      {
        role: "body",
        content: candidate.description,
        emphasis: "normal"
      },
      {
        role: "small_note",
        content: `方向 ${index + 1} / 编号 ${candidate.id}`,
        emphasis: "muted"
      }
    ],
    notes: {
      pageFamily: "showcase",
      candidateId: candidate.id
    }
  };
}

function createShowcaseSlides(session, selected) {
  const showcaseLimit = decideShowcaseLimit(selected.length);
  return selected
    .slice(0, showcaseLimit)
    .map((candidate, index) => createShowcaseSlide(session, candidate, index));
}

function createClosingSlide(session) {
  const selectedCount = session.selectedIds.length || session.candidates.length;
  return {
    slideType: "closing",
    title: "Thank you",
    subtitle: "",
    body: [
      "如需继续细化颜色、性能、预算或应用场景，可在当前会话内继续补充。",
      `本次候选数量：${selectedCount}`,
      `当前主题：${session.brief.theme}`
    ],
    layoutIntent: {
      visualFocus: "hero_story",
      density: "light",
      composition: "centered_cover"
    },
    assets: [],
    textBlocks: [
      {
        role: "title",
        content: "Thank you",
        emphasis: "hero"
      },
      {
        role: "body",
        content: "如需继续细化颜色、性能、预算或应用场景，可在当前会话内继续补充。",
        emphasis: "normal"
      }
    ],
    notes: {
      pageFamily: "closing"
    }
  };
}

export function buildPptSpec(session) {
  const selected = selectCandidates(session);
  const slides = [
    createCoverSlide(session, selected),
    ...(session.sourceType === "pdf" ? [createMoodboardSlide(session, selected)] : []),
    createSummarySlide(session, selected),
    createColorSlide(session, selected),
    ...createComparisonSlides(selected),
    ...createShowcaseSlides(session, selected),
    createClosingSlide(session)
  ].filter(Boolean);

  return parsePptSpec({
    title: normalizeProposalTitle(session.brief.theme),
    subject: "Material proposal",
    slides
  });
}
