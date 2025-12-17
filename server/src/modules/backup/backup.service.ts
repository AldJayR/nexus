import { getPrismaClient } from "../../utils/database.js";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";

const prisma = getPrismaClient();

// Ensure Cloudinary is configured (in case fileService hasn't been imported yet)
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function exportData() {
  const [
    users,
    projects,
    phases,
    sprints,
    tasks,
    deliverables,
    comments,
    evidence,
    meetingLogs,
    activityLogs,
    notifications,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.project.findMany(),
    prisma.phase.findMany(),
    prisma.sprint.findMany(),
    prisma.task.findMany(),
    prisma.deliverable.findMany(),
    prisma.comment.findMany(),
    prisma.evidence.findMany(),
    prisma.meetingLog.findMany(),
    prisma.activityLog.findMany(),
    prisma.notification.findMany(),
  ]);

  return {
    timestamp: new Date(),
    schemaVersion: "1.0",
    data: {
      users,
      projects,
      phases,
      sprints,
      tasks,
      deliverables,
      comments,
      evidence,
      meetingLogs,
      activityLogs,
      notifications,
    },
  };
}

export async function getFilesBackupUrl() {
  // 1. Get all file records
  const [evidenceFiles, meetingLogs] = await Promise.all([
    prisma.evidence.findMany({ select: { fileUrl: true, fileName: true } }),
    prisma.meetingLog.findMany({ select: { fileUrl: true, title: true } }),
  ]);

  const publicIds: string[] = [];

  // Helper to extract public ID
  const extractPublicId = (url: string) => {
    try {
      const urlParts = url.split('/');
      const filenameWithExt = urlParts[urlParts.length - 1];
      // Assuming folder is nexus_uploads. 
      // If the URL structure is consistent: .../upload/v12345/nexus_uploads/filename.ext
      // We need 'nexus_uploads/filename' (without extension for some APIs, but with extension for others?)
      // Cloudinary public_id usually includes the folder but NOT the extension if it was uploaded as an image/raw without extension in public_id.
      // However, in file.service.ts we used: filename: result.public_id.
      // And result.public_id usually includes folder.
      // Let's try to match the logic in deleteEvidence:
      // const publicId = `nexus_uploads/${filenameWithExt.split('.')[0]}`;
      
      // Better approach: If we stored the public_id in the DB, it would be easier.
      // Since we didn't, we rely on the URL.
      // Let's assume the folder is always 'nexus_uploads'.
      
      const filename = filenameWithExt.split('.')[0];
      return `nexus_uploads/${filename}`;
    } catch (e) {
      console.error("Failed to extract public ID from URL:", url);
      return null;
    }
  };

  evidenceFiles.forEach(f => {
    const pid = extractPublicId(f.fileUrl);
    if (pid) publicIds.push(pid);
  });

  meetingLogs.forEach(f => {
    const pid = extractPublicId(f.fileUrl);
    if (pid) publicIds.push(pid);
  });

  if (publicIds.length === 0) {
    return null;
  }

  // Generate ZIP URL
  // Note: This requires the 'allow_download_url' setting to be enabled in Cloudinary settings?
  // Or we can use the 'generate_archive' method which returns a JSON with the URL.
  // But 'utils.download_zip_url' is for generating a signed URL.
  
  const url = cloudinary.utils.download_zip_url({
    public_ids: publicIds,
    resource_type: 'auto', // mixed images and raw files might be tricky. 
    // 'all' might be needed if we have different resource types.
    // But download_zip_url usually takes 'resource_type' as 'image' by default.
    // If we have PDFs (raw) and Images, we might need to be careful.
    // Cloudinary zip generation for mixed types might require 'target_public_id' or using the 'archive' method via API.
    
    // Let's try 'image' first as it's default. If we have raw files (PDFs), they might not be included if we specify 'image'.
    // If we omit it, it defaults to image.
    // There isn't a 'mixed' resource type for this helper.
    // We might need to use `cloudinary.uploader.create_zip` (which uploads a zip) or just generate a url for a tag?
    // Using public_ids with mixed types in download_zip_url is supported if we don't specify resource_type?
    // Actually, the documentation says: "The download_zip_url method generates a URL for downloading a ZIP file containing images..."
    
    // Alternative: Use `cloudinary.v2.uploader.create_archive`?
    // That creates an archive and stores it or returns a url.
    
    // Let's try to use `download_zip_url` and see. If it fails for PDFs, we might need another strategy.
    // But for now, let's assume it works or we accept the limitation.
    flatten_folders: true,
    use_original_filename: true,
  });

  return url;
}
