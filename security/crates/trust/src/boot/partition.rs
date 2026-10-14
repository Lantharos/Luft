use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::esp::Esp;
use crate::paths;
use crate::system::blocks;
use crate::system::command::Tool;

const XBOOTLDR_TYPE: &str = "bc13c2ff-59e6-4262-a352-b275fd6f7172";
const MOUNTS: [&str; 2] = ["/boot", "/efi"];
const PRIVATE_MOUNT: &str = "xbootldr";

pub struct BootPartition {
    pub path: PathBuf,
    pub uuid: String,
    mounted_here: bool,
}

fn xbootldr_on(disk: &str) -> Option<String> {
    blocks::partitions_of(disk)
        .into_iter()
        .find(|name| blocks::partition_type(name).as_deref() == Some(XBOOTLDR_TYPE))
}

fn mounted(name: &str) -> Option<PathBuf> {
    MOUNTS
        .iter()
        .map(Path::new)
        .find(|path| {
            blocks::mount_at(&path.to_string_lossy())
                .and_then(|mount| blocks::kernel_name(&mount.source))
                .is_some_and(|source| source == name)
        })
        .map(Path::to_owned)
}

fn uuid(name: &str) -> Result<String> {
    blocks::fs_uuid(name).with_context(|| format!("{name} has no file system."))
}

fn mount(name: &str) -> Result<BootPartition> {
    let uuid = uuid(name)?;
    if let Some(path) = mounted(name) {
        return Ok(BootPartition {
            path,
            uuid,
            mounted_here: false,
        });
    }
    let path = Path::new(paths::RUNTIME).join(PRIVATE_MOUNT);
    paths::ensure_private(&path.to_string_lossy())?;
    Tool::new("mount")
        .arg(blocks::device(name))
        .arg(&path)
        .status()?;
    Ok(BootPartition {
        path,
        uuid,
        mounted_here: true,
    })
}

pub fn next_to(esp: &Esp) -> Result<BootPartition> {
    match xbootldr_on(&esp.disk) {
        Some(name) => mount(&name),
        None => Ok(BootPartition {
            path: esp.path.clone(),
            uuid: uuid(&esp.name)?,
            mounted_here: false,
        }),
    }
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
