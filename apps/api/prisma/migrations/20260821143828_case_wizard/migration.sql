-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('PERSONAL_INJURY', 'MEDICAL_MALPRACTICE', 'MASS_TORT_CLASS_ACTION', 'SSD_CLAIMS', 'NURSING_HOME', 'SEXUAL_ABUSE_CASES', 'WORKERS_COMPENSATION', 'OTHER');

-- CreateEnum
CREATE TYPE "DeliverySpeed" AS ENUM ('STANDARD', 'EXPEDITED');

-- Backfill: assign a temporary CaseType to any pre-existing rows before making the column NOT NULL.
-- (This repo has no production database yet — this is a forward-safe no-op when the Case table is empty.)
ALTER TABLE "Case" ADD COLUMN "caseType" "CaseType";
UPDATE "Case" SET "caseType" = 'OTHER' WHERE "caseType" IS NULL;
ALTER TABLE "Case" ALTER COLUMN "caseType" SET NOT NULL;

-- AlterTable
ALTER TABLE "Case"
  DROP COLUMN "service",
  ADD COLUMN "attorneyName" TEXT,
  ADD COLUMN "contactName" TEXT,
  ADD COLUMN "contactEmail" TEXT,
  ADD COLUMN "contactPhone" TEXT,
  ADD COLUMN "caseOverview" TEXT,
  ADD COLUMN "caseIssues" TEXT,
  ADD COLUMN "specificInstructions" TEXT,
  ADD COLUMN "servicesDesired" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "additionalServices" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "otherServicesNote" TEXT,
  ADD COLUMN "deliverySpeed" "DeliverySpeed" NOT NULL DEFAULT 'STANDARD',
  ADD COLUMN "pdfReference" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "batesReference" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "submittedAt" TIMESTAMP(3);

ALTER TABLE "Case" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseNumberSequence" (
    "id" INTEGER NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CaseNumberSequence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed the singleton counter row, starting from the highest existing case number so
-- numbering continues without collisions (0 when the table is empty, e.g. a fresh database).
INSERT INTO "CaseNumberSequence" ("id", "value")
VALUES (1, COALESCE((SELECT MAX(CAST(SUBSTRING("caseNumber" FROM 'SMR-(\d+)') AS INTEGER)) FROM "Case"), 0))
ON CONFLICT ("id") DO NOTHING;
