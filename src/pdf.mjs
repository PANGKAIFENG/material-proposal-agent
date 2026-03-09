import { PDFExtract } from "pdf.js-extract";

export async function extractPdfText(pdfPath) {
  const extractor = new PDFExtract();
  const data = await extractor.extract(pdfPath, {});
  const pages = data.pages.map((page, index) => {
    const text = page.content
      .map((item) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return `# Page ${index + 1}\n${text}`;
  });
  return pages.join("\n\n").trim();
}
