use std::collections::BTreeMap;
use std::ffi::OsString;
use std::path::Path;

use super::{
    os_args, project_from_statuses, relative_path, run_bytes, run_text_with_codes, VcsFileStatus,
    VcsKind, VcsProject,
};

pub(super) fn project(
    root: &Path,
    statuses: BTreeMap<String, VcsFileStatus>,
) -> Result<VcsProject, String> {
    let branch = run_text(root, os_args(&["branch", "--show-current"]))
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());
    let upstream = run_text(
        root,
        os_args(&[
            "rev-parse",
            "--abbrev-ref",
            "--symbolic-full-name",
            "@{upstream}",
        ]),
    )
    .ok()
    .map(|value| value.trim().to_string())
    .filter(|value| !value.is_empty());
    let remote_name = upstream
        .as_ref()
        .and_then(|value| value.split('/').next())
        .map(str::to_string);
    let (ahead, behind) = ahead_behind(root);
    Ok(project_from_statuses(
        root,
        VcsKind::Git,
        branch,
        remote_name,
        ahead,
        behind,
        statuses,
    ))
}

pub(super) fn statuses(root: &Path) -> Result<BTreeMap<String, VcsFileStatus>, String> {
    let output = run_bytes(
        "git",
        root,
        os_args(&["status", "--porcelain=v1", "-z", "--untracked-files=all"]),
        &[0],
    )?;
    let chunks = output
        .split(|byte| *byte == 0)
        .filter(|chunk| !chunk.is_empty())
        .collect::<Vec<_>>();
    let mut statuses = BTreeMap::new();
    let mut index = 0;
    while index < chunks.len() {
        let chunk = chunks[index];
        index += 1;
        if chunk.len() < 4 {
            continue;
        }
        let x = chunk[0] as char;
        let y = chunk[1] as char;
        let path = String::from_utf8_lossy(&chunk[3..]).to_string();
        statuses.insert(path, file_status(x, y));
        if matches!(x, 'R' | 'C') || matches!(y, 'R' | 'C') {
            index += 1;
        }
    }
    Ok(statuses)
}

pub(super) fn diff(root: &Path, file_path: Option<String>) -> Result<String, String> {
    let file = file_path.as_deref().map(|path| relative_path(root, path));
    let mut args = os_args(&["diff", "--no-ext-diff", "HEAD", "--"]);
    if let Some(file) = &file {
        args.push(file.into());
    }
    let diff = run_text(root, args).or_else(|_| {
        let mut fallback = os_args(&["diff", "--no-ext-diff", "--"]);
        if let Some(file) = &file {
            fallback.push(file.into());
        }
        run_text(root, fallback)
    })?;
    if !diff.trim().is_empty() || file.is_none() {
        return Ok(diff);
    }
    let file = file.unwrap();
    let status = statuses(root)
        .ok()
        .and_then(|statuses| statuses.get(&file).copied());
    if !matches!(
        status,
        Some(VcsFileStatus::Untracked | VcsFileStatus::Added)
    ) {
        return Ok(diff);
    }
    run_text_with_codes(
        "git",
        root,
        os_args(&["diff", "--no-index", "--", "/dev/null", &file]),
        &[0, 1],
    )
}

pub(super) fn save(root: &Path, message: &str, files: Option<Vec<String>>) -> Result<(), String> {
    let files = files
        .unwrap_or_default()
        .into_iter()
        .map(|path| relative_path(root, &path))
        .filter(|path| !path.is_empty())
        .collect::<Vec<_>>();

    if files.is_empty() {
        run_text(root, os_args(&["add", "-A"]))?;
    } else {
        let mut args = os_args(&["add", "--"]);
        args.extend(files.iter().map(OsString::from));
        run_text(root, args)?;
    }
    run_text(root, os_args(&["commit", "-m", message])).map(|_| ())
}

pub(super) fn sync(root: &Path) -> Result<(), String> {
    let current = project(root, statuses(root)?)?;
    if current.conflicted_count > 0 {
        return Err("Resolve conflicts before syncing".to_string());
    }
    if current.changed_count > 0 {
        return Err("Commit or discard changes before syncing".to_string());
    }
    let ahead = current.ahead.unwrap_or(0);
    let behind = current.behind.unwrap_or(0);
    if ahead > 0 && behind > 0 {
        return Err("Remote has changes. Pull first from a terminal.".to_string());
    }
    if behind > 0 {
        run_text(root, os_args(&["pull", "--rebase"]))?;
    }
    let next = project(root, statuses(root)?)?;
    if next.ahead.unwrap_or(ahead) > 0 || (current.ahead.is_none() && current.behind.is_none()) {
        run_text(root, os_args(&["push"]))?;
    }
    Ok(())
}

fn run_text(root: &Path, args: Vec<OsString>) -> Result<String, String> {
    super::run_text("git", root, args)
}

fn file_status(x: char, y: char) -> VcsFileStatus {
    if x == '?' && y == '?' {
        return VcsFileStatus::Untracked;
    }
    if x == '!' && y == '!' {
        return VcsFileStatus::Ignored;
    }
    if x == 'U' || y == 'U' || matches!((x, y), ('A', 'A') | ('D', 'D') | ('A', 'D') | ('D', 'A')) {
        return VcsFileStatus::Conflicted;
    }
    if x == 'D' || y == 'D' {
        return VcsFileStatus::Deleted;
    }
    if x == 'R' || y == 'R' {
        return VcsFileStatus::Renamed;
    }
    if x == 'A' || y == 'A' {
        return VcsFileStatus::Added;
    }
    if x == 'M' || y == 'M' || x == 'T' || y == 'T' {
        return VcsFileStatus::Modified;
    }
    VcsFileStatus::Modified
}

fn ahead_behind(root: &Path) -> (Option<usize>, Option<usize>) {
    let Ok(output) = run_text(
        root,
        os_args(&["rev-list", "--left-right", "--count", "@{upstream}...HEAD"]),
    ) else {
        return (None, None);
    };
    let mut parts = output.split_whitespace();
    let behind = parts.next().and_then(|value| value.parse().ok());
    let ahead = parts.next().and_then(|value| value.parse().ok());
    (ahead, behind)
}
