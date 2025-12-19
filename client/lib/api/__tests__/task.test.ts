import { describe, expect, it } from "vitest";
import { TaskStatus } from "@/lib/types";
import { taskApi } from "../task";

describe("Task API", () => {
  it("should list tasks", async () => {
    const tasks = await taskApi.listTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Task 1");
  });

  it("should get task by id", async () => {
    const task = await taskApi.getTaskById("task-1");
    expect(task.id).toBe("task-1");
    expect(task.status).toBe("TODO");
  });

  it("should create task", async () => {
    const newTask = await taskApi.createTask({
      sprintId: "sprint-1",
      title: "New Task",
    });
    expect(newTask.id).toBe("task-new");
    expect(newTask.title).toBe("New Task");
  });

  it("should update task", async () => {
    const updatedTask = await taskApi.updateTask("task-1", {
      title: "Updated Task",
    });
    expect(updatedTask.id).toBe("task-1");
  });

  it("should update task status", async () => {
    const updatedTask = await taskApi.updateTaskStatus("task-1", {
      status: TaskStatus.IN_PROGRESS,
    });
    expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it("should delete task", async () => {
    await expect(taskApi.deleteTask("task-1")).resolves.not.toThrow();
  });

  it("should restore task", async () => {
    const restored = await taskApi.restoreTask("task-1");
    expect(restored.deletedAt).toBeNull();
  });
});
