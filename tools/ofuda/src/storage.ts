import { invoke } from "@tauri-apps/api/core";
import type { TaskStore } from "./types";

const fallbackKey = "ofuda-store";

const emptyStore: TaskStore = {
  version: 1,
  categories: [],
  tasks: [],
};

function isTauriRuntime(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export async function loadTaskStore(): Promise<TaskStore> {
  if (isTauriRuntime()) {
    return invoke<TaskStore>("load_tasks");
  }

  const raw = localStorage.getItem(fallbackKey);
  return raw ? (JSON.parse(raw) as TaskStore) : emptyStore;
}

export async function saveTaskStore(store: TaskStore): Promise<void> {
  if (isTauriRuntime()) {
    await invoke("save_tasks", { store });
    return;
  }

  localStorage.setItem(fallbackKey, JSON.stringify(store, null, 2));
}

export async function revealDataFile(): Promise<void> {
  if (isTauriRuntime()) {
    await invoke("reveal_data_file");
  }
}

export async function getDataFileLocation(): Promise<string> {
  if (isTauriRuntime()) {
    return invoke<string>("data_file_location");
  }

  return "ブラウザプレビュー中: localStorage";
}
