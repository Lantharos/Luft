mod command;
mod git;
mod pig;

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;

use luft_app::Events;
use serde::Serialize;

use crate::events::VCS_STATUS;

static NEXT_STATUS_ID: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Clone, Copy, Serialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum VcsKind {
    Git,
    Pig,
}

impl VcsKind {
    fn program(self) -> &'static str {
        match self {
            Self::Git => "git",
            Self::Pig => "pig",
        }
    }

    fn metadata_dir(self) -> &'static str {
        match self {
            Self::Git => ".git",
            Self::Pig => ".pig",
        }
    }
}

#[derive(Debug, Serialize)]
pub struct VcsRoot {
    pub root: String,
    pub kind: VcsKind,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VcsProject {
    pub root: String,
    pub kind: VcsKind,
    pub branch_or_workspace: Option<String>,
    pub ahead: Option<usize>,
    pub behind: Option<usize>,
    pub changed_count: usize,
    pub added_count: usize,
    pub deleted_count: usize,
    pub conflicted_count: usize,
}

#[derive(Debug, Clone, Copy, Eq, Ord, PartialEq, PartialOrd, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum VcsFileStatus {
    Modified,
    Added,
    Deleted,
    Renamed,
    Untracked,
    Ignored,
    Conflicted,
}

type Statuses = BTreeMap<String, VcsFileStatus>;

#[derive(Serialize)]
struct StatusEvent {
    id: String,
    project: Option<VcsProject>,
    statuses: Option<Statuses>,
    error: Option<String>,
}

pub fn root(path: String) -> Option<VcsRoot> {
    let (kind, root) = find_root(Path::new(&path))?;
    command::is_installed(kind.program()).then(|| VcsRoot {
        root: root.to_string_lossy().into_owned(),
        kind,
    })
}

pub fn start_status(root: String, events: Events) -> String {
    let id = NEXT_STATUS_ID.fetch_add(1, Ordering::Relaxed).to_string();
    let event_id = id.clone();
    thread::spawn(move || {
        let result = project_root(&root).and_then(|(kind, root)| {
            let statuses = statuses(kind, &root)?;
            Ok((project(kind, &root, &statuses), statuses))
        });
        let (project, statuses, error) = match result {
            Ok((project, statuses)) => (Some(project), Some(statuses), None),
            Err(error) => (None, None, Some(error)),
        };
        events.emit(
            VCS_STATUS,
            StatusEvent {
                id: event_id,
                project,
                statuses,
                error,
            },
        );
    });
    id
}

pub fn diff(root: String, file_path: Option<String>) -> Result<String, String> {
    let (kind, root) = project_root(&root)?;
    match kind {
        VcsKind::Git => git::diff(&root, file_path),
        VcsKind::Pig => pig::diff(&root, file_path),
    }
}

pub fn save(root: String, message: String, files: Option<Vec<String>>) -> Result<(), String> {
    if message.trim().is_empty() {
        return Err("Message is required".to_string());
    }
    let (kind, root) = project_root(&root)?;
    let files: Vec<String> = files
        .unwrap_or_default()
        .iter()
        .map(|path| relative_path(&root, path))
        .filter(|path| !path.is_empty())
        .collect();
    match kind {
        VcsKind::Git => git::save(&root, &message, &files),
        VcsKind::Pig => pig::save(&root, &message, &files),
    }
}

pub fn sync(root: String) -> Result<(), String> {
    let (kind, root) = project_root(&root)?;
    match kind {
        VcsKind::Git => git::sync(&root),
        VcsKind::Pig => pig::sync(&root),
    }
}

fn project_root(root: &str) -> Result<(VcsKind, PathBuf), String> {
    if !Path::new(root).is_dir() {
        return Err(format!("Project folder no longer exists: {root}"));
    }
    find_root(Path::new(root)).ok_or_else(|| "No versioned project found".to_string())
}

fn find_root(path: &Path) -> Option<(VcsKind, PathBuf)> {
    let home = dirs::home_dir();
    path.ancestors()
        .filter(|dir| home.as_deref() != Some(*dir))
        .find_map(|dir| {
            [VcsKind::Pig, VcsKind::Git]
                .into_iter()
                .find(|kind| dir.join(kind.metadata_dir()).exists())
                .map(|kind| (kind, dir.to_path_buf()))
        })
}

fn statuses(kind: VcsKind, root: &Path) -> Result<Statuses, String> {
    match kind {
        VcsKind::Git => git::statuses(root),
        VcsKind::Pig => pig::statuses(root),
    }
}

fn project(kind: VcsKind, root: &Path, statuses: &Statuses) -> VcsProject {
    let (branch_or_workspace, ahead, behind) = match kind {
        VcsKind::Git => git::position(root),
        VcsKind::Pig => (pig::workspace(root), None, None),
    };
    let count =
        |matches: fn(&VcsFileStatus) -> bool| statuses.values().filter(|s| matches(s)).count();
    VcsProject {
        root: root.to_string_lossy().into_owned(),
        kind,
        branch_or_workspace,
        ahead,
        behind,
        changed_count: count(|status| *status != VcsFileStatus::Ignored),
        added_count: count(|status| {
            matches!(status, VcsFileStatus::Added | VcsFileStatus::Untracked)
        }),
        deleted_count: count(|status| *status == VcsFileStatus::Deleted),
        conflicted_count: count(|status| *status == VcsFileStatus::Conflicted),
    }
}

fn relative_path(root: &Path, path: &str) -> String {
    let path = Path::new(path);
    path.strip_prefix(root)
        .unwrap_or(path)
        .to_string_lossy()
        .into_owned()
}
