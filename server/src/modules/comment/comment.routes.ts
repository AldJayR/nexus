import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  getCommentsHandler,
  getCommentByIdHandler,
  createCommentHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "./comment.controller.js";
import {
  createCommentSchema,
  updateCommentSchema,
  commentResponseSchema,
  commentQuerySchema,
} from "./comment.schema.js";
import { z } from "zod";

export async function commentRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    // List comments
    protectedServer.get("/", {
      schema: {
        querystring: commentQuerySchema,
        response: {
          200: z.array(commentResponseSchema),
        },
      },
    }, getCommentsHandler);

    // Get comment by ID
    protectedServer.get("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: commentResponseSchema, // TODO: Add author info to schema if needed
        },
      },
    }, getCommentByIdHandler);

    // Create comment
    protectedServer.post("/", {
      schema: {
        body: createCommentSchema,
        response: {
          201: commentResponseSchema,
        },
      },
    }, createCommentHandler);

    // Update comment
    protectedServer.put("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        body: updateCommentSchema,
        response: {
          200: commentResponseSchema,
        },
      },
    }, updateCommentHandler);

    // Delete comment
    protectedServer.delete("/:id", {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          204: z.null(),
        },
      },
    }, deleteCommentHandler);
  });
}
