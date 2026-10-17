use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::layout::Role;
use super::partition::Created;
use crate::system::command::Tool;

pub struct Mounted {
    root: PathBuf,
    pub root_uuid: String,
    pub esp: String,
}

fn find(parts: &[Created], role: Role) -> Option<&Created> {
    parts.iter().find(|part| part.role == role)
}

fn mount(device: &str, options: &str, at: &Path) -> Result<()> {
    std::fs::create_dir_all(at)?;
    let mut mount = Tool::new("mount");
    if !options.is_empty() {
        mount = mount.args(["-o", options]);
    }
    mount.arg(device).arg(at).run()
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
        .context("The drive has no EFI system partition")
}

impl Mounted {
    pub fn assemble(
        root: &Path,
        drive_device: &str,
        parts: &[Created],
        skipped_esps: &[&str],
    ) -> Result<Self> {
        let system = find(parts, Role::Root).context("No partition for Luft was made")?;
        Self::open(
            &system.device,
            "",
            root,
            &system.uuid,
            first_esp(drive_device, skipped_esps)?,
        )
    }

    pub fn open(
        device: &str,
        options: &str,
        root: &Path,
        root_uuid: &str,
        esp: String,
    ) -> Result<Self> {
        mount(device, options, root)?;
        Ok(Self {
            root: root.to_owned(),
            root_uuid: root_uuid.to_owned(),
            esp,
        })
    }

    pub fn root(&self) -> &Path {
        &self.root
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
