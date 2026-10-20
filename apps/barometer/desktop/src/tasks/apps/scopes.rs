use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use super::desktop::{AppInfo, Apps, Unit};
use crate::tasks::process::{Stat, read_cgroup};

const ANCESTORS: usize = 16;
const APP_SLICE_OVERRIDE: &str = "LUFT_APP_SLICE";

pub struct Scopes {
    root: PathBuf,
    marker: String,
    apps: Apps,
    resolved: HashMap<String, Option<String>>,
}

impl Scopes {
    pub fn new() -> Self {
        let root = std::env::var_os(APP_SLICE_OVERRIDE).map_or_else(app_slice, PathBuf::from);
        let slice = root.file_name().unwrap_or_default().to_string_lossy();
        Self {
            marker: format!("/{slice}/"),
            root,
            apps: Apps::default(),
            resolved: HashMap::new(),
        }
    }

    pub fn names(&self) -> Vec<String> {
        let mut names = Vec::new();
        for name in units(&self.root) {
            if name.ends_with(".slice") {
                names.extend(
                    children(&self.root.join(&name))
                        .into_iter()
                        .map(|unit| format!("{name}/{unit}")),
                );
            } else {
                names.push(name);
            }
        }
        names
    }

    pub fn path(&self, name: &str) -> PathBuf {
        self.root.join(name)
    }

    pub fn info(&self, key: &str) -> Option<&AppInfo> {
        self.apps.info(key)
    }

    pub fn forget(&mut self, alive: &[String]) {
        self.resolved.retain(|name, _| alive.contains(name));
    }

    pub fn app_of_cgroup(&mut self, cgroup: &str) -> Option<String> {
        self.app_of(&relative(cgroup, &self.marker)?)
    }

    pub fn app_of(&mut self, name: &str) -> Option<String> {
        if let Some(app) = self.resolved.get(name) {
            return app.clone();
        }
        let app = self.resolve(name, 0);
        self.resolved.insert(name.to_owned(), app.clone());
        app
    }

    fn resolve(&mut self, name: &str, depth: usize) -> Option<String> {
        if let Some(runtime) = self.apps.sabine_runtime(name) {
            return Some(runtime);
        }
        let unit = Unit::parse(name)?;
        if !unit.chromium()
            && let Some(app) = self.apps.resolve(&unit.id)
        {
            return Some(app);
        }
        if depth > 2 {
            return None;
        }
        if let Some(app) = unit
            .suffix
            .as_deref()
            .and_then(|suffix| self.launcher(name, suffix))
        {
            return Some(app);
        }
        if let Some(app) = self.ancestor(name, unit.suffix.as_deref(), depth) {
            return Some(app);
        }
        if unit.chromium() {
            self.apps.resolve(&unit.id)
        } else {
            (!unit.activated()).then(|| self.apps.pseudo(&unit.id))
        }
    }

    fn launcher(&mut self, name: &str, suffix: &str) -> Option<String> {
        let ending = format!("-{suffix}.scope");
        let sibling = self
            .names()
            .into_iter()
            .find(|other| other != name && other.ends_with(&ending))?;
        let unit = Unit::parse(&sibling)?;
        (!unit.chromium())
            .then(|| self.apps.resolve(&unit.id))
            .flatten()
    }

    fn ancestor(&mut self, name: &str, suffix: Option<&str>, depth: usize) -> Option<String> {
        let members = members(&self.path(name));
        let mut candidates: Vec<u32> = members
            .iter()
            .copied()
            .filter(|pid| suffix.is_some_and(|suffix| suffix == pid.to_string()))
            .collect();
        candidates.extend(members.iter().take(4));
        let scope = candidates
            .into_iter()
            .find_map(|pid| ancestor_scope(pid, name, &self.marker))?;
        self.resolve(&scope, depth + 1)
    }
}

fn app_slice() -> PathBuf {
    let uid = unsafe { libc::getuid() };
    PathBuf::from(format!(
        "/sys/fs/cgroup/user.slice/user-{uid}.slice/user@{uid}.service/app.slice"
    ))
}

fn units(directory: &Path) -> Vec<String> {
    children(directory)
        .into_iter()
        .filter(|name| name.starts_with("app-") || name.starts_with("dbus-"))
        .collect()
}

fn children(directory: &Path) -> Vec<String> {
    let Ok(entries) = fs::read_dir(directory) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .filter_map(|entry| entry.file_name().into_string().ok())
        .collect()
}

fn relative(cgroup: &str, marker: &str) -> Option<String> {
    let (_, rest) = cgroup.split_once(marker)?;
    let mut parts = rest.split('/');
    let first = parts.next()?;
    Some(if first.ends_with(".slice") {
        format!("{first}/{}", parts.next()?)
    } else {
        first.to_owned()
    })
}

pub fn members(path: &Path) -> Vec<u32> {
    fs::read_to_string(path.join("cgroup.procs"))
        .unwrap_or_default()
        .lines()
        .filter_map(|line| line.parse().ok())
        .collect()
}

fn ancestor_scope(pid: u32, name: &str, marker: &str) -> Option<String> {
    let mut current = parent(pid)?;
    for _ in 0..ANCESTORS {
        if let Some(scope) = relative(&read_cgroup(current), marker).filter(|scope| scope != name) {
            return Some(scope);
        }
        current = parent(current)?;
    }
    None
}

fn parent(pid: u32) -> Option<u32> {
    let stat = fs::read(format!("/proc/{pid}/stat")).ok()?;
    Some(Stat::parse(&stat)?.ppid).filter(|ppid| *ppid > 1)
}
