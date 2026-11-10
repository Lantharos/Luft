use std::ffi::OsString;
use std::path::Path;

use super::command::{args, reading, run_bytes, run_text_with_codes};
use super::{Statuses, VcsFileStatus, relative_path};

#[derive(Default)]
pub(super) struct Status {
    pub files: Statuses,
    pub branch: Option<String>,
    pub ahead: Option<usize>,
    pub behind: Option<usize>,
}

impl Status {
    fn is_new(&self, file: &str) -> bool {
        matches!(
            self.files.get(file),
            Some(VcsFileStatus::Untracked | VcsFileStatus::Added)
        ) || Path::new(file).ancestors().skip(1).any(|folder| {
            folder
                .to_str()
                .and_then(|folder| self.files.get(folder))
                .is_some_and(|status| *status == VcsFileStatus::Untracked)
        })
    }

    fn read_header(&mut self, header: &str) {
        if let Some(head) = header.strip_prefix("branch.head ") {
            self.branch = (head != "(detached)").then(|| head.to_owned());
        } else if let Some(counts) = header.strip_prefix("branch.ab ") {
            let mut counts = counts
                .split(' ')
                .map(|count| count.get(1..).and_then(|count| count.parse().ok()));
            self.ahead = counts.next().flatten();
            self.behind = counts.next().flatten();
        }
    }
}

pub(super) fn status(root: &Path) -> Result<Status, String> {
    let output = run_bytes(
        root,
        reading(&[
            "status",
            "--porcelain=v2",
            "--branch",
            "-z",
            "--untracked-files=normal",
        ]),
        &[0],
    )?;
    let mut records = output
        .split(|byte| *byte == 0)
        .map(String::from_utf8_lossy)
        .filter(|record| !record.is_empty());
    let mut status = Status::default();
    while let Some(record) = records.next() {
        let Some((kind, rest)) = record.split_once(' ') else {
            continue;
        };
        let changed = |fields: usize| {
            let mut parts = rest.splitn(fields, ' ');
            let mut state = parts.next()?.chars();
            let state = (state.next()?, state.next()?);
            Some((parts.last()?.to_owned(), state))
        };
        let entry = match kind {
            "#" => {
                status.read_header(rest);
                None
            }
            "1" => changed(8).map(|(path, (x, y))| (path, file_status(x, y))),
            "2" => {
                records.next();
                changed(9).map(|(path, (x, y))| (path, file_status(x, y)))
            }
            "u" => changed(10).map(|(path, _)| (path, VcsFileStatus::Conflicted)),
            "?" => Some((folder_or_file(rest), VcsFileStatus::Untracked)),
            "!" => Some((folder_or_file(rest), VcsFileStatus::Ignored)),
            _ => None,
        };
        status.files.extend(entry);
    }
    Ok(status)
}

fn folder_or_file(path: &str) -> String {
    path.strip_suffix('/').unwrap_or(path).to_owned()
}

pub(super) fn diff(root: &Path, file_path: Option<String>) -> Result<String, String> {
    let file = file_path.as_deref().map(|path| relative_path(root, path));
    let with_file = |base: &[&str]| {
        let mut command = reading(base);
        command.extend(file.iter().map(OsString::from));
        command
    };
    let diff = run_text_with_codes(
        root,
        with_file(&["diff", "--no-ext-diff", "--no-textconv", "HEAD", "--"]),
        &[0],
    )
    .or_else(|_| {
        run_text_with_codes(
            root,
            with_file(&["diff", "--no-ext-diff", "--no-textconv", "--"]),
            &[0],
        )
    })?;
    let Some(file) = file.filter(|_| diff.trim().is_empty()) else {
        return Ok(diff);
    };
    if !root.join(&file).is_file() || !status(root).is_ok_and(|status| status.is_new(&file)) {
        return Ok(diff);
    }
    run_text_with_codes(
        root,
        reading(&[
            "diff",
            "--no-index",
            "--no-ext-diff",
            "--no-textconv",
            "--",
            "/dev/null",
            &file,
        ]),
        &[0, 1],
    )
}

pub(super) fn save(root: &Path, message: &str, files: &[String]) -> Result<(), String> {
    if files.is_empty() {
        run(root, &["add", "-A"])?;
    } else {
        let mut command = args(&["add", "--"]);
        command.extend(files.iter().map(OsString::from));
        run_text_with_codes(root, command, &[0])?;
    }
    run(root, &["commit", "-m", message]).map(|_| ())
}

pub(super) fn sync(root: &Path) -> Result<(), String> {
    let status = status(root)?;
    if status
        .files
        .values()
        .any(|status| *status == VcsFileStatus::Conflicted)
    {
        return Err("Resolve conflicts before syncing".to_string());
    }
    if status
        .files
        .values()
        .any(|status| *status != VcsFileStatus::Ignored)
    {
        return Err("Commit or discard changes before syncing".to_string());
    }
    let has_upstream = status.ahead.is_some() || status.behind.is_some();
    let (ahead, behind) = (status.ahead.unwrap_or(0), status.behind.unwrap_or(0));
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
    run_text_with_codes(root, args(values), &[0])
}

fn file_status(x: char, y: char) -> VcsFileStatus {
    match (x, y) {
        ('D', _) | (_, 'D') => VcsFileStatus::Deleted,
        ('R', _) | (_, 'R') => VcsFileStatus::Renamed,
        ('A', _) | (_, 'A') => VcsFileStatus::Added,
        _ => VcsFileStatus::Modified,
    }
}
