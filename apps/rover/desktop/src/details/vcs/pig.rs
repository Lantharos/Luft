use std::ffi::OsString;
use std::fmt::Write;
use std::path::Path;

use serde_json::Value;

use super::command::{args, run_json, run_text};
use super::{Statuses, VcsFileStatus, relative_path};

pub(super) fn statuses(root: &Path) -> Result<Statuses, String> {
    let json = run_json("pig", root, args(&["--json", "status"]))?;
    let mut statuses = Statuses::new();
    collect_statuses(&json, None, &mut statuses);
    Ok(statuses)
}

pub(super) fn workspace(root: &Path) -> Option<String> {
    run_json("pig", root, args(&["--json", "work", "status"]))
        .ok()?
        .get("current")
        .and_then(Value::as_str)
        .map(str::to_string)
}

pub(super) fn diff(root: &Path, file_path: Option<String>) -> Result<String, String> {
    let json = run_json("pig", root, args(&["--json", "diff", "--all"]))?;
    let file = file_path.as_deref().map(|path| relative_path(root, path));
    let mut output = String::new();
    collect_diff(&json, file.as_deref(), None, &mut output);
    Ok(output)
}

pub(super) fn save(root: &Path, message: &str, files: &[String]) -> Result<(), String> {
    let mut command = args(&["--json", "save", "--message", message]);
    command.extend(files.iter().map(OsString::from));
    run_text("pig", root, command).map(|_| ())
}

pub(super) fn sync(root: &Path) -> Result<(), String> {
    run_text("pig", root, args(&["--json", "sync"])).map(|_| ())
}

fn prefixed(prefix: Option<&str>, path: &str) -> String {
    prefix.map_or_else(|| path.to_string(), |prefix| format!("{prefix}/{path}"))
}

fn collect_statuses(value: &Value, prefix: Option<&str>, statuses: &mut Statuses) {
    if let Some(entries) = value.as_array() {
        for entry in entries {
            if let (Some(path), Some(state)) = (
                entry.get("path").and_then(Value::as_str),
                entry.get("state").and_then(Value::as_str),
            ) {
                statuses.insert(prefixed(prefix, path), file_status(state));
            }
        }
        return;
    }
    for repo in value
        .get("repos")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        if let Some(files) = repo.get("files") {
            collect_statuses(files, repo.get("path").and_then(Value::as_str), statuses);
        }
    }
}

fn collect_diff(value: &Value, file: Option<&str>, prefix: Option<&str>, output: &mut String) {
    if let Some(files) = value.get("files").and_then(Value::as_array) {
        for item in files {
            let Some(path) = item.get("path").and_then(Value::as_str) else {
                continue;
            };
            let path = prefixed(prefix, path);
            if file.is_none_or(|file| file == path) {
                render_file_diff(&path, item, output);
            }
        }
        return;
    }
    for repo in value
        .get("repos")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        let prefix = repo.get("path").and_then(Value::as_str);
        collect_diff(repo.get("diff").unwrap_or(repo), file, prefix, output);
    }
}

fn render_file_diff(path: &str, item: &Value, output: &mut String) {
    let change = item
        .get("change")
        .and_then(Value::as_str)
        .unwrap_or("modified");
    let diff = item.get("diff").and_then(Value::as_str).unwrap_or("");
    if !output.is_empty() {
        output.push('\n');
    }
    let _ = writeln!(output, "diff --pig {path}\nchange: {change}");
    let marker = match change {
        "added" => Some('+'),
        "deleted" => Some('-'),
        _ => None,
    };
    match marker {
        Some(marker) => {
            for line in diff.lines() {
                let _ = writeln!(output, "{marker}{line}");
            }
        }
        None => output.push_str(diff),
    }
}

fn file_status(state: &str) -> VcsFileStatus {
    match state {
        "added" => VcsFileStatus::Added,
        "deleted" => VcsFileStatus::Deleted,
        "conflicted" => VcsFileStatus::Conflicted,
        "ignored" => VcsFileStatus::Ignored,
        "renamed" => VcsFileStatus::Renamed,
        _ => VcsFileStatus::Modified,
    }
}
