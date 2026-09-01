import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import { Role } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthUser } from "../../common/auth/auth-user";

const COLLECTION = "document_chunks";
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const CHUNK_SIZE = 2000; // characters, roughly ~500 tokens

interface ChunkPayload {
  documentId: string;
  caseId: string;
  organizationId: string;
  assignedReviewerId: string | null;
}

function openaiClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new ServiceUnavailableException("AI features are not configured.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function qdrantClient() {
  if (!process.env.QDRANT_URL) {
    throw new ServiceUnavailableException("Semantic search is not configured.");
  }
  return new QdrantClient({ url: process.env.QDRANT_URL, apiKey: process.env.QDRANT_API_KEY });
}

@Injectable()
export class AiSearchService {
  constructor(private prisma: PrismaService) {}

  private async ensureCollection(qdrant: QdrantClient) {
    const { collections } = await qdrant.getCollections();
    if (!collections.some((c) => c.name === COLLECTION)) {
      await qdrant.createCollection(COLLECTION, {
        vectors: { size: EMBEDDING_DIMENSIONS, distance: "Cosine" },
      });
    }
  }

  async embedDocument(documentId: string): Promise<void> {
    const doc = await this.prisma.document.findUniqueOrThrow({
      where: { id: documentId },
      include: {
        extraction: true,
        case: { select: { id: true, organizationId: true, assignedReviewerId: true } },
      },
    });

    const text = doc.extraction?.extractedText?.trim();
    if (!text) return; // nothing to embed yet — extraction hasn't produced text

    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE) chunks.push(text.slice(i, i + CHUNK_SIZE));

    const openai = openaiClient();
    const qdrant = qdrantClient();
    await this.ensureCollection(qdrant);

    // Clear any previous chunks for this document (a re-run of extraction
    // shouldn't leave stale vectors behind).
    const existing = await this.prisma.documentChunk.findMany({ where: { documentId } });
    if (existing.length > 0) {
      await qdrant.delete(COLLECTION, { points: existing.map((c) => c.qdrantPointId) });
    }

    const chunkRows: {
      documentId: string;
      chunkIndex: number;
      text: string;
      qdrantPointId: string;
    }[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: chunks[i],
      });
      const vector = embedding.data[0].embedding;
      const pointId = `${documentId}-${i}`;

      const payload: ChunkPayload = {
        documentId,
        caseId: doc.case.id,
        organizationId: doc.case.organizationId,
        assignedReviewerId: doc.case.assignedReviewerId,
      };
      await qdrant.upsert(COLLECTION, {
        wait: true,
        points: [{ id: pointId, vector, payload: payload as unknown as Record<string, unknown> }],
      });

      chunkRows.push({ documentId, chunkIndex: i, text: chunks[i], qdrantPointId: pointId });
    }

    // Swap the row set atomically once every embedding/upsert has landed in Qdrant.
    await this.prisma.$transaction([
      this.prisma.documentChunk.deleteMany({ where: { documentId } }),
      this.prisma.documentChunk.createMany({ data: chunkRows }),
    ]);
  }

  private scopeFilter(user: AuthUser) {
    if (user.role === Role.CLIENT) {
      return { must: [{ key: "organizationId", match: { value: user.organizationId } }] };
    }
    if (user.role === Role.REVIEWER) {
      return { must: [{ key: "assignedReviewerId", match: { value: user.id } }] };
    }
    return undefined; // ADMIN sees everything; BILLING never reaches this (blocked at the controller)
  }

  async search(user: AuthUser, query: string, caseId?: string) {
    const openai = openaiClient();
    const qdrant = qdrantClient();

    const embedding = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: query });
    const vector = embedding.data[0].embedding;

    const scopeFilter = this.scopeFilter(user);
    const must = [
      ...(scopeFilter?.must ?? []),
      ...(caseId ? [{ key: "caseId", match: { value: caseId } }] : []),
    ];

    const result = await qdrant.query(COLLECTION, {
      query: vector,
      filter: must.length ? { must } : undefined,
      limit: 10,
      with_payload: true,
    });

    const points = result.points.filter((p) => {
      const payload = p.payload as unknown as ChunkPayload;
      // Re-check every hit against the caller's real RBAC scope server-side —
      // Qdrant's filter is a performance optimization, not the authorization
      // boundary, mirroring how payment-gated downloads are enforced.
      if (user.role === Role.CLIENT) return payload.organizationId === user.organizationId;
      if (user.role === Role.REVIEWER) return payload.assignedReviewerId === user.id;
      return true;
    });

    const documentIds = points.map((p) => (p.payload as unknown as ChunkPayload).documentId);
    const [docs, chunks] = await Promise.all([
      this.prisma.document.findMany({
        where: { id: { in: documentIds } },
        select: {
          id: true,
          fileName: true,
          caseId: true,
          case: { select: { caseNumber: true, matterName: true } },
        },
      }),
      this.prisma.documentChunk.findMany({
        where: { qdrantPointId: { in: points.map((p) => String(p.id)) } },
        select: { qdrantPointId: true, text: true },
      }),
    ]);
    const docById = new Map(docs.map((d) => [d.id, d]));
    const textByPointId = new Map(chunks.map((c) => [c.qdrantPointId, c.text]));

    return points.map((p) => {
      const payload = p.payload as unknown as ChunkPayload;
      const doc = docById.get(payload.documentId);
      const text = textByPointId.get(String(p.id)) ?? "";
      return {
        score: p.score,
        caseId: payload.caseId,
        caseNumber: doc?.case.caseNumber,
        matterName: doc?.case.matterName,
        documentId: payload.documentId,
        fileName: doc?.fileName,
        snippet: text.length > 300 ? `${text.slice(0, 300)}…` : text,
      };
    });
  }
}
