import { sortByDueDate, isOverdue, todayKey } from "../taskLogic";
import type { Category, Task } from "../types";
import { categoryStyle, findCategory } from "./categoryHelpers";
import { TaskMeta } from "./TaskMeta";

export function DueView({ tasks, categories, onEdit }: { tasks: Task[]; categories: Category[]; onEdit: (task: Task) => void }) {
  const groups = [
    ["期限切れ", sortByDueDate(tasks.filter((task) => isOverdue(task)))],
    ["今日", sortByDueDate(tasks.filter((task) => task.dueDate === todayKey()))],
    ["今後", sortByDueDate(tasks.filter((task) => task.dueDate && task.dueDate > todayKey()))],
    ["期限なし", tasks.filter((task) => !task.dueDate)],
  ] as const;

  return (
    <div className="due-groups">
      {groups.map(([title, groupTasks]) => (
        <section key={title} className="due-group">
          <h2>
            {title} <span>{groupTasks.length}</span>
          </h2>
          {groupTasks.map((task) => {
            const category = findCategory(categories, task.categoryId);
            return (
              <button
                type="button"
                key={task.id}
                className="due-row"
                style={categoryStyle(category)}
                onClick={() => onEdit(task)}
              >
                <strong>{task.title}</strong>
                <TaskMeta task={task} categories={categories} />
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}
