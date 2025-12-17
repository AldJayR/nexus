import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";

describe("Project Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let memberToken: string;
  let teamLeadId: string;
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

    // Login as Member
    const memberLogin = await request.post("/api/v1/auth/login").send({
      email: "member@example.com",
      password: "password123",
    });
    memberToken = memberLogin.body.token;
  });

  describe("POST /api/v1/project", () => {
    it("should create a project when authenticated as TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/project")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          name: "New Project",
          description: "A test project",
          startDate: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("New Project");
      expect(res.body.id).toBeDefined();
    });

    it("should fail if a project already exists (Singleton)", async () => {
      // Create first project
      await request
        .post("/api/v1/project")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          name: "First Project",
          startDate: new Date().toISOString(),
        });

      // Try to create second project
      const res = await request
        .post("/api/v1/project")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          name: "Second Project",
          startDate: new Date().toISOString(),
        });

      expect(res.status).toBe(400);
    });

    it("should fail if required fields are missing", async () => {
      const res = await request
        .post("/api/v1/project")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          description: "Missing name",
        });

      expect(res.status).toBe(400);
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/project")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          name: "Unauthorized Project",
          startDate: new Date().toISOString(),
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/project", () => {
    it("should return the project if it exists", async () => {
      // Create a project first
      await prisma.project.create({
        data: {
          name: "Project 1",
          startDate: new Date(),
        },
      });

      const res = await request
        .get("/api/v1/project")
        .set("Authorization", `Bearer ${memberToken}`); // Members can view

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Project 1");
      expect(res.body.id).toBeDefined();
    });

    it("should return 404 if no project exists", async () => {
      const res = await request
        .get("/api/v1/project")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/v1/project", () => {
    it("should update the project", async () => {
      // Create a project first
      await prisma.project.create({
        data: {
          name: "Old Name",
          startDate: new Date(),
        },
      });

      const res = await request
        .put("/api/v1/project")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          name: "Updated Name",
        });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated Name");
    });

    it("should fail if no project exists", async () => {
      const res = await request
        .put("/api/v1/project")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          name: "Updated Name",
        });

      expect(res.status).toBe(404);
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      // Create a project first
      await prisma.project.create({
        data: {
          name: "Project",
          startDate: new Date(),
        },
      });

      const res = await request
        .put("/api/v1/project")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          name: "Updated Name",
        });

      expect(res.status).toBe(403);
    });
  });
});
