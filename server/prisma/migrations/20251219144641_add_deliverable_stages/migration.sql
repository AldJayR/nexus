-- CreateEnum
CREATE TYPE "DeliverableStage" AS ENUM ('PLANNING', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'GENERAL');

-- AlterTable
ALTER TABLE "Deliverable" ADD COLUMN     "stage" "DeliverableStage" NOT NULL DEFAULT 'GENERAL';
