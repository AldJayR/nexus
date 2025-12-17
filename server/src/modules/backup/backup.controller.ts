import { FastifyReply, FastifyRequest } from "fastify";
import { exportData, getFilesBackupUrl } from "./backup.service.js";
import { Role } from "../../generated/client.js";

export async function exportDataHandler(request: FastifyRequest, reply: FastifyReply) {
  // Check permission (Team Lead only)
  if (request.user?.role !== Role.TEAM_LEAD) {
    return reply.status(403).send({ message: "Forbidden: Only Team Leads can export data" });
  }

  const data = await exportData();
  
  // Set headers for file download
  reply.header("Content-Disposition", `attachment; filename="nexus_backup_${new Date().toISOString().split('T')[0]}.json"`);
  reply.header("Content-Type", "application/json");
  
  return reply.send(data);
}

export async function getFilesBackupUrlHandler(request: FastifyRequest, reply: FastifyReply) {
  // Check permission (Team Lead only)
  if (request.user?.role !== Role.TEAM_LEAD) {
    return reply.status(403).send({ message: "Forbidden: Only Team Leads can download file backups" });
  }

  const url = await getFilesBackupUrl();

  if (!url) {
    return reply.status(404).send({ message: "No files found to backup" });
  }

  return reply.send({ url });
}
