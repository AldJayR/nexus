import { getPrismaClient, NotFoundError, ValidationError } from "../../utils/database.js";
import { CreateProjectInput, UpdateProjectInput } from "./project.schema.js";

const prisma = getPrismaClient();

export async function getProject() {
  const project = await prisma.project.findFirst();
  if (!project) {
    throw new NotFoundError("Project");
  }
  return project;
}

export async function createProject(input: CreateProjectInput) {
  const existingProject = await prisma.project.findFirst();
  if (existingProject) {
    throw new ValidationError("A project already exists. Only one project is allowed.");
  }

  return prisma.project.create({
    data: input,
  });
}

export async function updateProject(input: UpdateProjectInput) {
  const project = await prisma.project.findFirst();
  if (!project) {
    throw new NotFoundError("Project");
  }

  return prisma.project.update({
    where: { id: project.id },
    data: input,
  });
}
