import { useState, type PointerEvent } from "react";
import { STATUS_LABELS, STATUS_ORDER, type Category, type Task, type TaskStatus } from "../types";
import { categoryStyle, findCategory } from "./categoryHelpers";
import { TaskMeta } from "./TaskMeta";

export function BoardView({
  tasks,
  categories,
  onMove,
  onEdit,
}: {
  tasks: Task[];
  categories: Category[];
  onMove: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}) {
  const [dragState, setDragState] = useState<{
    taskId: string;
    startX: number;
    startY: number;
    dragging: boolean;
    overStatus: TaskStatus | null;
  } | null>(null);

  function getStatusAtPoint(x: number, y: number): TaskStatus | null {
    const target = document.elementFromPoint(x, y);
    const column = target?.closest<HTMLElement>("[data-board-status]");
    const status = column?.dataset.boardStatus;
    return STATUS_ORDER.includes(status as TaskStatus) ? (status as TaskStatus) : null;
  }

  function startPointerDrag(event: PointerEvent<HTMLElement>, taskId: string) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      taskId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      overStatus: null,
    });
  }

  function updatePointerDrag(event: PointerEvent<HTMLElement>) {
    setDragState((current) => {
      if (!current) return current;

      const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY);
      const dragging = current.dragging || distance > 6;
      return {
        ...current,
        dragging,
        overStatus: dragging ? getStatusAtPoint(event.clientX, event.clientY) : null,
      };
    });
  }

  function finishPointerDrag(event: PointerEvent<HTMLElement>, task: Task) {
    const current = dragState;
    const distance = current ? Math.hypot(event.clientX - current.startX, event.clientY - current.startY) : 0;
    const wasDragging = Boolean(current?.dragging || distance > 6);
    const finalStatus = wasDragging ? getStatusAtPoint(event.clientX, event.clientY) : null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDragState(null);
    if (!wasDragging) {
      onEdit(task);
      return;
    }

    if (finalStatus && finalStatus !== task.status) {
      onMove(task.id, finalStatus);
    }
  }

  return (
    <div className="board">
      {STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <section
            key={status}
            data-board-status={status}
            className={`board-column ${dragState?.dragging ? "drop-ready" : ""} ${
              dragState?.overStatus === status ? "drop-target" : ""
            }`}
          >
            <h2>
              {STATUS_LABELS[status]} <span>{columnTasks.length}</span>
            </h2>
            {columnTasks.map((task) => {
              const category = findCategory(categories, task.categoryId);
              return (
                <article
                  key={task.id}
                  className={`task-card ${dragState?.taskId === task.id && dragState.dragging ? "dragging" : ""}`}
                  style={categoryStyle(category)}
                  onPointerDown={(event) => startPointerDrag(event, task.id)}
                  onPointerMove={updatePointerDrag}
                  onPointerUp={(event) => finishPointerDrag(event, task)}
                  onPointerCancel={() => setDragState(null)}
                >
                  <h3>{task.title}</h3>
                  {task.memo ? <p>{task.memo}</p> : null}
                  <TaskMeta task={task} categories={categories} />
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
