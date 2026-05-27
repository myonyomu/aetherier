import type { Category } from "../types";

export function CategorySettings({
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: {
  categories: Category[];
  onAdd: () => void;
  onUpdate: (categoryId: string, patch: Partial<Pick<Category, "name" | "color">>) => void;
  onDelete: (categoryId: string) => void;
}) {
  return (
    <section className="category-settings">
      <div className="settings-heading">
        <h2>カテゴリ設定</h2>
        <button type="button" className="ghost-button" onClick={onAdd}>
          追加
        </button>
      </div>
      {categories.length === 0 ? <p>カテゴリはまだありません。</p> : null}
      {categories.map((category) => (
        <div key={category.id} className="category-editor">
          <input
            type="color"
            value={category.color}
            aria-label={`${category.name} の色`}
            onChange={(event) => onUpdate(category.id, { color: event.target.value })}
          />
          <input value={category.name} onChange={(event) => onUpdate(category.id, { name: event.target.value })} />
          <button type="button" className="danger-button" onClick={() => onDelete(category.id)}>
            削除
          </button>
        </div>
      ))}
    </section>
  );
}
