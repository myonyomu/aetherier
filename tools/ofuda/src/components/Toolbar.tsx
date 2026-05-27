import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Category,
  type Filters,
  type ViewMode,
} from "../types";

export function Toolbar({
  filters,
  categories,
  view,
  onFiltersChange,
  onViewChange,
}: {
  filters: Filters;
  categories: Category[];
  view: ViewMode;
  onFiltersChange: (filters: Filters) => void;
  onViewChange: (view: ViewMode) => void;
}) {
  return (
    <section className="toolbar">
      <input
        value={filters.query}
        onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
        placeholder="検索"
      />
      <select
        value={filters.status}
        onChange={(event) => onFiltersChange({ ...filters, status: event.target.value as Filters["status"] })}
      >
        <option value="all">全ステータス</option>
        {STATUS_ORDER.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={(event) => onFiltersChange({ ...filters, priority: event.target.value as Filters["priority"] })}
      >
        <option value="all">全優先度</option>
        {PRIORITY_ORDER.map((priority) => (
          <option key={priority} value={priority}>
            優先度 {PRIORITY_LABELS[priority]}
          </option>
        ))}
      </select>
      <select
        value={filters.categoryId}
        onChange={(event) => onFiltersChange({ ...filters, categoryId: event.target.value as Filters["categoryId"] })}
      >
        <option value="all">全カテゴリ</option>
        <option value="none">カテゴリなし</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <select value={filters.due} onChange={(event) => onFiltersChange({ ...filters, due: event.target.value as Filters["due"] })}>
        <option value="all">全期限</option>
        <option value="overdue">期限切れ</option>
        <option value="today">今日</option>
        <option value="week">7日以内</option>
        <option value="none">期限なし</option>
      </select>
      <div className="segmented" aria-label="表示切替">
        <button className={view === "table" ? "active" : ""} onClick={() => onViewChange("table")} type="button">
          表
        </button>
        <button className={view === "board" ? "active" : ""} onClick={() => onViewChange("board")} type="button">
          かんばん
        </button>
        <button className={view === "due" ? "active" : ""} onClick={() => onViewChange("due")} type="button">
          期限
        </button>
        <button className={view === "category" ? "active" : ""} onClick={() => onViewChange("category")} type="button">
          カテゴリ
        </button>
      </div>
    </section>
  );
}
