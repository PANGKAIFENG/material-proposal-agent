#!/usr/bin/env node

import path from "node:path";
import PptxGenJS from "pptxgenjs";

const outputPath =
  process.argv[2] ||
  path.join(process.cwd(), "output", "material-proposal-template.pptx");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "material-proposal-agent";
pptx.title = "Sample Material Proposal Template";
const transparentPng =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";

function addTagBox(slide, text, options) {
  slide.addText(text, {
    margin: 0,
    fontFace: "Aptos",
    color: "143534",
    ...options
  });
}

{
  const slide = pptx.addSlide();
  slide.background = { color: "F7F2E7" };
  addTagBox(slide, "{{coverTitle}}", {
    x: 0.7,
    y: 1.2,
    w: 9.5,
    h: 0.7,
    fontSize: 28,
    bold: true,
    objectName: "coverTitle"
  });
  addTagBox(slide, "{{coverAudience}}", {
    x: 0.7,
    y: 2.2,
    w: 6.5,
    h: 0.35,
    fontSize: 15,
    objectName: "coverAudience"
  });
  addTagBox(slide, "{{coverUseCases}}", {
    x: 0.7,
    y: 2.65,
    w: 6.5,
    h: 0.35,
    fontSize: 15,
    objectName: "coverUseCases"
  });
  addTagBox(slide, "{{coverDate}}", {
    x: 0.7,
    y: 3.15,
    w: 2.2,
    h: 0.3,
    fontSize: 12,
    color: "47615D",
    objectName: "coverDate"
  });
}

{
  const slide = pptx.addSlide();
  slide.background = { color: "FFFDF7" };
  addTagBox(slide, "{{summaryTitle}}", {
    x: 0.6,
    y: 0.4,
    w: 8.5,
    h: 0.5,
    fontSize: 24,
    bold: true,
    objectName: "summaryTitle"
  });
  addTagBox(slide, "{{summarySummary}}", {
    x: 0.6,
    y: 0.95,
    w: 11.3,
    h: 0.5,
    fontSize: 11,
    color: "47615D",
    objectName: "summarySummary"
  });
  addTagBox(slide, "{{summaryLeft}}", {
    x: 0.8,
    y: 1.5,
    w: 4.8,
    h: 4.6,
    fontSize: 14,
    breakLine: true,
    valign: "top",
    objectName: "summaryLeft"
  });
  addTagBox(slide, "{{summaryRight}}", {
    x: 6.1,
    y: 1.5,
    w: 5.7,
    h: 3.6,
    fontSize: 14,
    breakLine: true,
    valign: "top",
    objectName: "summaryRight"
  });
}

{
  const slide = pptx.addSlide();
  slide.background = { color: "FFFDF7" };
  addTagBox(slide, "{{candidateTitle}}", {
    x: 0.6,
    y: 0.4,
    w: 8.5,
    h: 0.5,
    fontSize: 24,
    bold: true,
    objectName: "candidateTitle"
  });
  addTagBox(slide, "{{candidateDescription}}", {
    x: 0.6,
    y: 0.95,
    w: 11.3,
    h: 0.5,
    fontSize: 11,
    color: "47615D",
    objectName: "candidateDescription"
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.7,
    y: 1.5,
    w: 6.0,
    h: 4.8,
    fill: { color: "F0EEE7" },
    line: { color: "C6D2CC", pt: 1.2 },
    objectName: "candidateFrame"
  });
  slide.addImage({
    data: transparentPng,
    x: 0.7,
    y: 1.5,
    w: 6.0,
    h: 4.8,
    objectName: "candidateImage"
  });
  slide.addText("候选图片", {
    x: 2.6,
    y: 3.55,
    w: 2.2,
    h: 0.35,
    fontSize: 18,
    bold: true,
    color: "9AA7A3",
    align: "center",
    margin: 0,
    objectName: "candidateLabel"
  });
  addTagBox(slide, "{{candidateBullets}}", {
    x: 7.0,
    y: 1.7,
    w: 5.2,
    h: 4.4,
    fontSize: 14,
    breakLine: true,
    valign: "top",
    objectName: "candidateBullets"
  });
}

{
  const slide = pptx.addSlide();
  slide.background = { color: "F7F2E7" };
  addTagBox(slide, "{{closingTitle}}", {
    x: 0.7,
    y: 1.3,
    w: 4.0,
    h: 0.7,
    fontSize: 26,
    bold: true,
    objectName: "closingTitle"
  });
  addTagBox(slide, "{{closingBody}}", {
    x: 0.7,
    y: 2.1,
    w: 8.5,
    h: 0.9,
    fontSize: 16,
    color: "47615D",
    breakLine: true,
    objectName: "closingBody"
  });
}

await pptx.writeFile({ fileName: outputPath });
process.stdout.write(`${outputPath}\n`);
