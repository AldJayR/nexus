import { describe, expect, it } from "vitest";
import { projectApi } from "../project";

describe("Project API", () => {
  it("should get project details", async () => {
    const project = await projectApi.getProject();
    expect(project.id).toBe("project-1");
    expect(project.name).toBe("Test Project");
  });

  it("should create a project", async () => {
    const newProject = await projectApi.createProject({
      name: "New Project",
      startDate: "2025-01-01",
    });
    expect(newProject.id).toBe("project-1");
    expect(newProject.name).toBe("New Project");
  });

  it("should update a project", async () => {
    const updatedProject = await projectApi.updateProject({
      name: "Updated Project",
    });
    expect(updatedProject.name).toBe("Updated Project");
  });

  it("should patch a project", async () => {
    const patchedProject = await projectApi.patchProject({
      description: "Patched Description",
    });
    expect(patchedProject.description).toBe("Patched Description");
  });
});
