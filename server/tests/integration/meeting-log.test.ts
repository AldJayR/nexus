import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { PhaseType } from "../../src/generated/client";
import { fileService } from "../../src/services/file.service";
import path from "path";
import fs from "fs";

// Mock file service to avoid real Cloudinary calls
const saveFileSpy = vi.spyOn(fileService, 'saveFile');
const deleteFileSpy = vi.spyOn(fileService, 'deleteFile');

describe("MeetingLog Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let teamLeadId: string;
  let memberToken: string;
  let projectId: string;
  let sprintId: string;
  let phaseId: string;
  let memberId: string;
  const prisma = getPrismaClient();

  // Create a dummy file for testing
  const dummyFilePath = path.join(__dirname, 'test-meeting.pdf');
  
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    request = supertest(app.server);

    // Create dummy file
    fs.writeFileSync(dummyFilePath, 'dummy pdf content');
  });

  afterAll(async () => {
    await app.close();
    // Clean up dummy file
    if (fs.existsSync(dummyFilePath)) {
      fs.unlinkSync(dummyFilePath);
    }
  });

  beforeEach(async () => {
    await clearDatabase();
    vi.clearAllMocks();

    // Setup mocks
    saveFileSpy.mockResolvedValue({
      filename: 'nexus_uploads/test-meeting',
      path: 'https://res.cloudinary.com/demo/image/upload/v123456789/nexus_uploads/test-meeting.pdf',
      mimetype: 'application/pdf',
      size: 2048
    });

    deleteFileSpy.mockResolvedValue(undefined);

    // Create a Team Lead
    const teamLead = await prisma.user.create({
      data: {
        email: "lead@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Team Lead",
        role: "TEAM_LEAD",
      },
    });
    teamLeadId = teamLead.id;

    // Login as Team Lead
    const leadLogin = await request.post("/api/v1/auth/login").send({
      email: "lead@example.com",
      password: "password123",
    });
    teamLeadToken = leadLogin.body.token;

    // Create a Member
    const member = await prisma.user.create({
      data: {
        email: "member@example.com",
        passwordHash: await hashPassword("password123"),
        name: "Member",
        role: "MEMBER",
      },
    });
    memberId = member.id;

    // Login as Member
    const memberLogin = await request.post("/api/v1/auth/login").send({
      email: "member@example.com",
      password: "password123",
    });
    memberToken = memberLogin.body.token;

    // Create Project, Phase and Sprint
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        startDate: new Date(),
      },
    });
    projectId = project.id;

    const phase = await prisma.phase.create({
      data: {
        projectId,
        type: PhaseType.WATERFALL,
        name: "Planning Phase",
      },
    });
    phaseId = phase.id;

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        number: 1,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // 1 week later
      },
    });
    sprintId = sprint.id;
  });

  describe("POST /api/v1/meeting-logs", () => {
    it("should upload a meeting log for a sprint successfully", async () => {
      const res = await request
        .post("/api/v1/meeting-logs")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("sprintId", sprintId)
        .field("title", "Sprint 1 Standup")
        .field("date", new Date().toISOString())
        .attach("file", dummyFilePath);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Sprint 1 Standup");
      expect(res.body.fileUrl).toBeDefined();
      expect(res.body.sprintId).toBe(sprintId);
      expect(res.body.uploaderId).toBe(memberId);
      expect(saveFileSpy).toHaveBeenCalled();
    });

    it("should upload a meeting log for a phase successfully", async () => {
      const res = await request
        .post("/api/v1/meeting-logs")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("phaseId", phaseId)
        .field("title", "Waterfall Kickoff")
        .field("date", new Date().toISOString())
        .attach("file", dummyFilePath);

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Waterfall Kickoff");
      expect(res.body.fileUrl).toBeDefined();
      expect(res.body.phaseId).toBe(phaseId);
      expect(res.body.uploaderId).toBe(memberId);
      expect(saveFileSpy).toHaveBeenCalled();
    });

    it("should fail if no file is provided", async () => {
      const res = await request
        .post("/api/v1/meeting-logs")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("sprintId", sprintId)
        .field("title", "Sprint 1 Standup")
        .field("date", new Date().toISOString());

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("File is required");
    });

    it("should fail if both sprintId and phaseId are missing", async () => {
      const res = await request
        .post("/api/v1/meeting-logs")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("title", "Sprint 1 Standup")
        .field("date", new Date().toISOString())
        .attach("file", dummyFilePath);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Validation error");
    });

    it("should fail if sprint does not exist", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";
        const res = await request
          .post("/api/v1/meeting-logs")
          .set("Authorization", `Bearer ${memberToken}`)
          .field("sprintId", fakeId)
          .field("title", "Sprint 1 Standup")
          .field("date", new Date().toISOString())
          .attach("file", dummyFilePath);
  
        expect(res.status).toBe(404);
      });

    it("should fail if phase does not exist", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await request
        .post("/api/v1/meeting-logs")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("phaseId", fakeId)
        .field("title", "Phase Meeting")
        .field("date", new Date().toISOString())
        .attach("file", dummyFilePath);

      expect(res.status).toBe(404);
    });

    it("should fail if title is missing", async () => {
        const res = await request
          .post("/api/v1/meeting-logs")
          .set("Authorization", `Bearer ${memberToken}`)
          .field("sprintId", sprintId)
          .field("date", new Date().toISOString())
          .attach("file", dummyFilePath);
  
        expect(res.status).toBe(400);
      });

    it("should fail if date is missing or invalid", async () => {
        const res = await request
          .post("/api/v1/meeting-logs")
          .set("Authorization", `Bearer ${memberToken}`)
          .field("sprintId", sprintId)
          .field("title", "Sprint 1 Standup")
          .attach("file", dummyFilePath);
  
        expect(res.status).toBe(400);
      });
  });

  describe("GET /api/v1/meeting-logs/sprint/:sprintId", () => {
    it("should list meeting logs for a sprint", async () => {
      // Seed a meeting log manually
      await prisma.meetingLog.create({
        data: {
          sprintId,
          uploaderId: teamLeadId,
          title: "Initial Meeting",
          date: new Date(),
          fileUrl: "http://example.com/initial-meeting.pdf",
        }
      });

      const res = await request
        .get(`/api/v1/meeting-logs/sprint/${sprintId}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Initial Meeting");
      expect(res.body[0].uploader).toBeDefined();
    });
  });

  describe("GET /api/v1/meeting-logs/phase/:phaseId", () => {
    it("should list meeting logs for a phase", async () => {
      // Seed a meeting log manually
      await prisma.meetingLog.create({
        data: {
          phaseId,
          uploaderId: memberId,
          title: "Phase Meeting",
          date: new Date(),
          fileUrl: "http://example.com/phase-meeting.pdf",
        }
      });

      const res = await request
        .get(`/api/v1/meeting-logs/phase/${phaseId}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Phase Meeting");
      expect(res.body[0].uploader).toBeDefined();
    });
  });

  describe("DELETE /api/v1/meeting-logs/:id", () => {
    it("should delete a sprint meeting log", async () => {
      const meetingLog = await prisma.meetingLog.create({
        data: {
          sprintId,
          uploaderId: memberId,
          title: "To Delete",
          date: new Date(),
          fileUrl: "http://example.com/to-delete.pdf",
        }
      });

      const res = await request
        .delete(`/api/v1/meeting-logs/${meetingLog.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);
      expect(deleteFileSpy).toHaveBeenCalledWith("nexus_uploads/to-delete");

      const check = await prisma.meetingLog.findUnique({
        where: { id: meetingLog.id },
      });
      expect(check).toBeNull();
    });

    it("should delete a phase meeting log", async () => {
      const meetingLog = await prisma.meetingLog.create({
        data: {
          phaseId,
          uploaderId: memberId,
          title: "Phase Meeting To Delete",
          date: new Date(),
          fileUrl: "http://example.com/phase-delete.pdf",
        }
      });

      const res = await request
        .delete(`/api/v1/meeting-logs/${meetingLog.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);
      
      const check = await prisma.meetingLog.findUnique({
        where: { id: meetingLog.id },
      });
      expect(check).toBeNull();
    });
  });
});