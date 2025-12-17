import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { TaskStatus } from "../../src/generated/client";

describe("Comment Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let memberToken: string;
  let memberId: string;
  let projectId: string;
  let sprintId: string;
  let taskId: string;
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
    memberId = member.id;

    // Login as Member
    const memberLogin = await request.post("/api/v1/auth/login").send({
      email: "member@example.com",
      password: "password123",
    });
    memberToken = memberLogin.body.token;

    // Create Project, Sprint, and Task
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

    const task = await prisma.task.create({
      data: {
        sprintId,
        title: "Test Task",
        status: TaskStatus.TODO,
      },
    });
    taskId = task.id;
  });

  describe("POST /api/v1/comments", () => {
    it("should create a comment on a task", async () => {
      const res = await request
        .post("/api/v1/comments")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          taskId,
          content: "This is a comment",
        });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe("This is a comment");
      expect(res.body.taskId).toBe(taskId);
      expect(res.body.authorId).toBe(memberId);
    });

    it("should fail if content is missing", async () => {
      const res = await request
        .post("/api/v1/comments")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          taskId,
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/v1/comments", () => {
    it("should list comments for a task", async () => {
      await prisma.comment.create({
        data: {
          taskId,
          authorId: memberId,
          content: "Comment 1",
        },
      });

      const res = await request
        .get(`/api/v1/comments?taskId=${taskId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].content).toBe("Comment 1");
    });
  });

  describe("PUT /api/v1/comments/:id", () => {
    it("should update a comment if user is author", async () => {
      const comment = await prisma.comment.create({
        data: {
          taskId,
          authorId: memberId,
          content: "Old Content",
        },
      });

      const res = await request
        .put(`/api/v1/comments/${comment.id}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          content: "Updated Content",
        });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe("Updated Content");
    });

    it("should fail if user is not author", async () => {
      const comment = await prisma.comment.create({
        data: {
          taskId,
          authorId: memberId,
          content: "Member Comment",
        },
      });

      // Try to update as Team Lead (who is not the author)
      // Note: Requirements say Team Lead can delete, but usually only author updates content.
      // Let's assume only author can update content for now.
      const res = await request
        .put(`/api/v1/comments/${comment.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          content: "Hacked Content",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/comments/:id", () => {
    it("should delete a comment if user is author", async () => {
      const comment = await prisma.comment.create({
        data: {
          taskId,
          authorId: memberId,
          content: "To Delete",
        },
      });

      const res = await request
        .delete(`/api/v1/comments/${comment.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(204);

      const check = await prisma.comment.findUnique({
        where: { id: comment.id },
      });
      expect(check).toBeNull();
    });

    it("should delete a comment if user is TEAM_LEAD", async () => {
      const comment = await prisma.comment.create({
        data: {
          taskId,
          authorId: memberId,
          content: "To Delete by Lead",
        },
      });

      const res = await request
        .delete(`/api/v1/comments/${comment.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);

      const check = await prisma.comment.findUnique({
        where: { id: comment.id },
      });
      expect(check).toBeNull();
    });
  });
});
