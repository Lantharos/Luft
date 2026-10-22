use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_meet::resize::STARTUP_TYPE;

use super::drive::{self, Disk};
use crate::disk::layout::plan::Span;
use crate::paths;
use crate::system::host::blocks;
use crate::system::host::command::Tool;

const NAME: &str = "Luft startup";
const SCRATCH: &str = "/run/trustd/startup";

struct Mounted {
    at: PathBuf,
}

impl Mounted {
    fn new(device: &str, at: PathBuf) -> Result<Self> {
        paths::ensure_private(&at)?;
        blocks::mount_boot_partition(Path::new(device), &at, false)?;
        Ok(Self { at })
    }
}

impl Drop for Mounted {
    fn drop(&mut self) {
        let _ = Tool::new("umount").arg(&self.at).status();
    }
}

pub fn copy(disk: &Disk, from: Span, to: Span) -> Result<()> {
    let Some(old) = disk.at(from.offset) else {
        return Ok(());
    };
    if disk.at(to.offset).is_none() {
        disk.create(to, STARTUP_TYPE, NAME)?;
    }
    let disk = drive::read(&disk.id)?;
    let new = disk
        .at(to.offset)
        .context("Luft's new startup partition disappeared")?;
    let mut format = Tool::new("mkfs.vfat").args(["-F", "32", "-i", &old.fs_uuid.replace('-', "")]);
    if !old.label.is_empty() {
        format = format.args(["-n", &old.label]);
    }
    format
        .arg(&new.device)
        .status()
        .context("Luft's new startup partition couldn't be formatted")?;
    let scratch = Path::new(SCRATCH);
    let source = Mounted::new(&old.device, scratch.join("from"))?;
    let target = Mounted::new(&new.device, scratch.join("to"))?;
    Tool::new("cp")
        .args(["--recursive", "--preserve=timestamps", "--"])
        .arg(source.at.join("."))
        .arg(&target.at)
        .status()
        .context("Luft's startup files couldn't be copied")?;
    Tool::new("sync")
        .arg("--file-system")
        .arg(&target.at)
        .status()
}
