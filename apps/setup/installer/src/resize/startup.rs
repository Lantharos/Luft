use std::path::Path;

use anyhow::{Context, Result};
use luft_meet::resize::STARTUP_TYPE;

use super::disk::{self, Disk};
use super::plan::Span;
use crate::system::command::Tool;
use crate::system::mount::Mounted;

const NAME: &str = "Luft startup";
const SCRATCH: &str = "/run/luft-installer/resize";

pub fn copy(disk: &Disk, from: Span, to: Span) -> Result<()> {
    let Some(old) = disk.at(from.offset) else {
        return Ok(());
    };
    if disk.at(to.offset).is_none() {
        disk.create(to, STARTUP_TYPE, NAME)?;
    }
    let disk = disk::read(&disk.id)?;
    let new = disk
        .at(to.offset)
        .context("Luft's new startup partition disappeared")?;
    let mut format = Tool::new("mkfs.vfat").args(["-F", "32", "-i", &old.fs_uuid.replace('-', "")]);
    if !old.label.is_empty() {
        format = format.args(["-n", &old.label]);
    }
    format
        .arg(&new.device)
        .run()
        .context("Luft's new startup partition couldn't be formatted")?;
    let scratch = Path::new(SCRATCH);
    let source = Mounted::new(&old.device, "", &scratch.join("from"))?;
    let target = Mounted::new(&new.device, "", &scratch.join("to"))?;
    Tool::new("cp")
        .args(["--recursive", "--preserve=timestamps", "--"])
        .arg(source.path().join("."))
        .arg(target.path())
        .run()
        .context("Luft's startup files couldn't be copied")?;
    Tool::new("sync")
        .arg("--file-system")
        .arg(target.path())
        .run()
}
