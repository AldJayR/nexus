import { getPrismaClient, NotFoundError } from "../../utils/database.js";
import { fileService } from "../../services/file.service.js";
import { MultipartFile } from "@fastify/multipart";
import { createActivityLog } from "../activity-log/activity-log.service.js";

const prisma = getPrismaClient();

interface CreateEvidenceInput {
  deliverableId: string;
  uploaderId: string;
  file: MultipartFile;
}

export async function createEvidence(input: CreateEvidenceInput) {
  const { deliverableId, uploaderId, file } = input;

  // 1. Check if deliverable exists
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
  });

  if (!deliverable) {
    throw new NotFoundError("Deliverable", deliverableId);
  }

  // 2. Upload file to Cloudinary
  const uploadResult = await fileService.saveFile(file);

  // 3. Create Evidence record
  const evidence = await prisma.evidence.create({
    data: {
      deliverableId,
      uploaderId,
      fileUrl: uploadResult.path,
      fileName: file.filename, // Store original filename
      fileType: uploadResult.mimetype,
    },
  });

  await createActivityLog({
    userId: uploaderId,
    action: "EVIDENCE_UPLOADED",
    entityType: "Deliverable",
    entityId: deliverable.id,
    details: `Evidence "${file.filename}" uploaded for deliverable "${deliverable.title}"`,
  });

  return evidence;
}

export async function getEvidenceByDeliverable(deliverableId: string) {
  return prisma.evidence.findMany({
    where: { deliverableId },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteEvidence(id: string, userId: string) {
  const evidence = await prisma.evidence.findUnique({
    where: { id },
    include: { deliverable: true },
  });

  if (!evidence) {
    throw new NotFoundError("Evidence", id);
  }

  // Optional: Check if user is allowed to delete (e.g., uploader or admin)
  // For now, we assume the controller handles role checks, but we could add ownership check here.

  // 1. Delete from Cloudinary
  // We need to extract the public_id from the URL or store it. 
  // Since we didn't store it explicitly in a separate column, we can try to extract it.
  // However, for now, we will skip deletion from Cloudinary if we can't easily get the ID, 
  // or we can assume the fileUrl contains it.
  // A better approach would be to add a publicId column to the schema, but we are working with existing schema.
  
  // Attempt to extract public_id from Cloudinary URL
  // Example: https://res.cloudinary.com/demo/image/upload/v1570979139/nexus_uploads/sample.jpg
  const urlParts = evidence.fileUrl.split('/');
  const filenameWithExt = urlParts[urlParts.length - 1];
  const publicId = `nexus_uploads/${filenameWithExt.split('.')[0]}`; // Assuming folder is nexus_uploads

  await fileService.deleteFile(publicId);

  // 2. Delete from DB
  await prisma.evidence.delete({
    where: { id },
  });

  await createActivityLog({
    userId,
    action: "EVIDENCE_DELETED",
    entityType: "Deliverable",
    entityId: evidence.deliverableId,
    details: `Evidence "${evidence.fileName}" deleted from deliverable "${evidence.deliverable.title}"`,
  });
}
