import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { PhaseType, DeliverableStatus } from "../../src/generated/client";
import { fileService } from "../../src/services/file.service";
import path from "path";
import fs from "fs";

// Mock file service to avoid real Cloudinary calls
const saveFileSpy = vi.spyOn(fileService, 'saveFile');
const deleteFileSpy = vi.spyOn(fileService, 'deleteFile');

describe("Evidence Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let memberToken: string;
  let projectId: string;
  let phaseId: string;
  let deliverableId: string;
  const prisma = getPrismaClient();

  // Create a dummy file for testing
  const dummyFilePath = path.join(__dirname, 'test-evidence.pdf');
  
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
      filename: 'nexus_uploads/test-evidence',
      path: 'https://res.cloudinary.com/demo/image/upload/v123456789/nexus_uploads/test-evidence.pdf',
      mimetype: 'application/pdf',
      size: 1024
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

    // Login as Member
    const memberLogin = await request.post("/api/v1/auth/login").send({
      email: "member@example.com",
      password: "password123",
    });
    memberToken = memberLogin.body.token;

    // Create Project, Phase, Deliverable
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

    const deliverable = await prisma.deliverable.create({
      data: {
        phaseId,
        title: "Test Deliverable",
        status: DeliverableStatus.NOT_STARTED,
      },
    });
    deliverableId = deliverable.id;
  });

  describe("POST /api/v1/evidence", () => {
    it("should upload evidence successfully", async () => {
      const res = await request
        .post("/api/v1/evidence")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("deliverableId", deliverableId)
        .attach("file", dummyFilePath);

      expect(res.status).toBe(201);
      expect(res.body.fileName).toBe("test-evidence.pdf"); // supertest sends filename
      expect(res.body.fileUrl).toBeDefined();
      expect(res.body.deliverableId).toBe(deliverableId);
      expect(saveFileSpy).toHaveBeenCalled();
    });

    it("should fail if no file is provided", async () => {
      const res = await request
        .post("/api/v1/evidence")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("deliverableId", deliverableId);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("File is required");
    });

    it("should fail if deliverableId is missing", async () => {
      const res = await request
        .post("/api/v1/evidence")
        .set("Authorization", `Bearer ${memberToken}`)
        .attach("file", dummyFilePath);

      expect(res.status).toBe(400);
    });

    it("should fail if deliverable does not exist", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";
        const res = await request
          .post("/api/v1/evidence")
          .set("Authorization", `Bearer ${memberToken}`)
          .field("deliverableId", fakeId)
          .attach("file", dummyFilePath);
  
        expect(res.status).toBe(404);
      });
  });

  describe("GET /api/v1/evidence/deliverable/:deliverableId", () => {
    it("should list evidence for a deliverable", async () => {
      // Seed some evidence manually (bypassing service to be quick, or use service)
      // Since we mocked the service, let's use Prisma directly to seed
      await prisma.evidence.create({
        data: {
          deliverableId,
          uploaderId: (await prisma.user.findUniqueOrThrow({ where: { email: "member@example.com" } })).id,
          fileName: "seed.pdf",
          fileUrl: "http://example.com/seed.pdf",
          fileType: "application/pdf"
        }
      });

      const res = await request
        .get(`/api/v1/evidence/deliverable/${deliverableId}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].fileName).toBe("seed.pdf");
      expect(res.body[0].uploader).toBeDefined();
    });
  });

  describe("DELETE /api/v1/evidence/:id", () => {
    it("should delete evidence", async () => {
      const uploader = await prisma.user.findUniqueOrThrow({ where: { email: "member@example.com" } });
      const evidence = await prisma.evidence.create({
        data: {
          deliverableId,
          uploaderId: uploader.id,
          fileName: "to-delete.pdf",
          fileUrl: "http://example.com/to-delete.pdf",
          fileType: "application/pdf"
        }
      });

      const res = await request
        .delete(`/api/v1/evidence/${evidence.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(204);

      // Check DB
      const check = await prisma.evidence.findUnique({
        where: { id: evidence.id },
      });
      expect(check).not.toBeNull();
      expect(check?.deletedAt).not.toBeNull();
    });
  });

  describe("POST /api/v1/evidence/:id/restore", () => {
    it("should restore soft-deleted evidence", async () => {
      const uploader = await prisma.user.findUniqueOrThrow({ where: { email: "member@example.com" } });
      const evidence = await prisma.evidence.create({
        data: {
          deliverableId,
          uploaderId: uploader.id,
          fileName: "to-restore.pdf",
          fileUrl: "http://example.com/to-restore.pdf",
          fileType: "application/pdf",
          deletedAt: new Date(),
        }
      });

      const res = await request
        .post(`/api/v1/evidence/${evidence.id}/restore`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deletedAt).toBeNull();

      const check = await prisma.evidence.findUnique({
        where: { id: evidence.id },
      });
      expect(check).not.toBeNull();
      expect(check?.deletedAt).toBeNull();
    });
  });
});
