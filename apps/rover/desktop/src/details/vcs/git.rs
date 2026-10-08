use std::ffi::OsString;
use std::path::Path;

use super::command::{args, run_bytes, run_text_with_codes};
use super::{Statuses, VcsFileStatus, relative_path};

pub(super) fn statuses(root: &Path) -> Result<Statuses, String> {
    let output = run_bytes(
        "git",
        root,
        args(&["status", "--porcelain=v1", "-z", "--untracked-files=all"]),
        &[0],
    )?;
    let mut chunks = output
        .split(|byte| *byte == 0)
        .filter(|chunk| !chunk.is_empty());
    let mut statuses = Statuses::new();
    while let Some(chunk) = chunks.next() {
        if chunk.len() < 4 {
            continue;
        }
        let (x, y) = (chunk[0] as char, chunk[1] as char);
        statuses.insert(
            String::from_utf8_lossy(&chunk[3..]).into_owned(),
            file_status(x, y),
        );
        if matches!(x, 'R' | 'C') || matches!(y, 'R' | 'C') {
            chunks.next();
        }
    }
    Ok(statuses)
}

pub(super) fn position(root: &Path) -> (Option<String>, Option<usize>, Option<usize>) {
    let branch = run(root, &["branch", "--show-current"])
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());
    let Ok(counts) = run(
        root,
        &["rev-list", "--left-right", "--count", "@{upstream}...HEAD"],
    ) else {
        return (branch, None, None);
    };
    let mut parts = counts.split_whitespace().map(|value| value.parse().ok());
    let behind = parts.next().flatten();
    let ahead = parts.next().flatten();
    (branch, ahead, behind)
}

pub(super) fn diff(root: &Path, file_path: Option<String>) -> Result<String, String> {
    let file = file_path.as_deref().map(|path| relative_path(root, path));
    let with_file = |base: &[&str]| {
        let mut command = args(base);
        command.extend(file.iter().map(OsString::from));
        command
    };
    let diff = run_text_with_codes(
        "git",
        root,
        with_file(&["diff", "--no-ext-diff", "HEAD", "--"]),
        &[0],
    )
    .or_else(|_| {
        run_text_with_codes(
            "git",
            root,
            with_file(&["diff", "--no-ext-diff", "--"]),
            &[0],
        )
    })?;
    let Some(file) = file.filter(|_| diff.trim().is_empty()) else {
        return Ok(diff);
    };
    let untracked = statuses(root).ok().is_some_and(|statuses| {
        matches!(
            statuses.get(&file),
            Some(VcsFileStatus::Untracked | VcsFileStatus::Added)
        )
    });
    if !untracked {
        return Ok(diff);
    }
    run_text_with_codes(
        "git",
        root,
        args(&["diff", "--no-index", "--", "/dev/null", &file]),
        &[0, 1],
    )
}

pub(super) fn save(root: &Path, message: &str, files: &[String]) -> Result<(), String> {
    if files.is_empty() {
        run(root, &["add", "-A"])?;
    } else {
        let mut command = args(&["add", "--"]);
        command.extend(files.iter().map(OsString::from));
        run_text_with_codes("git", root, command, &[0])?;
    }
    run(root, &["commit", "-m", message]).map(|_| ())
}

pub(super) fn sync(root: &Path) -> Result<(), String> {
    let statuses = statuses(root)?;
    if statuses
        .values()
        .any(|status| *status == VcsFileStatus::Conflicted)
    {
        return Err("Resolve conflicts before syncing".to_string());
    }
    if statuses
        .values()
        .any(|status| *status != VcsFileStatus::Ignored)
    {
        return Err("Commit or discard changes before syncing".to_string());
    }
    let (_, ahead, behind) = position(root);
    let has_upstream = ahead.is_some() || behind.is_some();
    let (ahead, behind) = (ahead.unwrap_or(0), behind.unwrap_or(0));
    if ahead > 0 && behind > 0 {
        return Err("Remote has changes. Pull first from a terminal.".to_string());
    }
    if behind > 0 {
        run(root, &["pull", "--rebase"])?;
    }
    if ahead > 0 || !has_upstream {
        run(root, &["push"])?;
    }
    Ok(())
}

fn run(root: &Path, values: &[&str]) -> Result<String, String> {
    run_text_with_codes("git", root, args(values), &[0])
}

fn file_status(x: char, y: char) -> VcsFileStatus {
    match (x, y) {
        ('?', '?') => VcsFileStatus::Untracked,
        ('!', '!') => VcsFileStatus::Ignored,
        ('U', _) | (_, 'U') | ('A', 'A') | ('D', 'D') => VcsFileStatus::Conflicted,
        ('D', _) | (_, 'D') => VcsFileStatus::Deleted,
        ('R', _) | (_, 'R') => VcsFileStatus::Renamed,
        ('A', _) | (_, 'A') => VcsFileStatus::Added,
        _ => VcsFileStatus::Modified,
    }
}
