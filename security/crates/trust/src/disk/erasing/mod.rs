mod files;
mod initrd;
mod volumes;

use std::path::Path;

use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};

use super::SystemDisk;
use super::layout::{self, TopLevel};
use super::requests::{self, ERASE};
use crate::errors::Unsupported;
use crate::system::host::blocks;
use crate::system::host::command::Tool;

pub use initrd::erase_at_start;

pub const STAGED: &str = "luft-next-start/erase";
const KEPT: [&str; 2] = ["composefs", "state/deploy"];
const MIB: u64 = 1 << 20;
const SLACK: u64 = 2 << 30;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub partition: String,
}

fn kept_bytes(top: &Path) -> Result<u64> {
    let counted = Tool::new("du")
        .args(["--summarize", "--bytes", "--total"])
        .args(KEPT.map(|folder| top.join(folder)))
        .unhurried()
        .output()?;
    counted
        .lines()
        .last()
        .and_then(|total| total.split_whitespace().next()?.parse().ok())
        .context("Luft's own files couldn't be measured")
}

pub fn request() -> Result<()> {
    let _working = layout::claim()?;
    let disk = SystemDisk::find()?;
    if disk.root.fstype != "btrfs" {
        bail!(Unsupported(
            "This computer can't be erased from here.".to_owned()
        ));
    }
    let top = TopLevel::mount(&disk)?;
    if !top.path().join(STAGED).is_dir() {
        bail!("Nothing was prepared to start this computer with once it's erased");
    }
    let kept = kept_bytes(top.path())?;
    if 2 * (kept + kept / 10 + SLACK) > disk.size() {
        bail!(Unsupported(
            "Luft's drive is too full to be erased from here. Install Luft again from a USB stick to erase it."
                .to_owned()
        ));
    }
    let partition = blocks::partuuid(&disk.partition).context("Luft's partition has no ID")?;
    requests::keep(top.path(), ERASE, &Request { partition })
        .context("The request to erase this computer couldn't be kept")
}
