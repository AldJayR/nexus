-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_taskId_idx" ON "Comment"("taskId");

-- CreateIndex
CREATE INDEX "Comment_deliverableId_idx" ON "Comment"("deliverableId");

-- CreateIndex
CREATE INDEX "Deliverable_phaseId_idx" ON "Deliverable"("phaseId");

-- CreateIndex
CREATE INDEX "Deliverable_status_idx" ON "Deliverable"("status");

-- CreateIndex
CREATE INDEX "Deliverable_deletedAt_idx" ON "Deliverable"("deletedAt");

-- CreateIndex
CREATE INDEX "Evidence_deliverableId_idx" ON "Evidence"("deliverableId");

-- CreateIndex
CREATE INDEX "Evidence_uploaderId_idx" ON "Evidence"("uploaderId");

-- CreateIndex
CREATE INDEX "Evidence_deletedAt_idx" ON "Evidence"("deletedAt");

-- CreateIndex
CREATE INDEX "MeetingLog_sprintId_idx" ON "MeetingLog"("sprintId");

-- CreateIndex
CREATE INDEX "MeetingLog_uploaderId_idx" ON "MeetingLog"("uploaderId");

-- CreateIndex
CREATE INDEX "MeetingLog_date_idx" ON "MeetingLog"("date");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Phase_projectId_idx" ON "Phase"("projectId");

-- CreateIndex
CREATE INDEX "Phase_type_idx" ON "Phase"("type");

-- CreateIndex
CREATE INDEX "Sprint_projectId_idx" ON "Sprint"("projectId");

-- CreateIndex
CREATE INDEX "Sprint_deletedAt_idx" ON "Sprint"("deletedAt");

-- CreateIndex
CREATE INDEX "Task_sprintId_idx" ON "Task"("sprintId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_deletedAt_idx" ON "Task"("deletedAt");
