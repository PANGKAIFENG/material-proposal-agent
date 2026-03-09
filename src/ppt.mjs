import path from "node:path";
import Automizer, {
  ModifyImageHelper,
  modify
} from "pptx-automizer";
import PptxGenJS from "pptxgenjs";
import { getConfig } from "./config.mjs";
import { ensureDir } from "./fs-utils.mjs";
import { buildPptSpec } from "./ppt-spec.mjs";

function addTitle(slide, title, subtitle = "", options = {}) {
  slide.addText(title, {
    x: options.x ?? 0.6,
    y: options.y ?? 0.4,
    w: options.w ?? 8.6,
    h: options.h ?? 0.5,
    fontFace: options.fontFace || "Times New Roman",
    fontSize: options.fontSize || 24,
    bold: options.bold ?? true,
    color: options.color || "1F1712"
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: options.subtitleX ?? options.x ?? 0.6,
      y: options.subtitleY ?? ((options.y ?? 0.4) + 0.55),
      w: options.subtitleW ?? 8.8,
      h: options.subtitleH ?? 0.35,
      fontFace: options.subtitleFontFace || "Aptos",
      fontSize: options.subtitleFontSize || 11,
      color: options.subtitleColor || "6A625C"
    });
  }
}

function addBullets(slide, items, opts = {}) {
  if (!items || items.length === 0) {
    return;
  }
  slide.addText(
    items.map((text) => ({ text, options: { bullet: { indent: 14 } } })),
    {
      x: opts.x || 0.8,
      y: opts.y || 1.4,
      w: opts.w || 4.2,
      h: opts.h || 3.5,
      fontFace: "Aptos",
      fontSize: opts.fontSize || 14,
      color: opts.color || "2B2621",
      breakLine: true
    }
  );
}

function addBodyText(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.8,
    y: opts.y ?? 1.4,
    w: opts.w ?? 4.4,
    h: opts.h ?? 1.8,
    fontFace: opts.fontFace || "Aptos",
    fontSize: opts.fontSize || 14,
    color: opts.color || "3F3933",
    breakLine: true,
    valign: opts.valign || "top",
    margin: opts.margin ?? 0
  });
}

function getAssetsByType(slideSpec, types) {
  return (slideSpec.assets || []).filter(
    (asset) => types.includes(asset.type) && asset.path
  );
}

function getPaletteAssets(slideSpec) {
  return (slideSpec.assets || []).filter((asset) => asset.type === "palette_chip");
}

function addImage(slide, asset, opts = {}) {
  if (!asset?.path) {
    return;
  }
  slide.addImage({
    path: asset.path,
    x: opts.x,
    y: opts.y,
    w: opts.w,
    h: opts.h,
    contain: opts.contain ?? true
  });
  if (opts.caption && asset.caption) {
    slide.addText(asset.caption, {
      x: opts.x,
      y: opts.y + opts.h + 0.08,
      w: opts.w,
      h: 0.24,
      fontFace: "Aptos",
      fontSize: 8,
      color: "6A625C",
      align: opts.captionAlign || "left"
    });
  }
}

function normalizeHexColor(input) {
  const value = (input || "").trim().replace("#", "");
  return /^[0-9a-fA-F]{6}$/.test(value) ? value.toUpperCase() : "";
}

function addPaletteChips(pptx, slide, assets, opts = {}) {
  const startX = opts.x ?? 0.8;
  const y = opts.y ?? 6.45;
  const size = opts.size ?? 0.24;
  const gap = opts.gap ?? 0.1;

  assets.slice(0, 6).forEach((asset, index) => {
    const x = startX + index * (size + gap);
    const hex = normalizeHexColor(asset.caption);
    if (hex) {
      slide.addShape(pptx.ShapeType.ellipse, {
        x,
        y,
        w: size,
        h: size,
        line: { color: hex, transparency: 100 },
        fill: { color: hex }
      });
    } else {
      slide.addText(asset.caption || "", {
        x,
        y: y - 0.02,
        w: 0.8,
        h: 0.24,
        fontFace: "Aptos",
        fontSize: 8,
        color: "6A625C",
        margin: 0,
        fill: { color: "F3EEE6" },
        line: { color: "D6CDC0", pt: 0.6 },
        align: "center",
        valign: "mid"
      });
    }
  });
}

function renderCoverSlide(pptx, slide, slideSpec) {
  slide.background = { color: "F4EEE4" };
  const hero =
    getAssetsByType(slideSpec, ["hero_model", "mood_image", "supporting_image"])[0];
  if (hero) {
    addImage(slide, hero, {
      x: 7.2,
      y: 0.85,
      w: 5.55,
      h: 5.85,
      contain: true
    });
  }
  slide.addText("MATERIAL PROPOSAL", {
    x: 0.75,
    y: 0.55,
    w: 3.6,
    h: 0.24,
    fontFace: "Aptos",
    fontSize: 9,
    color: "8A7D70",
    charSpace: 2
  });
  addTitle(slide, slideSpec.title, slideSpec.subtitle, {
    x: 0.75,
    y: 1.45,
    w: 5.6,
    h: 1,
    fontSize: 28
  });
  addBodyText(slide, slideSpec.body.join("\n"), {
    x: 0.8,
    y: 2.95,
    w: 4.6,
    h: 1.7,
    fontSize: 14,
    color: "5B524A"
  });
  addPaletteChips(pptx, slide, getPaletteAssets(slideSpec), { x: 0.8, y: 6.65 });
}

function renderSummarySlide(pptx, slide, slideSpec) {
  slide.background = { color: "FCF8F1" };
  addTitle(slide, slideSpec.title, slideSpec.subtitle, {
    x: 0.7,
    y: 0.55,
    w: 5.6,
    fontSize: 22
  });

  const hero = getAssetsByType(slideSpec, ["hero_model", "mood_image"])[0];
  if (hero) {
    addImage(slide, hero, {
      x: 7.75,
      y: 0.95,
      w: 4.5,
      h: 5.2,
      contain: true
    });
  }

  addBullets(slide, slideSpec.body.slice(0, 5), {
    x: 0.8,
    y: 1.55,
    w: 5.4,
    h: 3.2,
    fontSize: 13
  });
  addBullets(slide, slideSpec.body.slice(5), {
    x: 0.8,
    y: 4.55,
    w: 5.4,
    h: 1.6,
    fontSize: 13
  });
  addPaletteChips(pptx, slide, getPaletteAssets(slideSpec), { x: 0.8, y: 6.55 });
}

function renderMoodboardSlide(pptx, slide, slideSpec) {
  slide.background = { color: "FAF5EC" };
  slide.addText(slideSpec.title || "INSPIRATION", {
    x: 0.7,
    y: 0.55,
    w: 2.5,
    h: 0.28,
    fontFace: "Aptos",
    fontSize: 10,
    bold: true,
    color: "7D6F63",
    charSpace: 1.2
  });
  addBodyText(slide, slideSpec.subtitle || "", {
    x: 0.7,
    y: 0.92,
    w: 3.8,
    h: 0.55,
    fontSize: 11,
    color: "6A625C"
  });

  const assets = getAssetsByType(slideSpec, [
    "hero_model",
    "mood_image",
    "supporting_image",
    "fabric_swatch"
  ]).slice(0, 4);

  const frames = [
    { x: 0.72, y: 1.55, w: 2.55, h: 4.55 },
    { x: 3.5, y: 1.15, w: 2.45, h: 2.95 },
    { x: 6.2, y: 1.55, w: 2.55, h: 4.55 },
    { x: 8.95, y: 0.95, w: 3.2, h: 2.25 }
  ];

  assets.forEach((asset, index) => {
    addImage(slide, asset, { ...frames[index], contain: true });
  });

  const summary =
    slideSpec.textBlocks?.find((item) => item.role === "body")?.content ||
    slideSpec.body.join("；");
  addBodyText(slide, summary, {
    x: 8.95,
    y: 3.55,
    w: 3.1,
    h: 2.1,
    fontSize: 12,
    color: "4C453F"
  });
  addPaletteChips(pptx, slide, getPaletteAssets(slideSpec), { x: 8.95, y: 6.15 });
}

function renderColorReferenceSlide(pptx, slide, slideSpec) {
  slide.background = { color: "F7F0E6" };
  addTitle(slide, slideSpec.title, slideSpec.subtitle, {
    x: 0.75,
    y: 0.65,
    w: 5.8,
    fontSize: 22
  });

  const visuals = getAssetsByType(slideSpec, [
    "supporting_image",
    "mood_image",
    "hero_model"
  ]).slice(0, 3);
  const widths = [3.35, 3.35, 4.35];
  let cursorX = 0.8;
  visuals.forEach((asset, index) => {
    addImage(slide, asset, {
      x: cursorX,
      y: 1.55,
      w: widths[index],
      h: 3.45,
      contain: true
    });
    cursorX += widths[index] + 0.18;
  });

  const palette = getPaletteAssets(slideSpec);
  addPaletteChips(pptx, slide, palette, {
    x: 0.85,
    y: 5.45,
    size: 0.34,
    gap: 0.16
  });
  addBodyText(slide, slideSpec.body.join("\n"), {
    x: 0.85,
    y: 5.95,
    w: 8,
    h: 0.85,
    fontSize: 12
  });
}

function renderComparisonBoardSlide(slide, slideSpec) {
  slide.background = { color: "FCF8F1" };
  addTitle(slide, slideSpec.title, slideSpec.subtitle, {
    x: 0.7,
    y: 0.55,
    w: 4.8,
    fontSize: 20
  });

  const assets = getAssetsByType(slideSpec, [
    "supporting_image",
    "mood_image",
    "hero_model",
    "fabric_swatch"
  ]).slice(0, 4);
  const positions = [
    { x: 0.8, y: 1.45 },
    { x: 3.95, y: 1.45 },
    { x: 7.1, y: 1.45 },
    { x: 10.25, y: 1.45 }
  ];

  assets.forEach((asset, index) => {
    addImage(slide, asset, {
      x: positions[index].x,
      y: positions[index].y,
      w: 2.6,
      h: 3.35,
      contain: true,
      caption: true
    });
  });

  addBullets(slide, slideSpec.body, {
    x: 0.8,
    y: 5.25,
    w: 8.6,
    h: 1.1,
    fontSize: 11
  });
}

function renderFabricShowcaseSlide(pptx, slide, slideSpec) {
  slide.background = { color: "FBF7F0" };
  addTitle(slide, slideSpec.title, slideSpec.subtitle, {
    x: 0.7,
    y: 0.55,
    w: 5.8,
    fontSize: 22
  });

  const swatch = getAssetsByType(slideSpec, ["fabric_swatch", "supporting_image"])[0];
  if (swatch) {
    addImage(slide, swatch, {
      x: 0.78,
      y: 1.45,
      w: 6.35,
      h: 4.95,
      contain: true
    });
  }

  slide.addText(slideSpec.body.join("\n"), {
    x: 7.45,
    y: 1.7,
    w: 4.65,
    h: 3.85,
    fontFace: "Aptos",
    fontSize: 13,
    color: "3E3832",
    breakLine: true,
    valign: "top",
    margin: 0
  });
  addPaletteChips(pptx, slide, getPaletteAssets(slideSpec), { x: 7.45, y: 6.05 });
}

function renderClosingSlide(slide, slideSpec) {
  slide.background = { color: "EFE6D8" };
  addTitle(slide, slideSpec.title, slideSpec.subtitle, {
    x: 0.95,
    y: 2.05,
    w: 4.8,
    h: 0.8,
    fontSize: 28
  });
  addBodyText(slide, slideSpec.body.join("\n"), {
    x: 0.98,
    y: 3.15,
    w: 5.6,
    h: 1.2,
    fontSize: 14
  });
}

function createFallbackPptx(spec) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "material-proposal-agent";
  pptx.subject = spec.subject;
  pptx.title = spec.title;
  pptx.company = "OpenClaw";
  pptx.lang = "zh-CN";
  pptx.theme = {
    headFontFace: "Aptos",
    bodyFontFace: "Aptos",
    lang: "zh-CN"
  };

  return pptx;
}

async function renderWithPptxGenJs(spec, outputPath) {
  const pptx = createFallbackPptx(spec);

  for (const slideSpec of spec.slides) {
    const slide = pptx.addSlide();
    if (slideSpec.slideType === "cover") {
      renderCoverSlide(pptx, slide, slideSpec);
      continue;
    }

    if (slideSpec.slideType === "summary") {
      renderSummarySlide(pptx, slide, slideSpec);
      continue;
    }

    if (slideSpec.slideType === "candidate") {
      renderFabricShowcaseSlide(pptx, slide, {
        ...slideSpec,
        slideType: "fabric_showcase"
      });
      continue;
    }

    if (slideSpec.slideType === "inspiration_moodboard") {
      renderMoodboardSlide(pptx, slide, slideSpec);
      continue;
    }

    if (slideSpec.slideType === "color_reference") {
      renderColorReferenceSlide(pptx, slide, slideSpec);
      continue;
    }

    if (slideSpec.slideType === "comparison_board") {
      renderComparisonBoardSlide(slide, slideSpec);
      continue;
    }

    if (slideSpec.slideType === "fabric_showcase") {
      renderFabricShowcaseSlide(pptx, slide, slideSpec);
      continue;
    }

    if (slideSpec.slideType === "closing") {
      renderClosingSlide(slide, slideSpec);
      continue;
    }

    renderClosingSlide(slide, slideSpec);
  }

  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}

function isLegacyTemplateCompatible(spec) {
  return spec.slides.every((slide) =>
    ["cover", "summary", "candidate", "closing"].includes(slide.slideType)
  );
}

async function renderWithTemplate(spec, outputPath) {
  const config = getConfig();
  const templatePath = config.pptTemplatePath;

  if (!templatePath || !isLegacyTemplateCompatible(spec)) {
    return renderWithPptxGenJs(spec, outputPath);
  }

  const templateDir = path.dirname(templatePath);
  const templateName = path.basename(templatePath);
  const outputDir = path.dirname(outputPath);
  const outputName = path.basename(outputPath);

  const automizer = new Automizer({
    templateDir,
    outputDir,
    mediaDir: "/",
    removeExistingSlides: true,
    autoImportSlideMasters: true,
    cleanup: true,
    verbosity: 0
  });

  let pres = automizer.loadRoot(templateName).load(templateName, "template");
  const mediaToLoad = new Set(
    spec.slides
      .map((slide) => slide.imagePath)
      .filter(Boolean)
  );

  for (const imagePath of mediaToLoad) {
    pres = pres.loadMedia(path.basename(imagePath), path.dirname(imagePath));
  }

  for (const slideSpec of spec.slides) {
    const templateSlideNumber =
      slideSpec.slideType === "cover"
        ? config.pptTemplateCoverSlide
        : slideSpec.slideType === "summary"
          ? config.pptTemplateSummarySlide
          : slideSpec.slideType === "candidate"
            ? config.pptTemplateCandidateSlide
            : config.pptTemplateClosingSlide;

    pres = pres.addSlide("template", templateSlideNumber, (slide) => {
      const notes = slideSpec.notes || {};
      for (const [tag, value] of Object.entries(notes)) {
        slide.modifyElement(
          tag,
          modify.replaceText([
            {
              replace: tag,
              by: {
                text: value
              }
            }
          ])
        );
      }

      if (slideSpec.slideType === "candidate" && slideSpec.imagePath) {
        slide.modifyElement(config.pptTemplateImageElement, [
          ModifyImageHelper.setRelationTargetCover(
            path.basename(slideSpec.imagePath),
            pres
          )
        ]);
      }
    });
  }

  await pres.write(outputName);
  return outputPath;
}

export async function exportPpt(session, outputPath) {
  await ensureDir(path.dirname(outputPath));
  const spec = buildPptSpec(session);
  try {
    return await renderWithTemplate(spec, outputPath);
  } catch {
    return renderWithPptxGenJs(spec, outputPath);
  }
}
