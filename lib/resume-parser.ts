import "server-only";

import { MAX_RESUME_TEXT_CHARACTERS, type ResumeFileKind } from "@/lib/resume-analysis";

export class ResumeExtractionError extends Error {
  constructor(message: string, public readonly status = 422) {
    super(message);
    this.name = "ResumeExtractionError";
  }
}

function normalizeResumeText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractResumeText(buffer: Buffer, kind: ResumeFileKind): Promise<string> {
  let text: string;

  try {
    if (kind === "pdf") {
      const { CanvasFactory, getPath } = await import("pdf-parse/worker");
      const { PDFParse } = await import("pdf-parse");
      PDFParse.setWorker(getPath());
      const parser = new PDFParse({ data: new Uint8Array(buffer), CanvasFactory });
      try {
        const result = await parser.getText();
        text = result.text;
      } finally {
        await parser.destroy();
      }
    } else if (kind === "docx") {
      const mammothModule = await import("mammoth");
      const mammoth = mammothModule.default ?? mammothModule;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    }
  } catch {
    throw new ResumeExtractionError(
      kind === "txt"
        ? "This TXT file could not be read. Save it as UTF-8 text and try again."
        : `This ${kind.toUpperCase()} could not be read. Upload a valid, unencrypted file and try again.`,
    );
  }

  const normalized = normalizeResumeText(text);
  if (normalized.length < 80) {
    throw new ResumeExtractionError(
      kind === "pdf"
        ? "We couldn't find readable text in this PDF. It may be a scanned image; OCR is not available, so upload a text-based PDF or DOCX/TXT file."
        : "We couldn't find enough readable resume text in this file. Check the file and try again.",
    );
  }
  if (normalized.length > MAX_RESUME_TEXT_CHARACTERS) {
    throw new ResumeExtractionError(
      `This resume is longer than ${MAX_RESUME_TEXT_CHARACTERS.toLocaleString()} characters. Shorten it before analysis so the full text can be reviewed.`,
      413,
    );
  }

  return normalized;
}
