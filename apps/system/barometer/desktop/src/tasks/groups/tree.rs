use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;
use specta::Type;

use crate::system::procfile::unescape_hex;
use crate::tasks::apps::{CGROUPS, Scopes, Unit, is_desktop_app, is_shared};
use crate::tasks::process::read_cgroup;

const UNIT_KEY: &str = "cgroup:";
const SYSTEMD: &str = "systemd";
const OWN: [&str; 5] = ["luft-", "kestrel", "sabine", "peek-", "com.lantharos."];

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Group {
    Apps,
    Background,
    System,
}

pub struct Leaf {
    pub path: String,
    pub key: String,
    pub group: Option<Group>,
}

impl Leaf {
    pub fn absolute(&self) -> PathBuf {
        Path::new(CGROUPS).join(self.path.trim_start_matches('/'))
    }
}

pub fn unit_path(key: &str) -> Option<PathBuf> {
    key.strip_prefix(UNIT_KEY)
        .map(|path| Path::new(CGROUPS).join(path.trim_start_matches('/')))
}

pub fn leaves(scopes: &mut Scopes, everywhere: bool) -> Vec<Leaf> {
    let mut paths = Vec::new();
    if everywhere {
        walk("", &mut paths);
    } else {
        for top in scopes.nearby() {
            walk(top, &mut paths);
        }
    }
    paths.sort_unstable();
    paths.dedup();
    paths.into_iter().map(|path| place(scopes, path)).collect()
}

pub fn leaf_of(scopes: &mut Scopes, pid: u32) -> Option<Leaf> {
    leaf_path(&read_cgroup(pid)).map(|path| place(scopes, path))
}

pub fn key_of_cgroup(scopes: &mut Scopes, cgroup: &str) -> Option<String> {
    leaf_path(cgroup).map(|path| place(scopes, path).key)
}

fn leaf_path(cgroup: &str) -> Option<String> {
    let mut path = String::new();
    for part in cgroup.split('/').filter(|part| !part.is_empty()) {
        path.push('/');
        path.push_str(part);
        if !descends(part) {
            return Some(path);
        }
    }
    None
}

fn place(scopes: &mut Scopes, path: String) -> Leaf {
    if let Some(key) = scopes.app_of_cgroup(&path) {
        let group = if is_shared(&key) {
            Some(Group::System)
        } else if is_desktop_app(&key) {
            None
        } else {
            Some(Group::Background)
        };
        return Leaf { path, key, group };
    }
    let leaf = path.rsplit('/').next().unwrap_or_default();
    let unit = Unit::parse(leaf);
    let name = match &unit {
        _ if leaf == "init.scope" => SYSTEMD.to_owned(),
        Some(unit) => unit.id.clone(),
        None => unescape_hex(leaf.rsplit_once('.').map_or(leaf, |(stem, _)| stem)),
    };
    let own = OWN.iter().any(|prefix| name.starts_with(prefix));
    let activated = unit.as_ref().is_some_and(Unit::activated);
    let group = if !own && !activated && near(scopes, &path) {
        Group::Background
    } else {
        Group::System
    };
    let key = format!("{UNIT_KEY}{path}");
    scopes.name(&key, name);
    Leaf {
        path,
        key,
        group: Some(group),
    }
}

fn near(scopes: &Scopes, path: &str) -> bool {
    scopes.nearby().iter().any(|top| {
        path.strip_prefix(top.as_str())
            .is_some_and(|rest| rest.starts_with('/'))
    })
}

fn descends(name: &str) -> bool {
    name.ends_with(".slice") || (name.starts_with("user@") && name.ends_with(".service"))
}

fn walk(path: &str, out: &mut Vec<String>) {
    let Ok(entries) = fs::read_dir(format!("{CGROUPS}{path}")) else {
        return;
    };
    for entry in entries.flatten() {
        if !entry.file_type().is_ok_and(|kind| kind.is_dir()) {
            continue;
        }
        let Ok(name) = entry.file_name().into_string() else {
            continue;
        };
        let child = format!("{path}/{name}");
        if descends(&name) {
            walk(&child, out);
        } else {
            out.push(child);
        }
    }
}
