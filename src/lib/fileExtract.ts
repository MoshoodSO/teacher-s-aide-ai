import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ExtractedFileContent {
  /** Plain text extracted from the file (may be empty for scanned/image files) */
  text: string;
  /** Base64 data URLs of page/image renders for AI vision analysis */
  images: string[];
  /** Human readable note about how the file was handled */
  note: string;
}

const MAX_VISION_PAGES = 4;

const TEXT_EXTENSIONS = [
  "txt", "md", "markdown", "csv", "tsv", "json", "xml", "yml", "yaml",
  "tex", "html", "htm", "rtf", "log", "srt", "ini",
];

const fileToDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const extension = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

const looksLikeText = (value: string) => {
  if (!value.trim()) return false;
  const suspicious = value.slice(0, 2000).replace(/[\t\n\r\x20-\x7E\u00A0-\uFFFF]/g, "");
  return suspicious.length / Math.max(value.slice(0, 2000).length, 1) < 0.1;
};

async function extractPdf(file: File): Promise<ExtractedFileContent> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const parts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) parts.push(`[Page ${pageNumber}]\n${pageText}`);
  }

  const text = parts.join("\n\n").trim();

  // Scanned PDF (little or no embedded text) -> render pages for AI vision.
  if (text.length < 200) {
    const images: string[] = [];
    const pageCount = Math.min(pdf.numPages, MAX_VISION_PAGES);
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.6 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) continue;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      images.push(canvas.toDataURL("image/jpeg", 0.85));
    }
    return {
      text,
      images,
      note: `Scanned PDF: ${images.length} page image(s) sent for AI vision reading.`,
    };
  }

  return { text, images: [], note: `PDF text extracted from ${pdf.numPages} page(s).` };
}

async function extractDocx(file: File): Promise<ExtractedFileContent> {
  const mammoth = await import("mammoth/mammoth.browser");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return {
    text: (result.value || "").replace(/\n{3,}/g, "\n\n").trim(),
    images: [],
    note: "Word document text extracted.",
  };
}

/**
 * Extracts usable curriculum/topic content from ANY uploaded file type so the
 * lesson note can be built primarily from the file's own content.
 */
export async function extractFileContent(file: File): Promise<ExtractedFileContent> {
  const ext = extension(file.name);
  const type = file.type || "";

  try {
    if (type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif", "bmp", "heic"].includes(ext)) {
      const dataUrl = await fileToDataUrl(file);
      return { text: "", images: [dataUrl], note: "Image sent for AI vision reading." };
    }

    if (type === "application/pdf" || ext === "pdf") {
      return await extractPdf(file);
    }

    if (ext === "docx" || type.includes("wordprocessingml")) {
      return await extractDocx(file);
    }

    if (type.startsWith("text/") || TEXT_EXTENSIONS.includes(ext)) {
      const text = await file.text();
      return { text: text.trim(), images: [], note: "Text file content extracted." };
    }

    // Unknown type: attempt a plain text read before giving up.
    const raw = await file.text();
    if (looksLikeText(raw)) {
      return { text: raw.trim(), images: [], note: "File read as plain text." };
    }

    return {
      text: "",
      images: [],
      note: `Could not read the contents of ${file.name}. Please upload a PDF, image, Word or text file.`,
    };
  } catch (error) {
    console.error("File extraction failed", error);
    return {
      text: "",
      images: [],
      note: `Could not read the contents of ${file.name}.`,
    };
  }
}
