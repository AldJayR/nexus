import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";

describe("Sprint Integration Tests", () => {
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

    // Create Project
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        startDate: new Date(),
      },
    });
    projectId = project.id;
  });

  describe("POST /api/v1/sprints", () => {
    it("should create a sprint when authenticated as TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/sprints")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          projectId,
          number: 1,
          goal: "First Sprint",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        });

      expect(res.status).toBe(201);
      expect(res.body.number).toBe(1);
      expect(res.body.goal).toBe("First Sprint");
      expect(res.body.id).toBeDefined();
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/sprints")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          projectId,
          number: 1,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/sprints", () => {
    it("should list all sprints", async () => {
      await prisma.sprint.create({
        data: {
          projectId,
          number: 1,
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      const res = await request
        .get("/api/v1/sprints")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].number).toBe(1);
    });
  });

  describe("GET /api/v1/sprints/:id", () => {
    it("should return a specific sprint", async () => {
      const sprint = await prisma.sprint.create({
        data: {
          projectId,
          number: 2,
          goal: "Target Sprint",
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      const res = await request
        .get(`/api/v1/sprints/${sprint.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(sprint.id);
      expect(res.body.goal).toBe("Target Sprint");
    });
  });

  describe("PUT /api/v1/sprints/:id", () => {
    it("should update a sprint", async () => {
      const sprint = await prisma.sprint.create({
        data: {
          projectId,
          number: 1,
          goal: "Old Goal",
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      const res = await request
        .put(`/api/v1/sprints/${sprint.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          goal: "Updated Goal",
        });

      expect(res.status).toBe(200);
      expect(res.body.goal).toBe("Updated Goal");
    });
  });

  describe("DELETE /api/v1/sprints/:id", () => {
    it("should soft delete a sprint", async () => {
      const sprint = await prisma.sprint.create({
        data: {
          projectId,
          number: 1,
          startDate: new Date(),
          endDate: new Date(),
        },
      });

      const res = await request
        .delete(`/api/v1/sprints/${sprint.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);

      const check = await prisma.sprint.findUnique({
        where: { id: sprint.id },
      });
      expect(check).not.toBeNull();
      if (check) {
        expect(check.deletedAt).not.toBeNull();
      }
    });
  describe("POST /api/v1/sprints/:id/restore", () => {
    it("should restore a soft-deleted sprint", async () => {
      const sprint = await prisma.sprint.create({
        data: {
          projectId,
          number: 1,
          startDate: new Date(),
          endDate: new Date(),
          deletedAt: new Date(),
        },
      });

      const res = await request
        .post(`/api/v1/sprints/${sprint.id}/restore`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deletedAt).toBeNull();

      const check = await prisma.sprint.findUnique({
        where: { id: sprint.id },
      });
      expect(check).not.toBeNull();
      if (check) {
        expect(check.deletedAt).toBeNull();
      }
    });
  });
});
})
