import { getPrismaClient, NotFoundError, ValidationError } from "../../utils/database.js";
import { CreateCommentInput, UpdateCommentInput, CommentQuery } from "./comment.schema.js";

const prisma = getPrismaClient();

export async function getComments(query: CommentQuery) {
  const { taskId, deliverableId } = query;
  return prisma.comment.findMany({
    where: {
      taskId,
      deliverableId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function getCommentById(id: string) {
  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!comment) {
    throw new NotFoundError("Comment", id);
  }

  return comment;
}

export async function createComment(userId: string, input: CreateCommentInput) {
  if (input.taskId) {
    const task = await prisma.task.findUnique({ where: { id: input.taskId } });
    if (!task) throw new NotFoundError("Task", input.taskId);
  }

  if (input.deliverableId) {
    const deliverable = await prisma.deliverable.findUnique({ where: { id: input.deliverableId } });
    if (!deliverable) throw new NotFoundError("Deliverable", input.deliverableId);
  }

  return prisma.comment.create({
    data: {
      ...input,
      authorId: userId,
    },
  });
}

export async function updateComment(id: string, userId: string, input: UpdateCommentInput) {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new NotFoundError("Comment", id);
  }

  if (comment.authorId !== userId) {
    throw new ValidationError("You can only update your own comments");
  }

  return prisma.comment.update({
    where: { id },
    data: input,
  });
}

export async function deleteComment(id: string, userId: string, userRole: string) {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new NotFoundError("Comment", id);
  }

  // Allow author OR Team Lead to delete
  if (comment.authorId !== userId && userRole !== "TEAM_LEAD") {
    throw new ValidationError("You do not have permission to delete this comment");
  }

  return prisma.comment.delete({
    where: { id },
  });
}
