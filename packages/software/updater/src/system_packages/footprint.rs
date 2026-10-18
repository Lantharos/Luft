use std::collections::BTreeSet;
use std::fs;
use std::io::ErrorKind;
use std::path::Path;
use std::process::Command;

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

    /// Takes away everything noted that `declared` no longer brings.
    pub fn clear(&mut self, declared: &Declared) -> Result<()> {
        for path in self.paths.clone() {
            if !declares(declared, &path) {
                remove(&path)?;
                self.paths.remove(&path);
            }
        }
        for user in self.users.clone() {
            if !declared.users.contains(&user) {
                if known("passwd", &user) {
                    run(Command::new("userdel").arg(&user))?;
                }
                self.users.remove(&user);
            }
        }
        for group in self.groups.clone() {
            if !declared.groups.contains(&group) {
                if known("group", &group) {
                    run(Command::new("groupdel").arg(&group))?;
                }
                self.groups.remove(&group);
            }
        }
        Ok(())
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
