import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StorageService } from "../../common/storage/storage.service";
import { ExtractedRecordSchema } from "./schemas/extracted-record.schema";

const EXTRACTION_MODEL = "gpt-4o-mini";
const MIN_TEXT_LENGTH = 40;

const PROMPT = `You are reviewing a medical-legal record document. Read the content and
respond with ONLY a JSON object matching this exact shape (no prose, no markdown fences):
{
  "documentType": string or null (e.g. "Physician note", "Imaging report", "Billing record"),
  "providerName": string or null,
  "datesOfService": string[] (ISO dates if determinable, otherwise as written),
  "diagnoses": string[],
  "summary": string or null (2-3 sentences)
}
If a field cannot be determined, use null or an empty array. Do not invent information that
is not present in the document.`;

function client() {
  if (!process.env.OPENAI_API_KEY) {
    throw new ServiceUnavailableException("AI features are not configured.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

@Injectable()
export class AiExtractionService {
  private readonly logger = new Logger(AiExtractionService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async extract(documentId: string): Promise<void> {
    const doc = await this.prisma.document.findUniqueOrThrow({ where: { id: documentId } });

    // Progress is tracked with independent single-row writes rather than one
    // transaction — the row must be visible as PROCESSING while the (multi-second)
    // download and model call run, and settle to COMPLETE/FAILED afterwards.
    await this.markProcessing(documentId);

    try {
      const buffer = await this.storage.download(doc.storageKey);
      const { extractedText, imageDataUrl } = await this.readContent(buffer, doc.mimeType);

      const openai = client();
      const raw = await this.runExtraction(openai, extractedText, imageDataUrl);
      const parsed = ExtractedRecordSchema.parse(JSON.parse(raw));

      await this.markComplete(documentId, extractedText, parsed);
    } catch (err) {
      this.logger.error(`Extraction failed for document ${documentId}`, err as Error);
      await this.markFailed(
        documentId,
        err instanceof Error ? err.message : "Unknown extraction error.",
      );
      throw err;
    }
  }

  private markProcessing(documentId: string) {
    return this.prisma.documentExtraction.upsert({
      where: { documentId },
      update: { status: "PROCESSING", error: null },
      create: { documentId, status: "PROCESSING" },
    });
  }

  private markComplete(
    documentId: string,
    extractedText: string,
    parsed: ReturnType<typeof ExtractedRecordSchema.parse>,
  ) {
    return this.prisma.documentExtraction.update({
      where: { documentId },
      data: {
        status: "COMPLETE",
        extractedText: extractedText || null,
        structuredData: parsed,
        model: EXTRACTION_MODEL,
        error: null,
      },
    });
  }

  private markFailed(documentId: string, error: string) {
    return this.prisma.documentExtraction.update({
      where: { documentId },
      data: { status: "FAILED", error },
    });
  }

  /** Text PDFs are read directly (cheap, no vision call needed); image files
   * and scanned/image-only PDFs fall back to sending a page image to a
   * vision-capable model, which performs OCR and extraction in one pass. */
  private async readContent(
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ extractedText: string; imageDataUrl?: string }> {
    if (mimeType.startsWith("image/")) {
      return {
        extractedText: "",
        imageDataUrl: `data:${mimeType};base64,${buffer.toString("base64")}`,
      };
    }

    if (mimeType === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        if (result.text.trim().length >= MIN_TEXT_LENGTH) {
          return { extractedText: result.text };
        }
        // Likely a scanned PDF with no embedded text layer — render the
        // first page (bounding cost) and fall back to vision.
        const screenshot = await parser.getScreenshot({ first: 1, last: 1, imageDataUrl: true });
        const dataUrl = screenshot.pages[0]?.dataUrl;
        return { extractedText: result.text, imageDataUrl: dataUrl };
      } finally {
        await parser.destroy();
      }
    }

    throw new Error(`Unsupported file type for extraction: ${mimeType}`);
  }

  private async runExtraction(openai: OpenAI, text: string, imageDataUrl?: string) {
    const content: OpenAI.Chat.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: text ? `${PROMPT}\n\nDocument text:\n${text.slice(0, 12000)}` : PROMPT,
      },
    ];
    if (imageDataUrl) {
      content.push({ type: "image_url", image_url: { url: imageDataUrl } });
    }

    const completion = await openai.chat.completions.create({
      model: EXTRACTION_MODEL,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("The extraction model returned an empty response.");
    return raw;
  }
}
