use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_i18n::t;

use super::encryption::{Encryption, Opened};
use super::layout::Role;
use super::partition::Created;
use crate::L10N;
use crate::system::command::Tool;

pub struct Mounted {
    root: PathBuf,
    pub root_uuid: String,
    pub esp: String,
    encrypted: Option<Opened>,
}

fn find(parts: &[Created], role: Role) -> Option<&Created> {
    parts.iter().find(|part| part.role == role)
}

const ROOT_OPTIONS: &str = "compress=zstd:1,noatime";

fn mount_root(device: &str, options: &str, at: &Path) -> Result<()> {
    std::fs::create_dir_all(at)?;
    let options = match options {
        "" => ROOT_OPTIONS.to_owned(),
        options => format!("{options},{ROOT_OPTIONS}"),
    };
    Tool::new("mount")
        .args(["-o", &options])
        .arg(device)
        .arg(at)
        .run()
}

fn first_esp(drive_device: &str, skipped: &[&str]) -> Result<String> {
    let listing = Tool::new("lsblk")
        .args([
            "--list",
            "--noheadings",
            "--paths",
            "--output",
            "PATH,PARTTYPE,PARTUUID",
        ])
        .arg(drive_device)
        .output()?;
    listing
        .lines()
        .map(|line| line.split_whitespace().collect::<Vec<_>>())
        .find(|fields| {
            fields
                .get(1)
                .is_some_and(|kind| kind.eq_ignore_ascii_case(super::layout::ESP_TYPE))
                && !fields.get(2).is_some_and(|partition| {
                    skipped
                        .iter()
                        .any(|skip| skip.eq_ignore_ascii_case(partition))
                })
        })
        .map(|fields| fields[0].to_owned())
        .with_context(|| t!(L10N, "installer-no-esp"))
}

impl Mounted {
    pub fn assemble(
        root: &Path,
        drive_device: &str,
        parts: &[Created],
        skipped_esps: &[&str],
        encryption: Option<&Encryption>,
    ) -> Result<Self> {
        let system = find(parts, Role::Root).with_context(|| t!(L10N, "installer-no-root"))?;
        let esp = first_esp(drive_device, skipped_esps)?;
        match encryption {
            Some(encryption) => Self::open_encrypted(encryption.open(&system.device)?, root, esp),
            None => Self::open(&system.device, "", root, &system.uuid, esp),
        }
    }

    pub fn open_encrypted(opened: Opened, root: &Path, esp: String) -> Result<Self> {
        mount_root(&opened.device, "", root)?;
        Ok(Self {
            root: root.to_owned(),
            root_uuid: opened.uuid.clone(),
            esp,
            encrypted: Some(opened),
        })
    }

    pub fn open(
        device: &str,
        options: &str,
        root: &Path,
        root_uuid: &str,
        esp: String,
    ) -> Result<Self> {
        mount_root(device, options, root)?;
        Ok(Self {
            root: root.to_owned(),
            root_uuid: root_uuid.to_owned(),
            esp,
            encrypted: None,
        })
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    pub fn encrypted(&self) -> Option<&Opened> {
        self.encrypted.as_ref()
    }

    pub fn finish(self) -> Result<()> {
        Tool::new("fstrim")
            .arg("--quiet-unsupported")
            .arg(&self.root)
            .run()
    }
}

impl Drop for Mounted {
    fn drop(&mut self) {
        if let Err(error) = Tool::new("umount").arg("--recursive").arg(&self.root).run() {
            eprintln!("The new system couldn't be unmounted: {error:#}");
        }
    }
}
