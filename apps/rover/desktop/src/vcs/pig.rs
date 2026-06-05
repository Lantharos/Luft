use std::collections::BTreeMap;
use std::ffi::OsString;
use std::path::Path;

use serde_json::Value;

use super::{
    os_args, project_from_statuses, relative_path, run_json, run_text, VcsFileStatus, VcsKind,
    VcsProject,
};

pub(super) fn project(
    root: &Path,
    statuses: BTreeMap<String, VcsFileStatus>,
) -> Result<VcsProject, String> {
    Ok(project_from_statuses(
        root,
        VcsKind::Pig,
        workspace(root),
        remote_name(root),
        None,
        None,
        statuses,
    ))
}

pub(super) fn statuses(root: &Path) -> Result<BTreeMap<String, VcsFileStatus>, String> {
    let json = run_json("pig", root, os_args(&["--json", "status"]))?;
    let mut statuses = BTreeMap::new();
    collect_statuses(&json, None, &mut statuses);
    Ok(statuses)
}

pub(super) fn diff(root: &Path, file_path: Option<String>) -> Result<String, String> {
    let json = run_json("pig", root, os_args(&["--json", "diff", "--all"]))?;
    let file = file_path.as_deref().map(|path| relative_path(root, path));
    let mut output = String::new();
    collect_diff(&json, file.as_deref(), None, &mut output);
    Ok(output)
}

pub(super) fn save(root: &Path, message: &str, files: Option<Vec<String>>) -> Result<(), String> {
    let files = files
        .unwrap_or_default()
        .into_iter()
        .map(|path| relative_path(root, &path))
        .filter(|path| !path.is_empty())
        .collect::<Vec<_>>();
    let mut args = os_args(&["--json", "save", "--message", message]);
    if !files.is_empty() {
        args.extend(files.iter().map(OsString::from));
    }
    run_text("pig", root, args).map(|_| ())
}

pub(super) fn sync(root: &Path) -> Result<(), String> {
    run_text("pig", root, os_args(&["--json", "sync"])).map(|_| ())
}

fn workspace(root: &Path) -> Option<String> {
    let status = run_json("pig", root, os_args(&["--json", "work", "status"])).ok()?;
    status
        .get("current")
        .and_then(Value::as_str)
        .map(str::to_string)
}

fn remote_name(root: &Path) -> Option<String> {
    let remote = run_json("pig", root, os_args(&["--json", "remote", "show"])).ok()?;
    let configured = remote
        .get("configured")
        .and_then(Value::as_bool)
        .unwrap_or(false);
    if !configured {
        return None;
    }
    let tenant = remote.get("tenant").and_then(Value::as_str);
    let project = remote.get("project").and_then(Value::as_str);
    match (tenant, project) {
        (Some(tenant), Some(project)) => Some(format!("{tenant}/{project}")),
        _ => remote
            .get("remote")
            .and_then(Value::as_str)
            .map(str::to_string),
    }
}

fn collect_statuses(
    value: &Value,
    prefix: Option<&str>,
    statuses: &mut BTreeMap<String, VcsFileStatus>,
) {
    if let Some(entries) = value.as_array() {
        for entry in entries {
            if let (Some(path), Some(state)) = (
                entry.get("path").and_then(Value::as_str),
                entry.get("state").and_then(Value::as_str),
            ) {
                let path =
                    prefix.map_or_else(|| path.to_string(), |prefix| format!("{prefix}/{path}"));
                statuses.insert(path, file_status(state));
            }
        }
        return;
    }
    if let Some(repos) = value.get("repos").and_then(Value::as_array) {
        for repo in repos {
            let prefix = repo.get("path").and_then(Value::as_str);
            if let Some(files) = repo.get("files") {
                collect_statuses(files, prefix, statuses);
            }
        }
    }
}

fn collect_diff(value: &Value, file: Option<&str>, prefix: Option<&str>, output: &mut String) {
    if let Some(files) = value.get("files").and_then(Value::as_array) {
        for item in files {
            let Some(path) = item.get("path").and_then(Value::as_str) else {
                continue;
            };
            let path = prefix.map_or_else(|| path.to_string(), |prefix| format!("{prefix}/{path}"));
            if file.is_some_and(|file| file != path) {
                continue;
            }
            render_file_diff(&path, item, output);
        }
        return;
    }
    if let Some(repos) = value.get("repos").and_then(Value::as_array) {
        for repo in repos {
            let prefix = repo.get("path").and_then(Value::as_str);
            collect_diff(repo.get("diff").unwrap_or(repo), file, prefix, output);
        }
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
    output.push_str(&format!("diff --pig {path}\n"));
    output.push_str(&format!("change: {change}\n"));
    match change {
        "added" => push_prefixed(output, '+', diff),
        "deleted" => push_prefixed(output, '-', diff),
        _ => output.push_str(diff),
    }
}

fn push_prefixed(output: &mut String, prefix: char, diff: &str) {
    for line in diff.lines() {
        output.push(prefix);
        output.push_str(line);
        output.push('\n');
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
