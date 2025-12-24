import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { searchHandler } from "./search.controller.js";
import { searchQuerySchema, searchResponseSchema } from "./search.schema.js";

export async function searchRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  app.register(async (protectedRoutes) => {
    const protectedServer = protectedRoutes.withTypeProvider<ZodTypeProvider>();
    protectedRoutes.addHook("onRequest", app.authenticate);

    protectedServer.get("/", {
      schema: {
        querystring: searchQuerySchema,
        response: {
          200: searchResponseSchema,
        },
      },
    }, searchHandler as any);
  });
}
