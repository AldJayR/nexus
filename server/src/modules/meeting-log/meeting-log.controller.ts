import { FastifyReply, FastifyRequest } from "fastify";
import { createMeetingLog, getMeetingLogsBySprint, getMeetingLogsByPhase, deleteMeetingLog } from "./meeting-log.service.js";
import { createMeetingLogSchema } from "./meeting-log.schema.js";

export async function createMeetingLogHandler(request: FastifyRequest, reply: FastifyReply) {
  const parts = request.parts();
  let fields: Record<string, any> = {};
  let fileData: { buffer: Buffer; mimetype: string; filename: string } | null = null;

  for await (const part of parts) {
    if (part.type === 'file') {
      // IMPORTANT: Consume the stream immediately to prevent timeout
      // Multipart streams must be consumed during iteration, not after
      const buffer = await part.toBuffer();
      fileData = {
        buffer,
        mimetype: part.mimetype,
        filename: part.filename,
      };
    } else {
      fields[part.fieldname] = part.value;
    }
  }

  if (!fileData) {
    return reply.status(400).send({ message: "File is required" });
  }

  const result = createMeetingLogSchema.safeParse(fields);
  if (!result.success) {
    return reply.status(400).send({ message: "Validation error", errors: result.error.format() });
  }

  const meetingLog = await createMeetingLog({
    ...result.data,
    uploaderId: request.user!.id,
    file: fileData,
  });

  return reply.code(201).send(meetingLog);
}

export async function getMeetingLogsBySprintHandler(request: FastifyRequest<{ Params: { sprintId: string } }>, reply: FastifyReply) {
  const { sprintId } = request.params;
  const logs = await getMeetingLogsBySprint(sprintId);
  return reply.code(200).send(logs);
}

export async function getMeetingLogsByPhaseHandler(request: FastifyRequest<{ Params: { phaseId: string } }>, reply: FastifyReply) {
  const { phaseId } = request.params;
  const logs = await getMeetingLogsByPhase(phaseId);
  return reply.code(200).send(logs);
}

export async function deleteMeetingLogHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const { id } = request.params;
  await deleteMeetingLog(id, request.user!.id);
  return reply.code(204).send();
}
