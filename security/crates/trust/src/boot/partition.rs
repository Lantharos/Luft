use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::esp::{self, Esp, XBOOTLDR_TYPE};
use crate::paths;
use crate::system::blocks;
use crate::system::command::Tool;

const PRIVATE_MOUNT: &str = "xbootldr";
const ENTRIES: &str = "loader/entries";

pub struct BootPartition {
    pub path: PathBuf,
    pub uuid: String,
    mounted_here: bool,
}

fn uuid(name: &str) -> Result<String> {
    blocks::fs_uuid(name).with_context(|| format!("{name} has no file system."))
}

fn mount(name: &str) -> Result<BootPartition> {
    let uuid = uuid(name)?;
    if let Some(path) = esp::mounted(name) {
        return Ok(BootPartition {
            path,
            uuid,
            mounted_here: false,
        });
    }
    let path = Path::new(paths::RUNTIME).join(PRIVATE_MOUNT);
    paths::ensure_private(&path.to_string_lossy())?;
    blocks::mount_boot_partition(&blocks::device(name), &path, false)?;
    Ok(BootPartition {
        path,
        uuid,
        mounted_here: true,
    })
}

fn booted_system() -> Option<String> {
    std::fs::read_to_string("/proc/cmdline")
        .ok()?
        .split_whitespace()
        .find_map(|argument| argument.strip_prefix("composefs="))
        .map(str::to_owned)
}

fn holds_entry_for(boot: &BootPartition, system: &str) -> bool {
    std::fs::read_dir(boot.file(ENTRIES))
        .into_iter()
        .flatten()
        .flatten()
        .any(|entry| std::fs::read_to_string(entry.path()).is_ok_and(|text| text.contains(system)))
}

pub fn next_to(esp: &Esp) -> Result<BootPartition> {
    if let Some(name) = esp::on_disk(&esp.disk, XBOOTLDR_TYPE) {
        let xbootldr = mount(&name)?;
        if booted_system().is_none_or(|system| holds_entry_for(&xbootldr, &system)) {
            return Ok(xbootldr);
        }
    }
    Ok(BootPartition {
        path: esp.path.clone(),
        uuid: uuid(&esp.name)?,
        mounted_here: false,
    })
}

impl BootPartition {
    pub fn file(&self, relative: &str) -> PathBuf {
        self.path.join(relative)
    }
}

impl Drop for BootPartition {
    fn drop(&mut self) {
        if self.mounted_here {
            let _ = Tool::new("umount").arg(&self.path).status();
        }
    }
}
