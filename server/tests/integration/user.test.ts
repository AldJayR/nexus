import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { Role } from "../../src/generated/client";

describe("User Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  let memberToken: string;
  let teamLeadId: string;
  let memberId: string;
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
    memberId = member.id;

    // Login as Member
    const memberLogin = await request.post("/api/v1/auth/login").send({
      email: "member@example.com",
      password: "password123",
    });
    memberToken = memberLogin.body.token;
  });

  describe("GET /api/v1/users", () => {
    it("should list all non-deleted users", async () => {
      // Create a deleted user
      await prisma.user.create({
        data: {
          email: "deleted@example.com",
          passwordHash: await hashPassword("password123"),
          name: "Deleted User",
          role: "MEMBER",
          deletedAt: new Date(),
        },
      });

      const res = await request
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${teamLeadToken}`); // Team Lead can see all

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2); // Only Team Lead and Member, not deleted user
      expect(res.body.some((user: any) => user.email === "lead@example.com")).toBe(true);
      expect(res.body.some((user: any) => user.email === "member@example.com")).toBe(true);
      expect(res.body.some((user: any) => user.email === "deleted@example.com")).toBe(false);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return a specific non-deleted user", async () => {
      const res = await request
        .get(`/api/v1/users/${memberId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(memberId);
      expect(res.body.email).toBe("member@example.com");
    });

    it("should not return a soft-deleted user", async () => {
      const deletedUser = await prisma.user.create({
        data: {
          email: "softdeleted@example.com",
          passwordHash: await hashPassword("password123"),
          name: "Soft Deleted User",
          role: "MEMBER",
          deletedAt: new Date(),
        },
      });

      const res = await request
        .get(`/api/v1/users/${deletedUser.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should soft delete a user (Team Lead only)", async () => {
      const userToDelete = await prisma.user.create({
        data: {
          email: "todelete@example.com",
          passwordHash: await hashPassword("password123"),
          name: "User To Delete",
          role: "MEMBER",
        },
      });

      const res = await request
        .delete(`/api/v1/users/${userToDelete.id}`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(204);

      const check = await prisma.user.findUnique({
        where: { id: userToDelete.id },
      });
      expect(check).not.toBeNull();
      expect(check?.deletedAt).not.toBeNull();
    });

    it("should prevent non-Team Leads from deleting users", async () => {
      const userToDelete = await prisma.user.create({
        data: {
          email: "another@example.com",
          passwordHash: await hashPassword("password123"),
          name: "Another User",
          role: "MEMBER",
        },
      });

      const res = await request
        .delete(`/api/v1/users/${userToDelete.id}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/v1/users/:id/restore", () => {
    it("should restore a soft-deleted user (Team Lead only)", async () => {
      const userToRestore = await prisma.user.create({
        data: {
          email: "torestore@example.com",
          passwordHash: await hashPassword("password123"),
          name: "User To Restore",
          role: "MEMBER",
          deletedAt: new Date(),
        },
      });

      const res = await request
        .post(`/api/v1/users/${userToRestore.id}/restore`)
        .set("Authorization", `Bearer ${teamLeadToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deletedAt).toBeNull();

      const check = await prisma.user.findUnique({
        where: { id: userToRestore.id },
      });
      expect(check).not.toBeNull();
      expect(check?.deletedAt).toBeNull();
    });

    it("should prevent non-Team Leads from restoring users", async () => {
      const userToRestore = await prisma.user.create({
        data: {
          email: "restorefail@example.com",
          passwordHash: await hashPassword("password123"),
          name: "Restore Fail User",
          role: "MEMBER",
          deletedAt: new Date(),
        },
      });

      const res = await request
        .post(`/api/v1/users/${userToRestore.id}/restore`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("User Contributions after soft delete", () => {
    let deliverableId: string;
    let sprintId: string;

    beforeEach(async () => {
        // Create Project and Sprint
        const project = await prisma.project.create({
            data: {
                name: "Contrib Project",
                startDate: new Date(),
            },
        });
        sprintId = (await prisma.sprint.create({
            data: {
                projectId: project.id,
                number: 1,
                startDate: new Date(),
                endDate: new Date(),
            },
        })).id;
        deliverableId = (await prisma.deliverable.create({
            data: {
                phaseId: (await prisma.phase.create({ data: { projectId: project.id, type: "WATERFALL", name: "Phase" } })).id,
                title: "Contrib Deliverable",
            },
        })).id;

        // Create initial tasks/evidence for memberId
        await prisma.task.create({
            data: { sprintId, title: "Task 1", assigneeId: memberId, status: "DONE" },
        });
        await prisma.task.create({
            data: { sprintId, title: "Task 2", assigneeId: memberId, status: "IN_PROGRESS" },
        });
        await prisma.evidence.create({
            data: { deliverableId, uploaderId: memberId, fileName: "file1.pdf", fileUrl: "url1", fileType: "application/pdf" },
        });
        await prisma.comment.create({
            data: { content: "Comment 1", authorId: memberId, taskId: (await prisma.task.findFirst({ where: { assigneeId: memberId } }))?.id },
        });
    });

    it("should not count soft-deleted tasks/evidence in user contributions", async () => {
        // Soft delete one task and one evidence for memberId
        await prisma.task.updateMany({
            where: { assigneeId: memberId, title: "Task 2" },
            data: { deletedAt: new Date() },
        });
        await prisma.evidence.updateMany({
            where: { uploaderId: memberId, fileName: "file1.pdf" },
            data: { deletedAt: new Date() },
        });

        const res = await request
            .get(`/api/v1/users/${memberId}/contributions`)
            .set("Authorization", `Bearer ${memberToken}`);

        expect(res.status).toBe(200);
        expect(res.body.assignedTasksCount).toBe(1); // Only Task 1 (non-deleted)
        expect(res.body.completedTasksCount).toBe(1); // Only Task 1 (non-deleted and DONE)
        expect(res.body.uploadedEvidenceCount).toBe(0); // All evidence deleted
        expect(res.body.commentsCount).toBe(1); // Comments are not soft-deleted by schema
    });

    it("should count restored tasks/evidence in user contributions", async () => {
        // Soft delete one task and one evidence for memberId
        const softDeletedTask = await prisma.task.updateMany({
            where: { assigneeId: memberId, title: "Task 2" },
            data: { deletedAt: new Date() },
        });
        const softDeletedEvidence = await prisma.evidence.updateMany({
            where: { uploaderId: memberId, fileName: "file1.pdf" },
            data: { deletedAt: new Date() },
        });

        // Restore them
        await prisma.task.updateMany({
            where: { assigneeId: memberId, title: "Task 2" },
            data: { deletedAt: null },
        });
        await prisma.evidence.updateMany({
            where: { uploaderId: memberId, fileName: "file1.pdf" },
            data: { deletedAt: null },
        });

        const res = await request
            .get(`/api/v1/users/${memberId}/contributions`)
            .set("Authorization", `Bearer ${memberToken}`);

        expect(res.status).toBe(200);
        expect(res.body.assignedTasksCount).toBe(2);
        expect(res.body.completedTasksCount).toBe(1);
        expect(res.body.uploadedEvidenceCount).toBe(1);
        expect(res.body.commentsCount).toBe(1);
    });
  });
});