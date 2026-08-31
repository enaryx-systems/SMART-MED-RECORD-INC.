import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import OpenAI from "openai";
import { PrismaService } from "../../common/prisma/prisma.service";

const SUMMARY_MODEL = "gpt-4o-mini";

@Injectable()
export class AiSummaryService {
  constructor(private prisma: PrismaService) {}

  async generate(caseId: string) {
    if (!process.env.OPENAI_API_KEY) {
      throw new ServiceUnavailableException("AI features are not configured.");
    }

    const found = await this.prisma.case.findUniqueOrThrow({
      where: { id: caseId },
      include: {
        documents: { include: { extraction: true } },
      },
    });

    const extractedTexts = found.documents
      .map((d) => d.extraction?.extractedText)
      .filter((t): t is string => !!t && t.trim().length > 0);

    if (extractedTexts.length === 0) {
      throw new ServiceUnavailableException(
        "No extracted document text is available yet for this case — run extraction on its documents first.",
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: SUMMARY_MODEL,
      messages: [
        {
          role: "user",
          content: `You are assisting a medical-legal records reviewer. Summarize the following
case's records into a concise briefing (4-6 sentences): key providers, dates of service, and
notable diagnoses/findings. Only state what's supported by the text below — do not speculate.

Matter: ${found.matterName}

${extractedTexts.map((t, i) => `--- Document ${i + 1} ---\n${t.slice(0, 6000)}`).join("\n\n")}`,
        },
      ],
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) throw new Error("The summary model returned an empty response.");

    return this.prisma.caseSummary.upsert({
      where: { caseId },
      update: { summary, model: SUMMARY_MODEL, generatedAt: new Date() },
      create: { caseId, summary, model: SUMMARY_MODEL },
    });
  }

  getLatest(caseId: string) {
    return this.prisma.caseSummary.findUnique({ where: { caseId } });
  }
}
