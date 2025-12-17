import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { TaskStatus } from "../../src/generated/client";

describe("Task Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let memberToken: string;
  let memberId: string;
  let projectId: string;
  let sprintId: string;
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
    const teamLead = await prisma.user.upsert({
      where: { email: "lead@example.com" },
      update: {},
      create: {
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
    const member = await prisma.user.upsert({
      where: { email: "member@example.com" },
      update: {},
      create: {
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

    // Create Project and Sprint
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        startDate: new Date(),
      },
    });
    projectId = project.id;

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        number: 1,
        startDate: new Date(),
        endDate: new Date(),
      },
    });
    sprintId = sprint.id;
  });

  describe("POST /api/v1/tasks", () => {
    it("should create a task when authenticated as TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          sprintId,
          title: "New Task",
          description: "Task description",
          status: TaskStatus.TODO,
          assigneeId: memberId,
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("New Task");
      expect(res.body.assigneeId).toBe(memberId);
      expect(res.body.id).toBeDefined();
    });

    it("should fail if user is not TEAM_LEAD", async () => {
      const res = await request
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          sprintId,
          title: "Unauthorized Task",
          status: TaskStatus.TODO,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/tasks", () => {
    it("should list tasks filtered by sprint", async () => {
      await prisma.task.create({
        data: {
          sprintId,
          title: "Task 1",
          status: TaskStatus.TODO,
        },
      });

      const res = await request
        .get(`/api/v1/tasks?sprintId=${sprintId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Task 1");
    });
  });

  describe("GET /api/v1/tasks/:id", () => {
    it("should return a specific task", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Target Task",
          status: TaskStatus.IN_PROGRESS,
        },
      });

      const res = await request
        .get(`/api/v1/tasks/${task.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(task.id);
      expect(res.body.title).toBe("Target Task");
    });
  });

  describe("PUT /api/v1/tasks/:id", () => {
    it("should update a task", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Old Title",
          status: TaskStatus.TODO,
        },
      });

      const res = await request
        .put(`/api/v1/tasks/${task.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          title: "Updated Title",
          status: TaskStatus.IN_PROGRESS,
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Title");
      expect(res.body.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe("PATCH /api/v1/tasks/:id/status", () => {
    it("should update task status", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Status Task",
          status: TaskStatus.TODO,
          assigneeId: memberId,
        },
      });

      const res = await request
        .patch(`/api/v1/tasks/${task.id}/status`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          status: TaskStatus.DONE,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(TaskStatus.DONE);
    });

    it("should fail if status is BLOCKED without comment", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "Blocked Task",
          status: TaskStatus.IN_PROGRESS,
          assigneeId: memberId,
        },
      });

      const res = await request
        .patch(`/api/v1/tasks/${task.id}/status`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          status: TaskStatus.BLOCKED,
          // Missing comment
        });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/tasks/:id", () => {
    it("should soft delete a task", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "To Delete",
          status: TaskStatus.TODO,
        },
      });

      const res = await request
        .delete(`/api/v1/tasks/${task.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);

      const check = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(check).not.toBeNull();
      if (check) {
        expect(check.deletedAt).not.toBeNull();
      }
    });
  });

  describe("POST /api/v1/tasks/:id/restore", () => {
    it("should restore a soft-deleted task", async () => {
      const task = await prisma.task.create({
        data: {
          sprintId,
          title: "To Restore",
          status: TaskStatus.TODO,
          deletedAt: new Date(),
        },
      });

      const res = await request
        .post(`/api/v1/tasks/${task.id}/restore`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deletedAt).toBeNull();

      const check = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(check).not.toBeNull();
      if (check) {
        expect(check.deletedAt).toBeNull();
      }
    });
  });
});
