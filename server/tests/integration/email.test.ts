import { describe, it, expect, beforeEach, beforeAll, afterAll, vi, Mock } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { Role } from "../../src/generated/client";
import nodemailer from 'nodemailer'; // Import nodemailer to mock it

// Mock nodemailer to prevent actual emails from being sent
vi.mock('nodemailer', () => {
  const createTransport = vi.fn().mockReturnValue({
    sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
  });
  return {
    default: {
      createTransport,
    },
    createTransport,
  };
});

describe("Email Service Integration Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let teamLeadToken: string;
  const prisma = getPrismaClient();
  const mockSendMail = nodemailer.createTransport().sendMail as Mock;

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
    vi.clearAllMocks(); // Clear mocks before each test

    // Create a Team Lead
    await prisma.user.create({
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
  });

  describe("POST /api/v1/auth/invite", () => {
    it("should successfully invite a user and send an email", async () => {
      const newEmail = "newuser@example.com";
      const newName = "New User";
      const newRole = "MEMBER";

      const res = await request
        .post("/api/v1/auth/invite")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          email: newEmail,
          name: newName,
          role: newRole,
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("User invited successfully. An email with credentials has been sent.");
      
      // Verify email was sent
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const emailArgs = mockSendMail.mock.calls[0][0];

      expect(emailArgs.to).toBe(newEmail);
      expect(emailArgs.subject).toContain("Welcome to Nexus");
      expect(emailArgs.html).toContain(newEmail);
      expect(emailArgs.html).toContain("Temporary Password:");
      expect(emailArgs.html).toContain("Login to Nexus");

      // Verify user was created in DB
      const createdUser = await prisma.user.findUnique({ where: { email: newEmail } });
      expect(createdUser).not.toBeNull();
      expect(createdUser?.name).toBe(newName);
      expect(createdUser?.role).toBe(newRole);
      // We cannot get the plain text temporary password to assert here, but the email mock ensures it was in the email
    });

    it("should fail if trying to invite an existing user", async () => {
      const existingEmail = "lead@example.com";

      const res = await request
        .post("/api/v1/auth/invite")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          email: existingEmail,
          name: "Existing User",
          role: "MEMBER",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("User with this email already exists");
      expect(mockSendMail).not.toHaveBeenCalled(); // No email should be sent
    });

    it("should fail if not authenticated as TEAM_LEAD", async () => {
      const newEmail = "unauth@example.com";
      // Create a regular member to get a token
      await prisma.user.create({
        data: { email: "member@example.com", passwordHash: await hashPassword("password123"), name: "Member", role: "MEMBER" }
      });
      const memberLogin = await request.post("/api/v1/auth/login").send({ email: "member@example.com", password: "password123" });
      const memberToken = memberLogin.body.token;

      const res = await request
        .post("/api/v1/auth/invite")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({
          email: newEmail,
          name: "Unauthorized User",
          role: "MEMBER",
        });

      expect(res.status).toBe(403);
      expect(mockSendMail).not.toHaveBeenCalled(); // No email should be sent
    });

    it("should handle email sending failures gracefully", async () => {
      mockSendMail.mockRejectedValueOnce(new Error("Mock email sending failed")); // Simulate failure

      const newEmail = "fail@example.com";
      const newName = "Fail User";

      const res = await request
        .post("/api/v1/auth/invite")
        .set("Authorization", `Bearer ${teamLeadToken}`)
        .send({
          email: newEmail,
          name: newName,
          role: "MEMBER",
        });

      expect(res.status).toBe(500); // Expect internal server error
      expect(res.body.error).toContain("Failed to send email");
      
      // Verify user was still created (important! creation shouldn't rollback due to email issue)
      const createdUser = await prisma.user.findUnique({ where: { email: newEmail } });
      expect(createdUser).not.toBeNull();
    });
  });
});
