import { FastifyInstance } from "fastify";
import { exportDataHandler, getFilesBackupUrlHandler } from "./backup.controller.js";

export async function backupRoutes(app: FastifyInstance) {
  app.get("/export", exportDataHandler);
  app.get("/files", getFilesBackupUrlHandler);
}
