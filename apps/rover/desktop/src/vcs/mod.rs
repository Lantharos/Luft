mod git;
mod pig;

use std::collections::{BTreeMap, HashMap};
use std::env;
use std::ffi::OsString;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::{
    atomic::{AtomicU64, Ordering},
    Arc,
};
use std::thread;

use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum VcsKind {
    Git,
    Pig,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VcsProject {
    pub root: String,
    pub kind: VcsKind,
    pub branch_or_workspace: Option<String>,
    pub remote_name: Option<String>,
    pub clean: bool,
    pub ahead: Option<usize>,
    pub behind: Option<usize>,
    pub changed_count: usize,
    pub added_count: usize,
    pub deleted_count: usize,
    pub conflicted_count: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VcsStatusSnapshot {
    pub project: VcsProject,
    pub statuses: BTreeMap<String, VcsFileStatus>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VcsJobTicket {
    pub id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VcsJobUpdate {
    pub done: bool,
    pub result: Option<VcsStatusSnapshot>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Copy, Eq, Ord, PartialEq, PartialOrd, Serialize)]
#[serde(rename_all = "lowercase")]
#[allow(dead_code)]
pub enum VcsFileStatus {
    Clean,
    Modified,
    Added,
    Deleted,
    Renamed,
    Untracked,
    Ignored,
    Conflicted,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VcsParams {
    pub path: Option<String>,
    pub root: Option<String>,
    pub file_path: Option<String>,
    pub message: Option<String>,
    pub files: Option<Vec<String>>,
    pub job_id: Option<String>,
}

#[derive(Clone)]
pub struct VcsJobs {
    inner: Arc<VcsJobsInner>,
}

struct VcsJobsInner {
    next_id: AtomicU64,
    jobs: Mutex<HashMap<String, VcsJobState>>,
}

enum VcsJobState {
    Pending,
    Done(Result<Option<VcsStatusSnapshot>, String>),
}

impl Default for VcsJobs {
    fn default() -> Self {
        Self {
            inner: Arc::new(VcsJobsInner {
                next_id: AtomicU64::new(1),
                jobs: Mutex::new(HashMap::new()),
            }),
        }
    }
}

impl VcsJobs {
    pub fn start_status(&self, path: String) -> VcsJobTicket {
        let id = self
            .inner
            .next_id
            .fetch_add(1, Ordering::Relaxed)
            .to_string();
        self.inner
            .jobs
            .lock()
            .insert(id.clone(), VcsJobState::Pending);

        let jobs = self.clone();
        let job_id = id.clone();
        thread::spawn(move || {
            let result = status_snapshot(path);
            jobs.inner
                .jobs
                .lock()
                .insert(job_id, VcsJobState::Done(result));
        });

        VcsJobTicket { id }
    }

    pub fn status_result(&self, id: String) -> Result<VcsJobUpdate, String> {
        let mut jobs = self.inner.jobs.lock();
        let Some(state) = jobs.get(&id) else {
            return Err("VCS job was not found".to_string());
        };
        match state {
            VcsJobState::Pending => Ok(VcsJobUpdate {
                done: false,
                result: None,
                error: None,
            }),
            VcsJobState::Done(_) => {
                let Some(VcsJobState::Done(result)) = jobs.remove(&id) else {
                    return Err("VCS job was not found".to_string());
                };
                match result {
                    Ok(result) => Ok(VcsJobUpdate {
                        done: true,
                        result,
                        error: None,
                    }),
                    Err(error) => Ok(VcsJobUpdate {
                        done: true,
                        result: None,
                        error: Some(error),
                    }),
                }
            }
        }
    }
}

pub fn detect(path: String) -> Result<Option<VcsProject>, String> {
    let Some(start) = start_directory(path) else {
        return Ok(None);
    };
    match find_root(&start) {
        Some((kind, root)) => match project_status_for(kind, &root) {
            Ok(project) => Ok(Some(project)),
            Err(error) if is_missing_program_error(&error) => Ok(None),
            Err(error) => Err(error),
        },
        None => Ok(None),
    }
}

pub fn status_snapshot(path: String) -> Result<Option<VcsStatusSnapshot>, String> {
    let Some(start) = start_directory(path) else {
        return Ok(None);
    };
    let Some((kind, root)) = find_root(&start) else {
        return Ok(None);
    };
    let statuses = statuses_for(kind, &root)?;
    let project = match kind {
        VcsKind::Git => git::project(&root, statuses.clone())?,
        VcsKind::Pig => pig::project(&root, statuses.clone())?,
    };
    Ok(Some(VcsStatusSnapshot { project, statuses }))
}

pub fn get_project_status(root: String) -> Result<VcsProject, String> {
    let (kind, root) = provider_root(root)?;
    project_status_for(kind, &root)
}

pub fn get_file_statuses(root: String) -> Result<BTreeMap<String, VcsFileStatus>, String> {
    let (kind, root) = provider_root(root)?;
    statuses_for(kind, &root)
}

pub fn get_diff(root: String, file_path: Option<String>) -> Result<String, String> {
    let (kind, root) = provider_root(root)?;
    match kind {
        VcsKind::Git => git::diff(&root, file_path),
        VcsKind::Pig => pig::diff(&root, file_path),
    }
}

pub fn save(root: String, message: String, files: Option<Vec<String>>) -> Result<(), String> {
    if message.trim().is_empty() {
        return Err("Message is required".to_string());
    }
    let (kind, root) = provider_root(root)?;
    match kind {
        VcsKind::Git => git::save(&root, &message, files),
        VcsKind::Pig => pig::save(&root, &message, files),
    }
}

pub fn sync(root: String) -> Result<(), String> {
    let (kind, root) = provider_root(root)?;
    match kind {
        VcsKind::Git => git::sync(&root),
        VcsKind::Pig => pig::sync(&root),
    }
}

fn start_directory(path: String) -> Option<PathBuf> {
    let path = absolute_path(path.trim()).ok()?;
    let directory = if path.is_file() {
        path.parent()?.to_path_buf()
    } else {
        path
    };
    fs::canonicalize(directory).ok()
}

fn provider_root(root: String) -> Result<(VcsKind, PathBuf), String> {
    let root = absolute_path(root.trim())?;
    let root = fs::canonicalize(&root)
        .map_err(|error| format!("VCS root no longer exists: {}: {error}", root.display()))?;
    find_root(&root).ok_or_else(|| "No versioned project found".to_string())
}

fn absolute_path(path: &str) -> Result<PathBuf, String> {
    let normalized = crate::path_codec::normalize_path(path);
    let path = normalized.trim();
    if path.is_empty() {
        return Err("VCS path is required".to_string());
    }
    let path = PathBuf::from(path);
    if path.is_absolute() {
        return Ok(path);
    }
    env::current_dir()
        .map(|cwd| cwd.join(&path))
        .map_err(|error| format!("Could not resolve VCS path `{}`: {error}", path.display()))
}

fn find_root(path: &Path) -> Option<(VcsKind, PathBuf)> {
    let mut current = Some(path);
    while let Some(dir) = current {
        if !is_home_root(dir) && dir.join(".pig").exists() {
            return Some((VcsKind::Pig, dir.to_path_buf()));
        }
        if !is_home_root(dir) && dir.join(".git").exists() {
            return Some((VcsKind::Git, dir.to_path_buf()));
        }
        current = dir.parent();
    }
    None
}

fn is_home_root(path: &Path) -> bool {
    dirs::home_dir().is_some_and(|home| home == path)
}

fn project_status_for(kind: VcsKind, root: &Path) -> Result<VcsProject, String> {
    let statuses = statuses_for(kind, root)?;
    match kind {
        VcsKind::Git => git::project(root, statuses),
        VcsKind::Pig => pig::project(root, statuses),
    }
}

fn statuses_for(kind: VcsKind, root: &Path) -> Result<BTreeMap<String, VcsFileStatus>, String> {
    match kind {
        VcsKind::Git => git::statuses(root),
        VcsKind::Pig => pig::statuses(root),
    }
}

pub(super) fn project_from_statuses(
    root: &Path,
    kind: VcsKind,
    branch_or_workspace: Option<String>,
    remote_name: Option<String>,
    ahead: Option<usize>,
    behind: Option<usize>,
    statuses: BTreeMap<String, VcsFileStatus>,
) -> VcsProject {
    let changed_count = statuses
        .values()
        .filter(|status| !matches!(status, VcsFileStatus::Clean | VcsFileStatus::Ignored))
        .count();
    let added_count = statuses
        .values()
        .filter(|status| matches!(status, VcsFileStatus::Added | VcsFileStatus::Untracked))
        .count();
    let deleted_count = statuses
        .values()
        .filter(|status| matches!(status, VcsFileStatus::Deleted))
        .count();
    let conflicted_count = statuses
        .values()
        .filter(|status| matches!(status, VcsFileStatus::Conflicted))
        .count();

    VcsProject {
        root: root.to_string_lossy().to_string(),
        kind,
        branch_or_workspace,
        remote_name,
        clean: changed_count == 0,
        ahead,
        behind,
        changed_count,
        added_count,
        deleted_count,
        conflicted_count,
    }
}

pub(super) fn run_json(program: &str, cwd: &Path, args: Vec<OsString>) -> Result<Value, String> {
    let text = run_text(program, cwd, args)?;
    serde_json::from_str(&text).map_err(|error| error.to_string())
}

pub(super) fn run_text(program: &str, cwd: &Path, args: Vec<OsString>) -> Result<String, String> {
    run_text_with_codes(program, cwd, args, &[0])
}

pub(super) fn run_text_with_codes(
    program: &str,
    cwd: &Path,
    args: Vec<OsString>,
    success_codes: &[i32],
) -> Result<String, String> {
    let output = run_bytes(program, cwd, args, success_codes)?;
    Ok(String::from_utf8_lossy(&output).to_string())
}

pub(super) fn run_bytes(
    program: &str,
    cwd: &Path,
    args: Vec<OsString>,
    success_codes: &[i32],
) -> Result<Vec<u8>, String> {
    let resolved_program = resolve_program(program)?;
    let cwd = fs::canonicalize(cwd)
        .map_err(|error| format!("VCS root no longer exists: {}: {error}", cwd.display()))?;
    let output = Command::new(&resolved_program)
        .args(args)
        .current_dir(&cwd)
        .env("LC_ALL", "C")
        .env("PATH", vcs_path())
        .output()
        .map_err(|error| {
            format!(
                "Failed to run {} at {} from {}: {error}",
                program_label(program),
                PathBuf::from(&resolved_program).display(),
                cwd.display()
            )
        })?;
    let code = output.status.code().unwrap_or(-1);
    if success_codes.contains(&code) {
        return Ok(output.stdout);
    }
    let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Err(if stderr.is_empty() { stdout } else { stderr })
}

pub(super) fn os_args(args: &[&str]) -> Vec<OsString> {
    args.iter().map(OsString::from).collect()
}

fn resolve_program(program: &str) -> Result<OsString, String> {
    if program.contains('/') {
        return Ok(program.into());
    }
    if let Some(path) = find_in_path(program) {
        return Ok(path.into_os_string());
    }
    for candidate in fallback_program_paths(program) {
        if candidate.is_file() {
            return Ok(candidate.into_os_string());
        }
    }
    Err(format!("{} executable not found", program_label(program)))
}

fn find_in_path(program: &str) -> Option<PathBuf> {
    let path = env::var_os("PATH")?;
    env::split_paths(&path)
        .map(|dir| dir.join(program))
        .find(|candidate| candidate.is_file())
}

fn fallback_program_paths(program: &str) -> Vec<PathBuf> {
    let mut paths = Vec::new();
    if let Some(home) = dirs::home_dir() {
        paths.push(home.join(".local/bin").join(program));
        paths.push(home.join(".cargo/bin").join(program));
        paths.push(home.join(".bun/bin").join(program));
    }
    paths.extend(
        [
            "/usr/local/bin",
            "/usr/bin",
            "/bin",
            "/opt/homebrew/bin",
            "/run/current-system/sw/bin",
            "/nix/var/nix/profiles/default/bin",
        ]
        .into_iter()
        .map(|dir| PathBuf::from(dir).join(program)),
    );
    paths
}

fn vcs_path() -> OsString {
    let mut paths = env::var_os("PATH")
        .map(|path| env::split_paths(&path).collect::<Vec<_>>())
        .unwrap_or_default();
    if let Some(home) = dirs::home_dir() {
        paths.push(home.join(".local/bin"));
        paths.push(home.join(".cargo/bin"));
        paths.push(home.join(".bun/bin"));
    }
    paths.extend(
        [
            "/usr/local/bin",
            "/usr/bin",
            "/bin",
            "/opt/homebrew/bin",
            "/run/current-system/sw/bin",
            "/nix/var/nix/profiles/default/bin",
        ]
        .into_iter()
        .map(PathBuf::from),
    );
    env::join_paths(paths).unwrap_or_else(|_| OsString::from("/usr/local/bin:/usr/bin:/bin"))
}

fn program_label(program: &str) -> &'static str {
    match program {
        "git" => "Git",
        "pig" => "Pig",
        _ => "VCS tool",
    }
}

fn is_missing_program_error(error: &str) -> bool {
    error.ends_with(" executable not found")
}

pub(super) fn relative_path(root: &Path, path: &str) -> String {
    let path = PathBuf::from(path);
    let relative = if path.is_absolute() {
        path.strip_prefix(root).unwrap_or(&path)
    } else {
        path.as_path()
    };
    relative.to_string_lossy().replace('\\', "/")
}
