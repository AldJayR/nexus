import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { fileService } from "../../services/file.service.js";
import { MultipartFile } from "@fastify/multipart";

const prisma = getPrismaClient();

interface CreateMeetingLogInput {
  sprintId: string;
  uploaderId: string;
  title: string;
  date: string;
  file: MultipartFile;
}

export async function createMeetingLog(input: CreateMeetingLogInput) {
  const { sprintId, uploaderId, title, date, file } = input;

  // 1. Check if sprint exists
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
  });

  if (!sprint) {
    throw new NotFoundError("Sprint", sprintId);
  }

  // 2. Upload file to Cloudinary
  const uploadResult = await fileService.saveFile(file);

  // 3. Create MeetingLog record
  return prisma.meetingLog.create({
    data: {
      sprintId,
      uploaderId,
      title,
      date: new Date(date),
      fileUrl: uploadResult.path,
    },
  });
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

export async function deleteMeetingLog(id: string) {
  const meetingLog = await prisma.meetingLog.findUnique({
    where: { id },
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
  return prisma.meetingLog.delete({
    where: { id },
  });
}
