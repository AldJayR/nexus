import type { Comment } from "@/lib/types";
import { createApiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type CreateCommentInput = {
  content: string;
  taskId?: string;
  deliverableId?: string;
};

export type UpdateCommentInput = {
  content: string;
};

export type CommentQuery = {
  taskId?: string;
  deliverableId?: string;
};

export const commentApi = {
  listComments: async (query?: CommentQuery): Promise<Comment[]> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.COMMENTS.LIST, {
      params: query,
    });
    return response.data;
  },

  getCommentById: async (id: string): Promise<Comment> => {
    const client = await createApiClient();
    const response = await client.get(API_ENDPOINTS.COMMENTS.GET(id));
    return response.data;
  },

  createComment: async (data: CreateCommentInput): Promise<Comment> => {
    const client = await createApiClient();
    const response = await client.post(API_ENDPOINTS.COMMENTS.CREATE, data);
    return response.data;
  },

  updateComment: async (
    id: string,
    data: UpdateCommentInput
  ): Promise<Comment> => {
    const client = await createApiClient();
    const response = await client.put(API_ENDPOINTS.COMMENTS.UPDATE(id), data);
    return response.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    const client = await createApiClient();
    await client.delete(API_ENDPOINTS.COMMENTS.DELETE(id));
  },
};
