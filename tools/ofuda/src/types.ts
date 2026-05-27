export type TaskStatus = "todo" | "doing" | "blocked" | "done";
export type TaskPriority = "high" | "medium" | "low";
export type ViewMode = "table" | "board" | "due" | "category";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId: string | null;
  dueDate: string | null;
  labels: string[];
  memo: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type TaskDraft = {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId: string;
  dueDate: string;
  labels: string;
  memo: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type TaskStore = {
  version: 1;
  categories: Category[];
  tasks: Task[];
};

export type Filters = {
  query: string;
  status: "all" | TaskStatus;
  priority: "all" | TaskPriority;
  categoryId: "all" | "none" | string;
  due: "all" | "overdue" | "today" | "week" | "none";
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "未着手",
  doing: "進行中",
  blocked: "保留",
  done: "完了",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "doing", "blocked", "done"];
export const PRIORITY_ORDER: TaskPriority[] = ["high", "medium", "low"];

export const DEFAULT_CATEGORY_COLORS = [
  "#28705f",
  "#7b4e9f",
  "#b05d2b",
  "#2f68a2",
  "#8b5e3c",
  "#a0443e",
  "#4d7c3f",
  "#6f6578",
];
