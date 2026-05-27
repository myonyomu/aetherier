import { PRIORITY_LABELS, type Category, type Task } from "../types";
import { isOverdue } from "../taskLogic";
import { findCategory } from "./categoryHelpers";

export function TaskMeta({ task, categories }: { task: Task; categories: Category[] }) {
  const category = findCategory(categories, task.categoryId);

  return (
    <div className="task-meta">
      {category ? (
        <span className="category-chip" style={{ backgroundColor: category.color }}>
          {category.name}
        </span>
      ) : (
        <span className="category-chip uncategorized">カテゴリなし</span>
      )}
      <span className={`priority priority-${task.priority}`}>優先度 {PRIORITY_LABELS[task.priority]}</span>
      {task.dueDate ? <span className={isOverdue(task) ? "danger" : ""}>{task.dueDate}</span> : <span>期限なし</span>}
      {task.labels.map((label) => (
        <span key={label} className="label-chip">
          {label}
        </span>
      ))}
    </div>
  );
}
