mod command;
mod git;

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;

use luft_app::Events;
use serde::Serialize;

use crate::app::events::VCS_STATUS;

static NEXT_STATUS_ID: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Serialize)]
pub struct VcsRoot {
    pub root: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VcsProject {
    pub root: String,
    pub branch: Option<String>,
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
    let root = find_root(Path::new(&path))?;
    command::is_installed().then(|| VcsRoot {
        root: root.to_string_lossy().into_owned(),
    })
}

pub fn start_status(root: String, events: Events) -> String {
    let id = NEXT_STATUS_ID.fetch_add(1, Ordering::Relaxed).to_string();
    let event_id = id.clone();
    thread::spawn(move || {
        let result = project_root(&root).and_then(|root| {
            let statuses = git::statuses(&root)?;
            Ok((project(&root, &statuses), statuses))
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
    git::diff(&project_root(&root)?, file_path)
}

pub fn save(root: String, message: String, files: Option<Vec<String>>) -> Result<(), String> {
    if message.trim().is_empty() {
        return Err("Message is required".to_string());
    }
    let root = project_root(&root)?;
    let files: Vec<String> = files
        .unwrap_or_default()
        .iter()
        .map(|path| relative_path(&root, path))
        .filter(|path| !path.is_empty())
        .collect();
    git::save(&root, &message, &files)
}

pub fn sync(root: String) -> Result<(), String> {
    git::sync(&project_root(&root)?)
}

fn project_root(root: &str) -> Result<PathBuf, String> {
    if !Path::new(root).is_dir() {
        return Err(format!("Project folder no longer exists: {root}"));
    }
    find_root(Path::new(root)).ok_or_else(|| "No versioned project found".to_string())
}

fn find_root(path: &Path) -> Option<PathBuf> {
    let home = dirs::home_dir();
    path.ancestors()
        .take_while(|dir| home.as_deref() != Some(*dir))
        .find(|dir| dir.join(".git").exists())
        .map(Path::to_path_buf)
}

fn project(root: &Path, statuses: &Statuses) -> VcsProject {
    let (branch, ahead, behind) = git::position(root);
    let count =
        |matches: fn(&VcsFileStatus) -> bool| statuses.values().filter(|s| matches(s)).count();
    VcsProject {
        root: root.to_string_lossy().into_owned(),
        branch,
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
