import type { CSSProperties } from "react";
import type { Category, Task } from "../types";
import { categoryStyle, findCategory } from "./categoryHelpers";
import { TaskMeta } from "./TaskMeta";

export function CategoryView({
  tasks,
  categories,
  onEdit,
}: {
  tasks: Task[];
  categories: Category[];
  onEdit: (task: Task) => void;
}) {
  const groups = [
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      tasks: tasks.filter((task) => task.categoryId === category.id),
    })),
    {
      id: "none",
      name: "カテゴリなし",
      color: "#8a918c",
      tasks: tasks.filter((task) => !task.categoryId),
    },
  ];

  return (
    <div className="category-groups">
      {groups.map((group) => (
        <section key={group.id} className="category-group" style={{ "--category-color": group.color } as CSSProperties}>
          <h2>
            <span>{group.name}</span>
            <strong>{group.tasks.length}</strong>
          </h2>
          {group.tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              className="category-row"
              style={categoryStyle(findCategory(categories, task.categoryId))}
              onClick={() => onEdit(task)}
            >
              <strong>{task.title}</strong>
              <TaskMeta task={task} categories={categories} />
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}
