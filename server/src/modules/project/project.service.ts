import { getPrismaClient, NotFoundError, ValidationError } from "../../utils/database.js";
import { CreateProjectInput, UpdateProjectInput } from "./project.schema.js";
import { createActivityLog } from "../activity-log/activity-log.service.js";

const prisma = getPrismaClient();

export async function getProject() {
  const project = await prisma.project.findFirst();
  if (!project) {
    throw new NotFoundError("Project", "default");
  }
  return project;
}

export async function createProject(input: CreateProjectInput, userId: string) {
  const existingProject = await prisma.project.findFirst();
  if (existingProject) {
    throw new ValidationError("A project already exists. Only one project is allowed.");
  }

  const project = await prisma.project.create({
    data: input,
  });

  await createActivityLog({
    userId,
    action: "PROJECT_CREATED",
    entityType: "Project",
    entityId: project.id,
    details: `Project "${project.name}" created`,
  });

  return project;
}

export async function updateProject(input: UpdateProjectInput, userId: string) {
  const project = await prisma.project.findFirst();
  if (!project) {
    throw new NotFoundError("Project", "default");
  }

  const updatedProject = await prisma.project.update({
    where: { id: project.id },
    data: input,
  });

  await createActivityLog({
    userId,
    action: "PROJECT_UPDATED",
    entityType: "Project",
    entityId: project.id,
    details: `Project "${project.name}" updated`,
  });

  return updatedProject;
}
