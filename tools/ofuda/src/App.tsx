import { useEffect, useMemo, useState } from "react";
import { BoardView } from "./components/BoardView";
import { CategoryView } from "./components/CategoryView";
import { DueView } from "./components/DueView";
import { TableView } from "./components/TableView";
import { TaskForm } from "./components/TaskForm";
import { Toolbar } from "./components/Toolbar";
import { getDataFileLocation, loadTaskStore, revealDataFile, saveTaskStore } from "./storage";
import { filterTasks, isOverdue } from "./taskLogic";
import {
  DEFAULT_CATEGORY_COLORS,
  type Category,
  type Filters,
  type Task,
  type TaskDraft,
  type TaskStatus,
  type ViewMode,
} from "./types";

const initialFilters: Filters = {
  query: "",
  status: "all",
  priority: "all",
  categoryId: "all",
  due: "all",
};

const blankDraft: TaskDraft = {
  title: "",
  status: "todo",
  priority: "medium",
  categoryId: "",
  dueDate: "",
  labels: "",
  memo: "",
};

function newId(): string {
  return `task-${crypto.randomUUID()}`;
}

function toDraft(task: Task): TaskDraft {
  return {
    title: task.title,
    status: task.status,
    priority: task.priority,
    categoryId: task.categoryId ?? "",
    dueDate: task.dueDate ?? "",
    labels: task.labels.join(", "),
    memo: task.memo,
  };
}

function draftToTask(draft: TaskDraft, existing?: Task): Task {
  const now = new Date().toISOString();
  const statusChangedToDone = draft.status === "done" && existing?.status !== "done";
  const statusChangedFromDone = draft.status !== "done" && existing?.status === "done";

  return {
    id: existing?.id ?? newId(),
    title: draft.title.trim(),
    status: draft.status,
    priority: draft.priority,
    categoryId: draft.categoryId || null,
    dueDate: draft.dueDate || null,
    labels: draft.labels
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean),
    memo: draft.memo.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    completedAt: statusChangedToDone ? now : statusChangedFromDone ? null : existing?.completedAt ?? null,
  };
}

function makeCategoryName(categories: Category[]): string {
  return `カテゴリ ${categories.length + 1}`;
}

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [view, setView] = useState<ViewMode>("table");
  const [draft, setDraft] = useState<TaskDraft>(blankDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataLocation, setDataLocation] = useState("");
  const [statusMessage, setStatusMessage] = useState("起動中");

  useEffect(() => {
    void loadTaskStore()
      .then((store) => {
        setCategories(store.categories);
        setTasks(store.tasks);
        setStatusMessage("保存済み");
      })
      .catch((error) => setStatusMessage(`読み込み失敗: ${String(error)}`));

    void getDataFileLocation().then(setDataLocation).catch(() => setDataLocation(""));
  }, []);

  useEffect(() => {
    if (statusMessage === "起動中") return;

    const handle = window.setTimeout(() => {
      void saveTaskStore({ version: 1, categories, tasks })
        .then(() => setStatusMessage("保存済み"))
        .catch((error) => setStatusMessage(`保存失敗: ${String(error)}`));
    }, 250);

    setStatusMessage("保存中");
    return () => window.clearTimeout(handle);
  }, [categories, tasks]);

  const visibleTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const overdueCount = useMemo(() => tasks.filter((task) => isOverdue(task)).length, [tasks]);
  const activeCount = tasks.filter((task) => task.status !== "done").length;
  const editingTask = editingId ? tasks.find((task) => task.id === editingId) : undefined;

  function submitTask() {
    if (!draft.title.trim()) return;

    const nextTask = draftToTask(draft, editingTask);
    setTasks((current) =>
      editingTask ? current.map((task) => (task.id === editingTask.id ? nextTask : task)) : [nextTask, ...current],
    );
    setDraft(blankDraft);
    setEditingId(null);
  }

  function editTask(task: Task) {
    setEditingId(task.id);
    setDraft(toDraft(task));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(blankDraft);
  }

  function deleteTask(taskId: string) {
    const target = tasks.find((task) => task.id === taskId);
    if (!target || !confirm(`「${target.title}」を削除しますか？`)) return;
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  function updateTaskStatus(taskId: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? draftToTask({ ...toDraft(task), status }, task) : task)),
    );
  }

  function addCategory() {
    setCategories((current) => [
      ...current,
      {
        id: newId(),
        name: makeCategoryName(current),
        color: DEFAULT_CATEGORY_COLORS[current.length % DEFAULT_CATEGORY_COLORS.length],
      },
    ]);
  }

  function updateCategory(categoryId: string, patch: Partial<Pick<Category, "name" | "color">>) {
    setCategories((current) =>
      current.map((category) => (category.id === categoryId ? { ...category, ...patch } : category)),
    );
  }

  function deleteCategory(categoryId: string) {
    const category = categories.find((item) => item.id === categoryId);
    if (!category || !confirm(`カテゴリ「${category.name}」を削除しますか？`)) return;
    setCategories((current) => current.filter((item) => item.id !== categoryId));
    setTasks((current) => current.map((task) => (task.categoryId === categoryId ? { ...task, categoryId: null } : task)));
    setFilters((current) => (current.categoryId === categoryId ? { ...current, categoryId: "all" } : current));
    setDraft((current) => (current.categoryId === categoryId ? { ...current, categoryId: "" } : current));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Ofuda</h1>
          <p>{dataLocation || "ofuda.json を確認中"}</p>
        </div>
        <div className="summary">
          <span>{tasks.length} 件</span>
          <span>{activeCount} 件未完了</span>
          <span className={overdueCount > 0 ? "danger" : ""}>{overdueCount} 件期限切れ</span>
          <button type="button" className="ghost-button" onClick={() => void revealDataFile()}>
            JSONを開く
          </button>
        </div>
      </header>

      <Toolbar
        filters={filters}
        categories={categories}
        view={view}
        onFiltersChange={setFilters}
        onViewChange={setView}
      />

      <main className="workspace">
        <TaskForm
          draft={draft}
          isEditing={Boolean(editingTask)}
          statusMessage={statusMessage}
          categories={categories}
          onDraftChange={setDraft}
          onSubmit={submitTask}
          onCancel={cancelEdit}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
        />

        <section className="content-panel">
          {view === "table" ? (
            <TableView
              tasks={visibleTasks}
              categories={categories}
              onEdit={editTask}
              onDelete={deleteTask}
              onStatus={updateTaskStatus}
            />
          ) : null}
          {view === "board" ? (
            <BoardView tasks={visibleTasks} categories={categories} onMove={updateTaskStatus} onEdit={editTask} />
          ) : null}
          {view === "due" ? <DueView tasks={visibleTasks} categories={categories} onEdit={editTask} /> : null}
          {view === "category" ? <CategoryView tasks={visibleTasks} categories={categories} onEdit={editTask} /> : null}
        </section>
      </main>
    </div>
  );
}
