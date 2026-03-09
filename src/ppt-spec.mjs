import { parsePptSpec } from "./schema.mjs";

function joinOrFallback(items, fallback) {
  return items.length > 0 ? items.join("、") : fallback;
}

function normalizeProposalTitle(theme) {
  return theme.endsWith("提案") ? theme : `${theme}面料提案`;
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

function createNarrativeSlide(session, selected) {
  const moodAssets = selected.slice(0, 3).map((candidate, index) => ({
    id: `${candidate.id}-mood-${index + 1}`,
    type: index === 0 ? "hero_model" : "mood_image",
    path: candidate.imagePath,
    caption: candidate.title,
    priority: index === 0 ? "primary" : "secondary",
    aspectRatio: "portrait",
    tags: ["candidate", candidate.id]
  }));

  const narrativeLines = [
    `风格关键词：${joinOrFallback(session.brief.styleKeywords, "未指定")}`,
    `材质方向：${joinOrFallback(session.brief.materialDirection, "待明确")}`,
    `肌理与整理：${joinOrFallback(session.brief.textureAndFinish, "待明确")}`,
    `性能：${joinOrFallback(session.brief.performance, "待明确")}`
  ];

  return {
    slideType: session.sourceType === "pdf" ? "inspiration_moodboard" : "summary",
    title: session.sourceType === "pdf" ? "INSPIRATION" : "需求与策略摘要",
    subtitle: session.brief.summary,
    body: narrativeLines,
    imagePath: moodAssets[0]?.path || "",
    layoutIntent: {
      visualFocus: "hero_story",
      density: moodAssets.length >= 3 ? "dense" : "medium",
      composition:
        session.sourceType === "pdf" ? "collage_with_copy" : "left_text_right_image"
    },
    assets: moodAssets,
    textBlocks: [
      {
        role: "section_label",
        content: session.sourceType === "pdf" ? "INSPIRATION" : "SUMMARY",
        emphasis: "strong"
      },
      {
        role: "body",
        content: narrativeLines.join("；"),
        emphasis: "normal"
      }
    ],
    notes: {
      pageFamily: session.sourceType === "pdf" ? "moodboard" : "summary"
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
      density: "medium",
      composition: "banded_color_story"
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

function createComparisonSlide(selected) {
  if (selected.length < 2) {
    return null;
  }

  return {
    slideType: "comparison_board",
    title: "OPTION BOARD",
    subtitle: "候选方向对比",
    body: selected.slice(0, 4).map((candidate) => `${candidate.id} ${candidate.title}`),
    imagePath: selected[0]?.imagePath || "",
    layoutIntent: {
      visualFocus: "product_mix",
      density: selected.length >= 4 ? "dense" : "medium",
      composition: "grid_showcase"
    },
    assets: selected.slice(0, 4).map((candidate, index) => ({
      id: `${candidate.id}-comparison-${index + 1}`,
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
        content: "OPTION BOARD",
        emphasis: "hero"
      },
      {
        role: "small_note",
        content: "用于飞书端快速编号选择与比较。",
        emphasis: "muted"
      }
    ],
    notes: {
      pageFamily: "comparison"
    }
  };
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
      density: "medium",
      composition: "split_story"
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

function createClosingSlide(session) {
  return {
    slideType: "closing",
    title: "Thank you",
    subtitle: "",
    body: [
      "如需继续细化颜色、性能、预算或应用场景，可在当前会话内继续补充。",
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
  const selected =
    session.selectedIds.length > 0
      ? session.candidates.filter((item) => session.selectedIds.includes(item.id))
      : session.candidates.slice(0, 2);

  return parsePptSpec({
    title: normalizeProposalTitle(session.brief.theme),
    subject: "Material proposal",
    slides: [
      createCoverSlide(session, selected),
      createNarrativeSlide(session, selected),
      createColorSlide(session, selected),
      createComparisonSlide(selected),
      ...selected.map((candidate, index) =>
        createShowcaseSlide(session, candidate, index)
      ),
      createClosingSlide(session)
    ].filter(Boolean)
  });
}
