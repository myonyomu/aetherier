import { PRIORITY_LABELS, STATUS_LABELS, STATUS_ORDER, type Category, type Task, type TaskStatus } from "../types";
import { isOverdue } from "../taskLogic";
import { categoryStyle, findCategory } from "./categoryHelpers";
import { EmptyState } from "./EmptyState";

export function TableView({
  tasks,
  categories,
  onEdit,
  onDelete,
  onStatus,
}: {
  tasks: Task[];
  categories: Category[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatus: (taskId: string, status: TaskStatus) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>タイトル</th>
            <th>状態</th>
            <th>優先度</th>
            <th>カテゴリ</th>
            <th>期限</th>
            <th>ラベル</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const category = findCategory(categories, task.categoryId);
            return (
              <tr key={task.id} style={categoryStyle(category)}>
                <td>
                  <button type="button" className="link-button" onClick={() => onEdit(task)}>
                    {task.title}
                  </button>
                  {task.memo ? <p>{task.memo}</p> : null}
                </td>
                <td>
                  <select value={task.status} onChange={(event) => onStatus(task.id, event.target.value as TaskStatus)}>
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{PRIORITY_LABELS[task.priority]}</td>
                <td>
                  {category ? (
                    <span className="category-chip" style={{ backgroundColor: category.color }}>
                      {category.name}
                    </span>
                  ) : (
                    "なし"
                  )}
                </td>
                <td className={isOverdue(task) ? "danger" : ""}>{task.dueDate ?? "なし"}</td>
                <td>{task.labels.join(", ") || "なし"}</td>
                <td>
                  <button type="button" className="ghost-button" onClick={() => onEdit(task)}>
                    編集
                  </button>
                  <button type="button" className="danger-button" onClick={() => onDelete(task.id)}>
                    削除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tasks.length === 0 ? <EmptyState /> : null}
    </div>
  );
}
