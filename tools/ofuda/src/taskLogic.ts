import type { Filters, Task } from "./types";

const dayMs = 24 * 60 * 60 * 1000;

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isOverdue(task: Task, date = new Date()): boolean {
  return Boolean(task.dueDate && task.status !== "done" && task.dueDate < todayKey(date));
}

export function isDueToday(task: Task, date = new Date()): boolean {
  return task.dueDate === todayKey(date);
}

export function isDueThisWeek(task: Task, date = new Date()): boolean {
  if (!task.dueDate) return false;
  const today = new Date(todayKey(date));
  const due = new Date(task.dueDate);
  const diff = due.getTime() - today.getTime();
  return diff >= 0 && diff <= 6 * dayMs;
}

export function filterTasks(tasks: Task[], filters: Filters): Task[] {
  const query = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.status !== "all" && task.status !== filters.status) return false;
    if (filters.priority !== "all" && task.priority !== filters.priority) return false;
    if (filters.categoryId === "none" && task.categoryId) return false;
    if (filters.categoryId !== "all" && filters.categoryId !== "none" && task.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.due === "overdue" && !isOverdue(task)) return false;
    if (filters.due === "today" && !isDueToday(task)) return false;
    if (filters.due === "week" && !isDueThisWeek(task)) return false;
    if (filters.due === "none" && task.dueDate) return false;

    if (!query) return true;

    const target = [
      task.title,
      task.memo,
      task.status,
      task.priority,
      task.categoryId ?? "",
      task.dueDate ?? "",
      ...task.labels,
    ]
      .join(" ")
      .toLowerCase();

    return target.includes(query);
  });
}

export function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return a.createdAt.localeCompare(b.createdAt);
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate) || a.createdAt.localeCompare(b.createdAt);
  });
}
