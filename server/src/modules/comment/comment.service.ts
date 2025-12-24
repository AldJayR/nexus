import { getPrismaClient, NotFoundError, ValidationError } from "../../utils/database.js";
import { CreateCommentInput, UpdateCommentInput, CommentQuery } from "./comment.schema.js";
import { createNotification } from "../notification/notification.service.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";

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
  let entityType = "";
  let entityId = "";
  let entityTitle = "";
  let recipientId: string | null = null;

  if (input.taskId) {
    const task = await prisma.task.findUnique({ where: { id: input.taskId } });
    if (!task) throw new NotFoundError("Task", input.taskId);
    entityType = "Task";
    entityId = task.id;
    entityTitle = task.title;
    if (task.assigneeId && task.assigneeId !== userId) {
      recipientId = task.assigneeId;
    }
  }

  if (input.deliverableId) {
    const deliverable = await prisma.deliverable.findUnique({ where: { id: input.deliverableId } });
    if (!deliverable) throw new NotFoundError("Deliverable", input.deliverableId);
    entityType = "Deliverable";
    entityId = deliverable.id;
    entityTitle = deliverable.title;
  }

  const comment = await prisma.comment.create({
    data: {
      ...input,
      authorId: userId,
    },
  });

  // Log activity
  if (entityType) {
    await createActivityLog({
      userId,
      action: "COMMENT_ADDED",
      entityType: entityType,
      entityId: entityId,
      details: `Comment added to ${entityType} "${entityTitle}"`,
    });
  }

  // Send notification to assignee
  if (recipientId) {
    await createNotification({
      userId: recipientId,
      message: `New comment on ${entityType} "${entityTitle}"`,
      link: `/${entityType.toLowerCase()}s/${entityId}`,
    });
  }

  // Parse @mentions and send notifications
  const mentionedUserIds = await parseMentions(input.content, userId);
  const author = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  for (const mentionedUserId of mentionedUserIds) {
    // Don't notify if already notified as assignee
    if (mentionedUserId !== recipientId) {
      await createNotification({
        userId: mentionedUserId,
        message: `📣 ${author?.name || 'Someone'} mentioned you in a comment on ${entityType} "${entityTitle}"`,
        link: `/${entityType.toLowerCase()}s/${entityId}`,
      });
    }
  }

  return comment;
}

/**
 * Parse @mentions from comment content and return user IDs
 * Supports @"Full Name" and @username formats
 */
async function parseMentions(content: string, authorId: string): Promise<string[]> {
  // Match @"Full Name" or @SingleName patterns
  const mentionPattern = /@"([^"]+)"|@(\w+)/g;
  const matches = content.matchAll(mentionPattern);
  const names: string[] = [];

  for (const match of matches) {
    // match[1] is the quoted name, match[2] is the unquoted name
    const name = match[1] || match[2];
    if (name) {
      names.push(name);
    }
  }

  if (names.length === 0) {
    return [];
  }

  // Find users by name (case-insensitive)
  const users = await prisma.user.findMany({
    where: {
      OR: names.map(name => ({
        name: { equals: name, mode: 'insensitive' as const },
      })),
      deletedAt: null,
    },
    select: { id: true },
  });

  // Filter out the author
  return users.map(u => u.id).filter(id => id !== authorId);
}

export async function updateComment(id: string, userId: string, input: UpdateCommentInput) {
  const comment = await prisma.comment.findUnique({
    where: { id },
  });

  if (!comment) {
    throw new NotFoundError("Comment", id);
  }

  if (comment.authorId !== userId) {
    // Use AuthorizationError for forbidden action (403)
    const { AuthorizationError } = await import("../../utils/database.js");
    throw new AuthorizationError("You can only update your own comments");
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
