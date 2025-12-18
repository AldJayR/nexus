-- DropForeignKey
ALTER TABLE "MeetingLog" DROP CONSTRAINT "MeetingLog_sprintId_fkey";

-- AlterTable
ALTER TABLE "MeetingLog" ADD COLUMN     "phaseId" TEXT,
ALTER COLUMN "sprintId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MeetingLog_phaseId_idx" ON "MeetingLog"("phaseId");

-- AddForeignKey
ALTER TABLE "MeetingLog" ADD CONSTRAINT "MeetingLog_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingLog" ADD CONSTRAINT "MeetingLog_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
