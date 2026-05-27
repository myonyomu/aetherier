use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct TaskStore {
    version: u32,
    categories: Vec<Category>,
    tasks: Vec<Task>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Task {
    id: String,
    title: String,
    status: String,
    priority: String,
    category_id: Option<String>,
    due_date: Option<String>,
    labels: Vec<String>,
    memo: String,
    created_at: String,
    updated_at: String,
    completed_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Category {
    id: String,
    name: String,
    color: String,
}

impl Default for TaskStore {
    fn default() -> Self {
        Self {
            version: 1,
            categories: Vec::new(),
            tasks: Vec::new(),
        }
    }
}

fn data_file_path() -> Result<PathBuf, String> {
    let exe = std::env::current_exe().map_err(|error| error.to_string())?;
    let dir = exe
        .parent()
        .ok_or_else(|| "実行ファイルのフォルダを特定できませんでした".to_string())?;
    Ok(dir.join("ofuda.json"))
}

fn backup_file_path() -> Result<PathBuf, String> {
    let exe = std::env::current_exe().map_err(|error| error.to_string())?;
    let dir = exe
        .parent()
        .ok_or_else(|| "実行ファイルのフォルダを特定できませんでした".to_string())?;
    Ok(dir.join("ofuda.backup.json"))
}

fn corrupt_file_path() -> Result<PathBuf, String> {
    let exe = std::env::current_exe().map_err(|error| error.to_string())?;
    let dir = exe
        .parent()
        .ok_or_else(|| "実行ファイルのフォルダを特定できませんでした".to_string())?;
    let stamp = Utc::now().format("%Y%m%d-%H%M%S");
    Ok(dir.join(format!("ofuda.corrupt-{stamp}.json")))
}

#[tauri::command]
fn load_tasks() -> Result<TaskStore, String> {
    let path = data_file_path()?;
    if !path.exists() {
        let store = TaskStore::default();
        save_tasks(store)?;
        return Ok(TaskStore::default());
    }

    let content = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    match serde_json::from_str::<TaskStore>(&content) {
        Ok(store) => Ok(store),
        Err(error) => {
            let corrupt_path = corrupt_file_path()?;
            fs::rename(&path, &corrupt_path).map_err(|rename_error| {
                format!(
                    "JSONの読み込みに失敗し、破損ファイルの退避にも失敗しました: {error}; {rename_error}"
                )
            })?;
            let store = TaskStore::default();
            save_tasks(store)?;
            Ok(TaskStore::default())
        }
    }
}

#[tauri::command]
fn save_tasks(store: TaskStore) -> Result<(), String> {
    let path = data_file_path()?;
    let backup_path = backup_file_path()?;
    let tmp_path = path.with_extension("tmp.json");
    let content = serde_json::to_string_pretty(&store).map_err(|error| error.to_string())?;

    fs::write(&tmp_path, content).map_err(|error| error.to_string())?;

    if path.exists() {
        fs::copy(&path, &backup_path).map_err(|error| error.to_string())?;
        fs::remove_file(&path).map_err(|error| error.to_string())?;
    }

    fs::rename(&tmp_path, &path).map_err(|error| error.to_string())
}

#[tauri::command]
fn reveal_data_file() -> Result<(), String> {
    let path = data_file_path()?;
    if !path.exists() {
        save_tasks(TaskStore::default())?;
    }

    Command::new("explorer")
        .arg(format!("/select,{}", path.display()))
        .spawn()
        .map_err(|error| error.to_string())?;

    Ok(())
}

#[tauri::command]
fn data_file_location() -> Result<String, String> {
    Ok(data_file_path()?.display().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_tasks,
            save_tasks,
            reveal_data_file,
            data_file_location
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
