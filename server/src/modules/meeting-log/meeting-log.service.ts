import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { fileService } from "../../services/file.service.js";
import { MultipartFile } from "@fastify/multipart";
import { createActivityLog } from "../activity-log/activity-log.service.js";

const prisma = getPrismaClient();

interface CreateMeetingLogInput {
  sprintId?: string;
  phaseId?: string;
  uploaderId: string;
  title: string;
  date: string;
  file: MultipartFile;
}

export async function createMeetingLog(input: CreateMeetingLogInput) {
  const { sprintId, phaseId, uploaderId, title, date, file } = input;

  let entityType = "";
  let entityId = "";
  let entityName = "";

  // 1. Validate Context (Sprint OR Phase)
  if (sprintId) {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) throw new NotFoundError("Sprint", sprintId);
    entityType = "Sprint";
    entityId = sprint.id;
    entityName = `Sprint ${sprint.number}`;
  } else if (phaseId) {
    const phase = await prisma.phase.findUnique({ where: { id: phaseId } });
    if (!phase) throw new NotFoundError("Phase", phaseId);
    entityType = "Phase";
    entityId = phase.id;
    entityName = phase.name;
  } else {
    throw new Error("Meeting log must be linked to a Sprint or a Phase");
  }

  // 2. Upload file to Cloudinary
  const uploadResult = await fileService.saveFile(file);

  // 3. Create MeetingLog record
  const meetingLog = await prisma.meetingLog.create({
    data: {
      sprintId,
      phaseId,
      uploaderId,
      title,
      date: new Date(date),
      fileUrl: uploadResult.path,
    },
  });

  await createActivityLog({
    userId: uploaderId,
    action: "MEETING_LOG_UPLOADED",
    entityType,
    entityId,
    details: `Meeting Log "${title}" uploaded for ${entityName}`,
  });

  return meetingLog;
}

export async function getMeetingLogsBySprint(sprintId: string) {
  return prisma.meetingLog.findMany({
    where: { sprintId },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getMeetingLogsByPhase(phaseId: string) {
  return prisma.meetingLog.findMany({
    where: { phaseId },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function deleteMeetingLog(id: string, userId: string) {
  const meetingLog = await prisma.meetingLog.findUnique({
    where: { id },
    include: { sprint: true, phase: true },
  });

  if (!meetingLog) {
    throw new NotFoundError("MeetingLog", id);
  }

  // 1. Delete from Cloudinary (Attempt)
  const urlParts = meetingLog.fileUrl.split('/');
  const filenameWithExt = urlParts[urlParts.length - 1];
  const publicId = `nexus_uploads/${filenameWithExt.split('.')[0]}`;
  
  await fileService.deleteFile(publicId);

  // 2. Delete from DB
  await prisma.meetingLog.delete({
    where: { id },
  });

  const entityType = meetingLog.sprint ? "Sprint" : "Phase";
  const entityId = meetingLog.sprintId || meetingLog.phaseId || "unknown";
  const entityName = meetingLog.sprint ? `Sprint ${meetingLog.sprint.number}` : (meetingLog.phase?.name || "Phase");

  await createActivityLog({
    userId,
    action: "MEETING_LOG_DELETED",
    entityType,
    entityId,
    details: `Meeting Log "${meetingLog.title}" deleted from ${entityName}`,
  });
}
