import path from "node:path";
import PptxGenJS from "pptxgenjs";
import { ensureDir } from "./fs-utils.mjs";

function addTitle(slide, title, subtitle = "") {
  slide.addText(title, {
    x: 0.6,
    y: 0.4,
    w: 8.6,
    h: 0.5,
    fontFace: "Aptos",
    fontSize: 24,
    bold: true,
    color: "143534"
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6,
      y: 0.95,
      w: 8.8,
      h: 0.35,
      fontFace: "Aptos",
      fontSize: 11,
      color: "47615D"
    });
  }
}

function addBullets(slide, items, opts = {}) {
  slide.addText(
    items.map((text) => ({ text, options: { bullet: { indent: 14 } } })),
    {
      x: opts.x || 0.8,
      y: opts.y || 1.4,
      w: opts.w || 4.2,
      h: opts.h || 3.5,
      fontFace: "Aptos",
      fontSize: 14,
      color: "143534",
      breakLine: true
    }
  );
}

export async function exportPpt(session, outputPath) {
  await ensureDir(path.dirname(outputPath));

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "material-proposal-agent";
  pptx.subject = "Material proposal";
  pptx.title = `${session.brief.theme}提案`;
  pptx.company = "OpenClaw";
  pptx.lang = "zh-CN";
  pptx.theme = {
    headFontFace: "Aptos",
    bodyFontFace: "Aptos",
    lang: "zh-CN"
  };

  const selected =
    session.selectedIds.length > 0
      ? session.candidates.filter((item) => session.selectedIds.includes(item.id))
      : session.candidates.slice(0, 2);

  {
    const slide = pptx.addSlide();
    slide.background = { color: "F7F2E7" };
    slide.addText(`${session.brief.theme}面料提案`, {
      x: 0.7,
      y: 1.2,
      w: 8.8,
      h: 0.8,
      fontFace: "Aptos",
      fontSize: 28,
      bold: true,
      color: "143534"
    });
    slide.addText(`受众：${session.brief.audience}`, {
      x: 0.7,
      y: 2.15,
      w: 5.2,
      h: 0.4,
      fontSize: 15,
      color: "47615D"
    });
    slide.addText(`用途：${session.brief.useCases.join(" / ") || "未指定"}`, {
      x: 0.7,
      y: 2.55,
      w: 6.4,
      h: 0.4,
      fontSize: 15,
      color: "47615D"
    });
    slide.addText(new Date().toLocaleDateString("zh-CN"), {
      x: 0.7,
      y: 3.2,
      w: 2.4,
      h: 0.35,
      fontSize: 12,
      color: "47615D"
    });
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFDF7" };
    addTitle(slide, "需求与策略摘要", session.brief.summary);
    addBullets(slide, [
      `主题：${session.brief.theme}`,
      `材质方向：${session.brief.materialDirection.join("、") || "待明确"}`,
      `色彩：${session.brief.colorPalette.join("、") || "待明确"}`,
      `肌理与整理：${session.brief.textureAndFinish.join("、") || "待明确"}`,
      `性能：${session.brief.performance.join("、") || "待明确"}`,
      `预算：${session.brief.budget || "未指定"}`
    ]);
    addBullets(
      slide,
      [
        `风格关键词：${session.brief.styleKeywords.join("、") || "未指定"}`,
        `约束：${session.brief.constraints.join("、") || "未指定"}`,
        `排除项：${session.brief.exclusions.join("、") || "无"}`
      ],
      { x: 6.0, y: 1.4, w: 6.4, h: 2.8 }
    );
  }

  for (const candidate of selected) {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFDF7" };
    addTitle(slide, candidate.title, candidate.description);
    slide.addImage({
      path: candidate.imagePath,
      x: 0.7,
      y: 1.5,
      w: 6.0,
      h: 4.8,
      contain: true
    });
    addBullets(
      slide,
      [
        `编号：${candidate.id}`,
        ...candidate.sellingPoints,
        `提示词摘要：${candidate.prompt.slice(0, 120)}...`
      ],
      { x: 7.0, y: 1.7, w: 5.5, h: 4.4 }
    );
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: "F7F2E7" };
    slide.addText("感谢查看", {
      x: 0.7,
      y: 1.3,
      w: 4,
      h: 0.7,
      fontFace: "Aptos",
      fontSize: 26,
      bold: true,
      color: "143534"
    });
    slide.addText("如需继续细化颜色、性能或预算区间，可在当前会话内继续补充。", {
      x: 0.7,
      y: 2.1,
      w: 6.8,
      h: 0.5,
      fontSize: 16,
      color: "47615D"
    });
  }

  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}
