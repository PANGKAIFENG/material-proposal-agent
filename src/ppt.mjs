import path from "node:path";
import Automizer, {
  ModifyImageHelper,
  modify
} from "pptx-automizer";
import PptxGenJS from "pptxgenjs";
import { getConfig } from "./config.mjs";
import { ensureDir } from "./fs-utils.mjs";
import { buildPptSpec } from "./ppt-spec.mjs";

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
      slide.background = { color: "F7F2E7" };
      slide.addText(slideSpec.title, {
        x: 0.7,
        y: 1.2,
        w: 8.8,
        h: 0.8,
        fontFace: "Aptos",
        fontSize: 28,
        bold: true,
        color: "143534"
      });
      slideSpec.body.forEach((line, index) => {
        slide.addText(line, {
          x: 0.7,
          y: 2.15 + index * 0.4,
          w: 7.4,
          h: 0.35,
          fontSize: index === slideSpec.body.length - 1 ? 12 : 15,
          color: "47615D"
        });
      });
      continue;
    }

    if (slideSpec.slideType === "summary") {
      slide.background = { color: "FFFDF7" };
      addTitle(slide, slideSpec.title, slideSpec.subtitle);
      addBullets(slide, slideSpec.body.slice(0, 6));
      addBullets(slide, slideSpec.body.slice(6), {
        x: 6.0,
        y: 1.4,
        w: 6.4,
        h: 2.8
      });
      continue;
    }

    if (slideSpec.slideType === "candidate") {
      slide.background = { color: "FFFDF7" };
      addTitle(slide, slideSpec.title, slideSpec.subtitle);
      if (slideSpec.imagePath) {
        slide.addImage({
          path: slideSpec.imagePath,
          x: 0.7,
          y: 1.5,
          w: 6.0,
          h: 4.8,
          contain: true
        });
      }
      addBullets(slide, slideSpec.body, {
        x: 7.0,
        y: 1.7,
        w: 5.5,
        h: 4.4
      });
      continue;
    }

    slide.background = { color: "F7F2E7" };
    slide.addText(slideSpec.title, {
      x: 0.7,
      y: 1.3,
      w: 4,
      h: 0.7,
      fontFace: "Aptos",
      fontSize: 26,
      bold: true,
      color: "143534"
    });
    slide.addText(slideSpec.body.join("\n"), {
      x: 0.7,
      y: 2.1,
      w: 6.8,
      h: 0.8,
      fontSize: 16,
      color: "47615D"
    });
  }

  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}

async function renderWithTemplate(spec, outputPath) {
  const config = getConfig();
  const templatePath = config.pptTemplatePath;

  if (!templatePath) {
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
