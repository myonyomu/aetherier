import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Category,
  type TaskDraft,
  type TaskPriority,
  type TaskStatus,
} from "../types";
import { CategorySettings } from "./CategorySettings";

export function TaskForm({
  draft,
  isEditing,
  statusMessage,
  categories,
  onDraftChange,
  onSubmit,
  onCancel,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: {
  draft: TaskDraft;
  isEditing: boolean;
  statusMessage: string;
  categories: Category[];
  onDraftChange: (draft: TaskDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onAddCategory: () => void;
  onUpdateCategory: (categoryId: string, patch: Partial<Pick<Category, "name" | "color">>) => void;
  onDeleteCategory: (categoryId: string) => void;
}) {
  return (
    <aside className="task-form">
      <h2>{isEditing ? "タスク編集" : "タスク追加"}</h2>
      <label>
        タイトル
        <input value={draft.title} onChange={(event) => onDraftChange({ ...draft, title: event.target.value })} />
      </label>
      <label>
        ステータス
        <select
          value={draft.status}
          onChange={(event) => onDraftChange({ ...draft, status: event.target.value as TaskStatus })}
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label>
        優先度
        <select
          value={draft.priority}
          onChange={(event) => onDraftChange({ ...draft, priority: event.target.value as TaskPriority })}
        >
          {PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </label>
      <label>
        カテゴリ
        <select value={draft.categoryId} onChange={(event) => onDraftChange({ ...draft, categoryId: event.target.value })}>
          <option value="">なし</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        期限
        <input type="date" value={draft.dueDate} onChange={(event) => onDraftChange({ ...draft, dueDate: event.target.value })} />
      </label>
      <label>
        ラベル
        <input
          value={draft.labels}
          onChange={(event) => onDraftChange({ ...draft, labels: event.target.value })}
          placeholder="設計, 私用"
        />
      </label>
      <label>
        メモ
        <textarea value={draft.memo} onChange={(event) => onDraftChange({ ...draft, memo: event.target.value })} />
      </label>
      <div className="form-actions">
        <button type="button" onClick={onSubmit} disabled={!draft.title.trim()}>
          {isEditing ? "更新" : "追加"}
        </button>
        {isEditing ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            取消
          </button>
        ) : null}
      </div>
      <p className="save-state">{statusMessage}</p>
      <CategorySettings
        categories={categories}
        onAdd={onAddCategory}
        onUpdate={onUpdateCategory}
        onDelete={onDeleteCategory}
      />
    </aside>
  );
}
