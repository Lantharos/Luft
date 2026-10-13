use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::layout::Role;
use super::partition::Created;
use crate::system::command::Tool;

pub struct Mounted {
    root: PathBuf,
    pub root_uuid: String,
    pub boot_uuid: String,
}

fn find(parts: &[Created], role: Role) -> Option<&Created> {
    parts.iter().find(|part| part.role == role)
}

fn mount(device: &str, at: &Path) -> Result<()> {
    std::fs::create_dir_all(at)?;
    Tool::new("mount").arg(device).arg(at).run()
}

fn shared_esp(drive_device: &str) -> Result<String> {
    let listing = Tool::new("lsblk")
        .args([
            "--list",
            "--noheadings",
            "--paths",
            "--output",
            "PATH,PARTTYPE",
        ])
        .arg(drive_device)
        .output()?;
    listing
        .lines()
        .filter_map(|line| line.split_once(' '))
        .find(|(_, kind)| kind.trim().eq_ignore_ascii_case(super::layout::ESP_TYPE))
        .map(|(path, _)| path.to_owned())
        .context("The drive has no EFI system partition")
}

impl Mounted {
    pub fn assemble(root: &Path, drive_device: &str, parts: &[Created]) -> Result<Self> {
        let system = find(parts, Role::Root).context("No partition for Luft was made")?;
        let boot = find(parts, Role::Boot).context("No boot partition was made")?;
        let esp = match find(parts, Role::Esp) {
            Some(esp) => esp.device.clone(),
            None => shared_esp(drive_device)?,
        };
        mount(&system.device, root)?;
        let mounted = Self {
            root: root.to_owned(),
            root_uuid: system.uuid.clone(),
            boot_uuid: boot.uuid.clone(),
        };
        mount(&boot.device, &root.join("boot"))?;
        mount(&esp, &root.join("boot/efi"))?;
        Ok(mounted)
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    pub fn finish(self) -> Result<()> {
        for path in [self.root.clone(), self.root.join("boot")] {
            Tool::new("fstrim").arg("--quiet-unsupported").arg(path).run()?;
        }
        Ok(())
    }
}

impl Drop for Mounted {
    fn drop(&mut self) {
        if let Err(error) = Tool::new("umount").arg("--recursive").arg(&self.root).run() {
            eprintln!("The new system couldn't be unmounted: {error:#}");
        }
    }
}
