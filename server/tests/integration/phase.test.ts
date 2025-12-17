import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { PhaseType } from "../../src/generated/client";

describe("Phase Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let memberToken: string;
  let projectId: string;
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

    // Create a Project (Required for Phases)
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        startDate: new Date(),
      },
    });
    projectId = project.id;
  });

  describe("POST /api/v1/phases", () => {
    it("should create a phase when authenticated as TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/phases")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          projectId: projectId,
          type: PhaseType.WATERFALL,
          name: "Planning Phase",
          description: "Initial planning",
          startDate: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Planning Phase");
      expect(res.body.type).toBe(PhaseType.WATERFALL);
      expect(res.body.id).toBeDefined();
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/phases")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          projectId: projectId,
          type: PhaseType.SCRUM,
          name: "Dev Phase",
        });

      expect(res.status).toBe(403);
    });

    it("should fail if required fields are missing", async () => {
      const res = await request
        .post("/api/v1/phases")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          // Missing type and name
          description: "Invalid phase",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/phases", () => {
    it("should list all phases", async () => {
      // Create phases
      await prisma.phase.createMany({
        data: [
          {
            projectId,
            type: PhaseType.WATERFALL,
            name: "Phase 1",
          },
          {
            projectId,
            type: PhaseType.SCRUM,
            name: "Phase 2",
          },
        ],
      });

      const res = await request
        .get("/api/v1/phases")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });
  });

  describe("GET /api/v1/phases/:id", () => {
    it("should return a specific phase with details", async () => {
      const phase = await prisma.phase.create({
        data: {
          projectId,
          type: PhaseType.FALL,
          name: "Testing Phase",
        },
      });

      const res = await request
        .get(`/api/v1/phases/${phase.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(phase.id);
      expect(res.body.name).toBe("Testing Phase");
      // Check if deliverables array exists (even if empty)
      expect(Array.isArray(res.body.deliverables)).toBe(true);
    });

    it("should return 404 for non-existent phase", async () => {
      const res = await request
        .get("/api/v1/phases/non-existent-id")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/v1/phases/:id", () => {
    it("should update a phase when authenticated as TEAM_LEAD", async () => {
      const phase = await prisma.phase.create({
        data: {
          projectId,
          type: PhaseType.WATERFALL,
          name: "Old Name",
        },
      });

      const res = await request
        .put(`/api/v1/phases/${phase.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          name: "Updated Phase Name",
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated Phase Name");
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      const phase = await prisma.phase.create({
        data: {
          projectId,
          type: PhaseType.WATERFALL,
          name: "Phase",
        },
      });

      const res = await request
        .put(`/api/v1/phases/${phase.id}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          name: "Hacked Name",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/phases/:id", () => {
    it("should delete a phase when authenticated as TEAM_LEAD", async () => {
      const phase = await prisma.phase.create({
        data: {
          projectId,
          type: PhaseType.WATERFALL,
          name: "To Delete",
        },
      });

      const res = await request
        .delete(`/api/v1/phases/${phase.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);

      const check = await prisma.phase.findUnique({
        where: { id: phase.id },
      });
      expect(check).toBeNull();
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      const phase = await prisma.phase.create({
        data: {
          projectId,
          type: PhaseType.WATERFALL,
          name: "Safe Phase",
        },
      });

      const res = await request
        .delete(`/api/v1/phases/${phase.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });
});
