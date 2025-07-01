-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "HasRequestedRecheck" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "RecheckExplanation" TEXT;
