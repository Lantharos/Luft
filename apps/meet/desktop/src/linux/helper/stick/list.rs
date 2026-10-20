use std::fs::File;
use std::path::Path;
use std::process::Command;

use luft_i18n::t;

use super::super::disks;
use crate::L10N;
use crate::stick::drives::Stick;
use crate::stick::drives::linux::{self, Block, COLUMNS, Listing};
use crate::stick::gone;
use crate::stick::table::Slot;
use crate::stick::ventoy;

const SECTOR: u64 = 512;

pub fn blocks() -> Result<Vec<Block>, String> {
    let output = Command::new("lsblk")
        .env("LC_ALL", "C.UTF-8")
        .args(["--json", "--bytes", "--output", COLUMNS])
        .output()
        .map_err(|error| t!(L10N, "drive-list-failed", error = error.to_string()))?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_owned());
    }
    serde_json::from_slice::<Listing>(&output.stdout)
        .map(|listing| listing.blockdevices)
        .map_err(|error| t!(L10N, "drive-list-failed", error = error.to_string()))
}

pub fn holding(blocks: &[Block], file: &Path) -> Option<String> {
    let source = disks::mount_of(file).ok()?.source;
    blocks
        .iter()
        .find(|disk| {
            disk.path == source || disk.descendants().iter().any(|block| block.path == source)
        })
        .map(|disk| disk.name.clone())
}

pub fn sector(block: &Block) -> u64 {
    if block.sector == 0 {
        SECTOR
    } else {
        block.sector
    }
}

pub fn ventoy_data(block: &Block) -> Option<Slot> {
    let mut disk = File::open(&block.path).ok()?;
    ventoy::data_partition(&mut disk, sector(block))
        .ok()
        .flatten()
}

pub fn sticks(iso: Option<&Path>) -> Result<Vec<Stick>, String> {
    let blocks = blocks()?;
    let holding = iso.and_then(|iso| holding(&blocks, iso));
    Ok(linux::sticks(&blocks, holding.as_deref())
        .into_iter()
        .map(|block| block.describe(ventoy_data(block).is_some()))
        .collect())
}

pub fn find(id: &str, iso: Option<&Path>) -> Result<Block, String> {
    let blocks = blocks()?;
    let holding = iso.and_then(|iso| holding(&blocks, iso));
    linux::sticks(&blocks, holding.as_deref())
        .into_iter()
        .find(|block| block.id() == id)
        .cloned()
        .ok_or_else(gone)
}

pub fn fresh(path: &str) -> Result<Block, String> {
    blocks()?
        .into_iter()
        .find(|block| block.path == path)
        .ok_or_else(gone)
}
