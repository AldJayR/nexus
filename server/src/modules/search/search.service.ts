import { getPrismaClient } from "../../utils/database.js";

const prisma = getPrismaClient();

export async function searchGlobal(query: string) {
  // Normalize search term
  const searchTerm = query.trim();

  // Run searches in parallel for better performance
  const [tasks, deliverables, comments, meetingLogs] = await Promise.all([
    // 1. Search Tasks (title or description)
    prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        sprintId: true,
        createdAt: true,
      },
      take: 10,
    }),

    // 2. Search Deliverables (title or description)
    prisma.deliverable.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        phaseId: true,
        createdAt: true,
      },
      take: 10,
    }),

    // 3. Search Comments (content)
    prisma.comment.findMany({
      where: {
        content: { contains: searchTerm, mode: "insensitive" },
      },
      select: {
        id: true,
        content: true,
        author: {
          select: { name: true },
        },
        taskId: true,
        deliverableId: true,
        createdAt: true,
      },
      take: 10,
    }),

    // 4. Search Meeting Logs (title)
    prisma.meetingLog.findMany({
      where: {
        title: { contains: searchTerm, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        date: true,
        fileUrl: true,
      },
      take: 10,
    }),
  ]);

  return {
    tasks,
    deliverables,
    comments: comments.map(c => ({
        ...c,
        authorName: c.author.name
    })),
    meetingLogs,
  };
}
