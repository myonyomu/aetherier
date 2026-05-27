import { describe, expect, it } from "vitest";
import { filterTasks, isOverdue, sortByDueDate } from "./taskLogic";
import type { Filters, Task } from "./types";

const baseTask: Task = {
  id: "task-1",
  title: "仕様を書く",
  status: "todo",
  priority: "medium",
  categoryId: "category-1",
  dueDate: "2026-05-28",
  labels: ["設計"],
  memo: "表ビューを中心にする",
  createdAt: "2026-05-27T00:00:00.000Z",
  updatedAt: "2026-05-27T00:00:00.000Z",
  completedAt: null,
};

const baseFilters: Filters = {
  query: "",
  status: "all",
  priority: "all",
  categoryId: "all",
  due: "all",
};

describe("taskLogic", () => {
  it("searches title, memo and labels", () => {
    expect(filterTasks([baseTask], { ...baseFilters, query: "設計" })).toHaveLength(1);
    expect(filterTasks([baseTask], { ...baseFilters, query: "存在しない" })).toHaveLength(0);
  });

  it("filters by category", () => {
    expect(filterTasks([baseTask], { ...baseFilters, categoryId: "category-1" })).toHaveLength(1);
    expect(filterTasks([baseTask], { ...baseFilters, categoryId: "none" })).toHaveLength(0);
  });

  it("does not mark completed tasks as overdue", () => {
    const doneTask = { ...baseTask, status: "done" as const, dueDate: "2026-05-20" };
    expect(isOverdue(doneTask, new Date("2026-05-27T00:00:00"))).toBe(false);
  });

  it("sorts dated tasks before undated tasks", () => {
    const undated = { ...baseTask, id: "task-2", dueDate: null };
    expect(sortByDueDate([undated, baseTask])[0]?.id).toBe("task-1");
  });
});
