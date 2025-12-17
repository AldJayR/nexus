import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { PhaseType, DeliverableStatus } from "../../src/generated/client";

describe("Deliverable Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let memberToken: string;
  let projectId: string;
  let phaseId: string;
  const prisma = getPrismaClient();

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    request = supertest(app.server);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearDatabase();

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

    // Create Project and Phase
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
  });

  describe("POST /api/v1/deliverables", () => {
    it("should create a deliverable when authenticated as TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/deliverables")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          phaseId,
          title: "Project Plan",
          description: "Detailed project plan",
          dueDate: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Project Plan");
      expect(res.body.status).toBe(DeliverableStatus.NOT_STARTED);
      expect(res.body.id).toBeDefined();
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/deliverables")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          phaseId,
          title: "Unauthorized Deliverable",
          dueDate: new Date().toISOString(),
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/deliverables", () => {
    it("should list deliverables filtered by phase", async () => {
      await prisma.deliverable.create({
        data: {
          phaseId,
          title: "Deliverable 1",
          status: DeliverableStatus.NOT_STARTED,
        },
      });

      const res = await request
        .get(`/api/v1/deliverables?phaseId=${phaseId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Deliverable 1");
    });
  });

  describe("GET /api/v1/deliverables/:id", () => {
    it("should return a specific deliverable", async () => {
      const deliverable = await prisma.deliverable.create({
        data: {
          phaseId,
          title: "Target Deliverable",
          status: DeliverableStatus.IN_PROGRESS,
        },
      });

      const res = await request
        .get(`/api/v1/deliverables/${deliverable.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(deliverable.id);
      expect(res.body.title).toBe("Target Deliverable");
    });
  });

  describe("PUT /api/v1/deliverables/:id", () => {
    it("should update deliverable status", async () => {
      const deliverable = await prisma.deliverable.create({
        data: {
          phaseId,
          title: "To Update",
          status: DeliverableStatus.NOT_STARTED,
        },
      });

      const res = await request
        .put(`/api/v1/deliverables/${deliverable.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          status: DeliverableStatus.COMPLETED,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(DeliverableStatus.COMPLETED);
    });
  });

  describe("DELETE /api/v1/deliverables/:id", () => {
    it("should soft delete a deliverable", async () => {
      const deliverable = await prisma.deliverable.create({
        data: {
          phaseId,
          title: "To Delete",
          status: DeliverableStatus.NOT_STARTED,
        },
      });

      const res = await request
        .delete(`/api/v1/deliverables/${deliverable.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);

      // Verify soft delete
      const check = await prisma.deliverable.findUnique({
        where: { id: deliverable.id },
      });
      expect(check).not.toBeNull();
      if (check) {
        expect(check.deletedAt).not.toBeNull();
      }
    });
  });

  describe("POST /api/v1/deliverables/:id/restore", () => {
    it("should restore a soft-deleted deliverable", async () => {
      const deliverable = await prisma.deliverable.create({
        data: {
          phaseId,
          title: "To Restore",
          status: DeliverableStatus.NOT_STARTED,
          deletedAt: new Date(),
        },
      });

      const res = await request
        .post(`/api/v1/deliverables/${deliverable.id}/restore`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deletedAt).toBeNull();

      const check = await prisma.deliverable.findUnique({
        where: { id: deliverable.id },
      });
      expect(check).not.toBeNull();
      if (check) {
        expect(check.deletedAt).toBeNull();
      }
    });
  });
});
