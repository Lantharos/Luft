mod command;
mod git;
mod trust;

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;

use luft_app::Events;
use serde::Serialize;
use specta::Type;

use crate::app::events::VCS_STATUS;
use crate::app::settings::Settings;

static NEXT_STATUS_ID: AtomicU64 = AtomicU64::new(1);

#[derive(Debug, Serialize, Type)]
pub struct VcsRoot {
    pub root: String,
    pub trusted: bool,
}

#[derive(Debug, Clone, Serialize, Type)]
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

#[derive(Debug, Clone, Copy, Eq, Ord, PartialEq, PartialOrd, Serialize, Type)]
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

#[derive(Serialize, Type)]
pub struct VcsStatusEvent {
    id: String,
    project: Option<VcsProject>,
    statuses: Option<Statuses>,
    error: Option<String>,
}

pub fn root(path: String, settings: &Settings) -> Option<VcsRoot> {
    let root = find_root(Path::new(&path))?;
    command::is_installed().then(|| VcsRoot {
        trusted: trust::is_trusted(&root, settings),
        root: root.to_string_lossy().into_owned(),
    })
}

pub fn trust(root: String, settings: &mut Settings) -> Result<(), String> {
    let root = find_root(Path::new(&root))
        .filter(|found| found.as_path() == Path::new(&root))
        .ok_or("No versioned project found")?;
    let root = root.to_string_lossy().into_owned();
    if !settings.trusted_folders.contains(&root) {
        settings.trusted_folders.push(root);
    }
    settings.save()
}

pub fn start_status(root: String, settings: &Settings, events: Events) -> String {
    let id = NEXT_STATUS_ID.fetch_add(1, Ordering::Relaxed).to_string();
    let event_id = id.clone();
    let root = project_root(&root, settings);
    thread::spawn(move || {
        let result = root.and_then(|root| {
            let status = git::status(&root)?;
            Ok((project(&root, &status), status.files))
        });
        let (project, statuses, error) = match result {
            Ok((project, statuses)) => (Some(project), Some(statuses), None),
            Err(error) => (None, None, Some(error)),
        };
        events.emit(
            VCS_STATUS,
            VcsStatusEvent {
                id: event_id,
                project,
                statuses,
                error,
            },
        );
    });
    id
}

pub fn diff(
    root: String,
    file_path: Option<String>,
    settings: &Settings,
) -> Result<String, String> {
    git::diff(&project_root(&root, settings)?, file_path)
}

pub fn save(
    root: String,
    message: String,
    files: Option<Vec<String>>,
    settings: &Settings,
) -> Result<(), String> {
    if message.trim().is_empty() {
        return Err("Message is required".to_string());
    }
    let root = project_root(&root, settings)?;
    let files: Vec<String> = files
        .unwrap_or_default()
        .iter()
        .map(|path| relative_path(&root, path))
        .filter(|path| !path.is_empty())
        .collect();
    git::save(&root, &message, &files)
}

pub fn sync(root: String, settings: &Settings) -> Result<(), String> {
    git::sync(&project_root(&root, settings)?)
}

fn project_root(root: &str, settings: &Settings) -> Result<PathBuf, String> {
    if !Path::new(root).is_dir() {
        return Err(format!("Project folder no longer exists: {root}"));
    }
    let root = find_root(Path::new(root)).ok_or("No versioned project found")?;
    if !trust::is_trusted(&root, settings) {
        return Err(format!("{} isn't a trusted folder", root.display()));
    }
    Ok(root)
}

fn find_root(path: &Path) -> Option<PathBuf> {
    let home = dirs::home_dir();
    path.ancestors()
        .take_while(|dir| home.as_deref() != Some(*dir))
        .find(|dir| dir.join(".git").exists())
        .map(Path::to_path_buf)
}

fn project(root: &Path, status: &git::Status) -> VcsProject {
    let count =
        |matches: fn(&VcsFileStatus) -> bool| status.files.values().filter(|s| matches(s)).count();
    VcsProject {
        root: root.to_string_lossy().into_owned(),
        branch: status.branch.clone(),
        ahead: status.ahead,
        behind: status.behind,
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
