import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { getPrismaClient } from "../../src/utils/database";
import { clearDatabase } from "../helpers/reset-db";
import { hashPassword } from "../../src/utils/hash";
import { FastifyInstance } from "fastify";
import { PhaseType } from "../../src/generated/client";
import path from "path";
import fs from "fs";
// import { env } from "../../src/config/env"; // Don't import real env for size usage if we mock it

// Mock env to set a small MAX_FILE_SIZE for testing
vi.mock('../../src/config/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/config/env')>();
  return {
    ...actual,
    env: {
      ...actual.env,
      MAX_FILE_SIZE: 1024, // 1 KB limit for testing
    }
  };
});

import { v2 as cloudinary } from 'cloudinary';

// Mock Cloudinary
vi.mock('cloudinary', () => {
  return {
    v2: {
      config: vi.fn(),
      uploader: {
        upload_stream: vi.fn((options, callback) => {
          // Simulate async success
          const result = {
            public_id: 'nexus_uploads/test-file',
            secure_url: 'https://res.cloudinary.com/demo/image/upload/v123456789/nexus_uploads/test-file.pdf',
            bytes: 1024
          };
          const stream = {
            write: vi.fn(),
            end: vi.fn(),
            on: vi.fn(),
            once: vi.fn(),
            emit: vi.fn(),
            pipe: vi.fn().mockImplementation(function(this: any) { return this; })
          } as any;
          
          setTimeout(() => {
             callback(null, result);
          }, 10);

          return stream;
        }),
        destroy: vi.fn().mockResolvedValue({ result: 'ok' })
      }
    }
  };
});

describe("File Upload Validation Tests", () => {
  let app: FastifyInstance;
  let request: any;
  let memberToken: string;
  let projectId: string;
  let phaseId: string;
  let deliverableId: string;
  const prisma = getPrismaClient();

  // Paths for dummy files
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  const dummyJpegPath = path.join(__dirname, 'dummy.jpeg');
  const dummyTxtPath = path.join(__dirname, 'dummy.txt');
  const dummyLargePath = path.join(__dirname, 'dummy-large.pdf');

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    request = supertest(app.server);

    // Create dummy files (small enough < 1024)
    fs.writeFileSync(dummyPdfPath, Buffer.alloc(500, 'a')); // 500 bytes
    fs.writeFileSync(dummyJpegPath, Buffer.alloc(500, 'b'));
    fs.writeFileSync(dummyTxtPath, 'dummy text content');

    // Create a dummy large file (size > 1024)
    const largeContent = Buffer.alloc(1100, 'c'); // 1.1KB
    fs.writeFileSync(dummyLargePath, largeContent);
  });

  afterAll(async () => {
    await app.close();
    // Clean up dummy files
    if (fs.existsSync(dummyPdfPath)) fs.unlinkSync(dummyPdfPath);
    if (fs.existsSync(dummyJpegPath)) fs.unlinkSync(dummyJpegPath);
    if (fs.existsSync(dummyTxtPath)) fs.unlinkSync(dummyTxtPath);
    if (fs.existsSync(dummyLargePath)) fs.unlinkSync(dummyLargePath);
  });

  beforeEach(async () => {
    await clearDatabase();
    vi.clearAllMocks();

    // Create a Member user
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

    // Create Project, Phase, Deliverable for context
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
        status: "NOT_STARTED",
      },
    });
    deliverableId = deliverable.id;
  });

  describe("File Type Validation (using Evidence endpoint)", () => {
    it("should allow uploading a PDF file", async () => {
      const res = await request
        .post("/api/v1/evidence")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("deliverableId", deliverableId)
        .attach("file", dummyPdfPath, { contentType: 'application/pdf' });

      expect(res.status).toBe(201);
    });

    it("should allow uploading a JPEG image file", async () => {
      const res = await request
        .post("/api/v1/evidence")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("deliverableId", deliverableId)
        .attach("file", dummyJpegPath, { contentType: 'image/jpeg' });

      expect(res.status).toBe(201);
    });

    it("should reject uploading an unsupported file type (e.g., .txt)", async () => {
      const res = await request
        .post("/api/v1/evidence")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("deliverableId", deliverableId)
        .attach("file", dummyTxtPath, { contentType: 'text/plain' });

      expect(res.status).toBe(500); 
      expect(res.body.error).toContain("Unsupported file type");
    });
  });

  describe("File Size Validation (using Fastify Multipart)", () => {
    it("should allow uploading a file within the size limit", async () => {
      const res = await request
        .post("/api/v1/evidence")
        .set("Authorization", `Bearer ${memberToken}`)
        .field("deliverableId", deliverableId)
        .attach("file", dummyPdfPath, { contentType: 'application/pdf' });

      expect(res.status).toBe(201);
    });

    it("should reject uploading a file larger than the size limit", async () => {
        const res = await request
          .post("/api/v1/evidence")
          .set("Authorization", `Bearer ${memberToken}`)
          .field("deliverableId", deliverableId)
          .attach("file", dummyLargePath, { contentType: 'application/pdf' });
  
        // Fastify multipart default error for size limit is 413
        expect(res.status).toBe(413); 
        // We accept either code as they both indicate size limit issues depending on fastify version/config
        expect(['FST_FMP_FILE_SIZE_LIMIT', 'FST_REQ_FILE_TOO_LARGE', 'FST_FMP_TOO_MANY_BYTES']).toContain(res.body.code);
      }, 20000); // 20s timeout
  });
});