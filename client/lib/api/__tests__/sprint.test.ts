import { describe, expect, it } from "vitest";
import { sprintApi } from "../sprint";

describe("Sprint API", () => {
  it("should list all sprints", async () => {
    const sprints = await sprintApi.listSprints();

    expect(sprints).toHaveLength(1);
    expect(sprints[0].id).toBe("sprint-1");
    expect(sprints[0].number).toBe(1);
  });

  it("should create a new sprint", async () => {
    const newSprint = await sprintApi.createSprint({
      goal: "Sprint 2 Goal",
      startDate: "2025-01-16",
      endDate: "2025-01-30",
    });

    expect(newSprint.id).toBe("sprint-new");
    expect(newSprint.goal).toBe("Sprint 2 Goal");
  });
});
