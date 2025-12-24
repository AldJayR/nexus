import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { buildApp } from "../src/app.js";
import { getPrismaClient } from "../src/utils/database.js";
import bcrypt from 'bcryptjs';

const prisma = getPrismaClient();

describe("Search API", () => {
  let app: any;
  let token: string;
  let userId: string;
  let projectId: string;
  let phaseId: string;
  let sprintId: string;

  // App setup - only once
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  }, 30000);

  // Data setup - before each test (after global beforeEach clears DB)
  beforeEach(async () => {
    // 1. Create User & Login
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: 'search-tester@example.com',
        name: 'Search Tester',
        passwordHash: hashedPassword,
        role: 'TEAM_LEAD',
      },
    });
    userId = user.id;

    const loginResponse = await request(app.server)
      .post('/api/v1/auth/login')
      .send({
        email: 'search-tester@example.com',
        password: password,
      });

    token = loginResponse.body.token;

    // 2. Create Project Context
    const project = await prisma.project.create({
      data: {
        name: "Search Test Project",
        startDate: new Date(),
      }
    });
    projectId = project.id;

    const phase = await prisma.phase.create({
      data: {
        projectId,
        type: "SCRUM",
        name: "Dev Phase"
      }
    });
    phaseId = phase.id;

    const sprint = await prisma.sprint.create({
      data: {
        projectId,
        number: 1,
        startDate: new Date(),
        endDate: new Date(),
      }
    });
    sprintId = sprint.id;

    // 3. Seed Searchable Data with unique term "SuperLog"
    // Task
    await prisma.task.create({
      data: {
        title: "Fix SuperLog bug",
        description: "The SuperLog is not logging correctly",
        status: "TODO",
        sprintId,
        assigneeId: userId,
      }
    });

    // Deliverable
    await prisma.deliverable.create({
      data: {
        title: "SuperLog Design Doc",
        description: "Architecture for SuperLog",
        status: "NOT_STARTED",
        phaseId,
      }
    });

    // Comment
    const taskForComment = await prisma.task.create({
      data: {
        title: "Another Task",
        sprintId,
      }
    });

    await prisma.comment.create({
      data: {
        content: "I think SuperLog is ready",
        authorId: userId,
        taskId: taskForComment.id,
      }
    });

    // Meeting Log
    await prisma.meetingLog.create({
      data: {
        title: "SuperLog Kickoff Meeting",
        date: new Date(),
        fileUrl: "http://example.com/log.pdf",
        uploaderId: userId,
        phaseId
      }
    });
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 30000);

  it("should return all matching items for query 'SuperLog'", async () => {
    if (!token) throw new Error("Token not set!");

    const response = await request(app.server)
      .get("/api/v1/search")
      .query({ q: "SuperLog" })
      .set("Authorization", `Bearer ${token}`);

    if (response.status !== 200) {
      console.log("Status:", response.status);
      console.log("Body:", JSON.stringify(response.body, null, 2));
    }

    expect(response.status).toBe(200);
    expect(response.body.tasks).toHaveLength(1);
    expect(response.body.tasks[0].title).toContain("SuperLog");

    expect(response.body.deliverables).toHaveLength(1);
    expect(response.body.deliverables[0].title).toContain("SuperLog");

    expect(response.body.comments).toHaveLength(1);
    expect(response.body.comments[0].content).toContain("SuperLog");

    expect(response.body.meetingLogs).toHaveLength(1);
    expect(response.body.meetingLogs[0].title).toContain("SuperLog");
  });

  it("should return empty arrays when no matches found", async () => {
    const response = await request(app.server)
      .get("/api/v1/search")
      .query({ q: "NonExistentTermXYZ" })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.tasks).toHaveLength(0);
    expect(response.body.deliverables).toHaveLength(0);
    expect(response.body.comments).toHaveLength(0);
    expect(response.body.meetingLogs).toHaveLength(0);
  });

  it("should require authentication", async () => {
    const response = await request(app.server)
      .get("/api/v1/search")
      .query({ q: "SuperLog" });

    expect(response.status).toBe(401);
  });

  it("should validate empty query", async () => {
    const response = await request(app.server)
      .get("/api/v1/search")
      .query({ q: "" }) // Empty string
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});