use std::collections::BTreeSet;
use std::fs;
use std::io::ErrorKind;
use std::path::Path;
use std::process::Command;
use std::time::Duration;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use super::manifest::Declared;
use crate::command::run;

/// What the system packages created that wasn't on the computer before them, so removing them
/// takes exactly that away again.
#[derive(Serialize, Deserialize, Default, Debug, PartialEq, Eq)]
pub struct Footprint {
    paths: BTreeSet<String>,
    users: BTreeSet<String>,
    groups: BTreeSet<String>,
}

fn exists(path: &str) -> bool {
    fs::symlink_metadata(path).is_ok()
}

fn known(database: &str, name: &str) -> bool {
    Command::new("getent")
        .args([database, name])
        .output()
        .is_ok_and(|output| output.status.success())
}

pub fn first_missing(path: &str, exists: impl Fn(&str) -> bool) -> Option<String> {
    let mut ancestor = String::new();
    for (depth, part) in path.split('/').filter(|part| !part.is_empty()).enumerate() {
        ancestor.push('/');
        ancestor.push_str(part);
        if depth > 0 && !exists(&ancestor) {
            return Some(ancestor);
        }
    }
    None
}

fn declares(declared: &Declared, root: &str) -> bool {
    declared.paths.iter().any(|path| {
        path == root
            || path
                .strip_prefix(root)
                .is_some_and(|rest| rest.starts_with('/'))
    })
}

fn remove(path: &str) -> Result<()> {
    let removed = match fs::symlink_metadata(path) {
        Ok(metadata) if metadata.is_dir() => fs::remove_dir_all(path),
        Ok(_) => fs::remove_file(path),
        Err(error) => Err(error),
    };
    match removed {
        Err(error) if error.kind() != ErrorKind::NotFound => {
            Err(error).with_context(|| format!("Removing {path}"))
        }
        _ => Ok(()),
    }
}

impl Footprint {
    pub fn load(path: &Path) -> Result<Self> {
        match fs::read(path) {
            Ok(text) => Ok(serde_json::from_slice(&text)?),
            Err(error) if error.kind() == ErrorKind::NotFound => Ok(Self::default()),
            Err(error) => Err(error).with_context(|| format!("Reading {}", path.display())),
        }
    }

    pub fn save(&self, path: &Path) -> Result<()> {
        super::replace(path, &serde_json::to_vec_pretty(self)?)
    }

    pub fn note(&mut self, declared: &Declared) {
        self.paths.extend(
            declared
                .paths
                .iter()
                .filter_map(|path| first_missing(path, exists)),
        );
        self.users.extend(
            declared
                .users
                .iter()
                .filter(|user| !known("passwd", user))
                .cloned(),
        );
        self.groups.extend(
            declared
                .groups
                .iter()
                .filter(|group| !known("group", group))
                .cloned(),
        );
    }

    /// Takes away everything noted that `declared` no longer brings. Every entry is tried, and
    /// those that couldn't be taken away stay noted for the next try.
    pub fn clear(&mut self, declared: &Declared) -> Result<()> {
        let mut failures = Vec::new();
        let leaving: Vec<String> = self.users.difference(&declared.users).cloned().collect();
        for user in &leaving {
            end_processes(user);
        }
        self.paths
            .retain(|path| declares(declared, path) || kept_after(remove(path), &mut failures));
        self.users.retain(|user| {
            declared.users.contains(user)
                || kept_after(delete("passwd", "userdel", user), &mut failures)
        });
        self.groups.retain(|group| {
            declared.groups.contains(group)
                || kept_after(delete("group", "groupdel", group), &mut failures)
        });
        match failures.into_iter().next() {
            Some(error) => Err(error),
            None => Ok(()),
        }
    }
}

fn kept_after(result: Result<()>, failures: &mut Vec<anyhow::Error>) -> bool {
    match result {
        Ok(()) => false,
        Err(error) => {
            failures.push(error);
            true
        }
    }
}

fn delete(database: &str, command: &str, name: &str) -> Result<()> {
    if known(database, name) {
        run(Command::new(command).arg(name))?;
    }
    Ok(())
}

fn running_as(user: &str) -> bool {
    Command::new("pgrep")
        .args(["--uid", user])
        .output()
        .is_ok_and(|output| output.status.success())
}

/// Ends what still runs as a user the packages made, such as libvirt's virtual machines and its
/// network's dnsmasq, which outlive the services that started them.
fn end_processes(user: &str) {
    if !known("passwd", user) {
        return;
    }
    for signal in ["TERM", "KILL"] {
        let _ = Command::new("pkill")
            .args(["--signal", signal, "--uid", user])
            .status();
        for _ in 0..50 {
            if !running_as(user) {
                return;
            }
            std::thread::sleep(Duration::from_millis(200));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn notes_the_outermost_folder_that_was_missing() {
        let present = ["/var/lib", "/etc/default"];
        let exists = |path: &str| present.contains(&path);
        assert_eq!(
            first_missing("/var/lib/libvirt/qemu", exists).as_deref(),
            Some("/var/lib/libvirt")
        );
        assert_eq!(
            first_missing("/etc/default/tailscaled", exists).as_deref(),
            Some("/etc/default/tailscaled")
        );
        assert_eq!(first_missing("/var/lib", exists), None);
    }

    #[test]
    fn keeps_what_a_remaining_package_still_declares() {
        let declared = Declared {
            paths: ["/var/lib/libvirt/qemu".to_owned()].into(),
            ..Declared::default()
        };
        assert!(declares(&declared, "/var/lib/libvirt"));
        assert!(!declares(&declared, "/var/lib/lib"));
        assert!(!declares(&declared, "/var/lib/tailscale"));
    }
}
