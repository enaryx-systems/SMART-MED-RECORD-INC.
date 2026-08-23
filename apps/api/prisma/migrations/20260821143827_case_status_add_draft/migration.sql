-- AlterEnum
-- Split into its own migration: Postgres requires a new enum value to be committed
-- before it can be referenced (e.g. as a column default) by a later migration.
ALTER TYPE "CaseStatus" ADD VALUE 'DRAFT';
