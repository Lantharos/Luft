use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use std::process::Command;

use anyhow::{Context, Result, bail};
use luft_windows::bluetooth::{self, Pairing, bluez};
use luft_windows::{Installation, Volume, hibernated, is_windows, settled};
use serde::{Deserialize, Serialize};

const NTFS: &str = "ntfs";

#[derive(Deserialize)]
struct Listing {
    blockdevices: Vec<Block>,
}

#[derive(Deserialize)]
struct Block {
    path: String,
    fstype: Option<String>,
    #[serde(rename = "type")]
    kind: String,
    rm: bool,
    label: Option<String>,
    #[serde(default)]
    mountpoints: Vec<Option<String>>,
}

pub struct Partition {
    pub device: String,
    pub label: Option<String>,
    pub mounted: bool,
}

pub fn partitions() -> Result<Vec<Partition>> {
    let output = Command::new("lsblk")
        .args([
            "--json",
            "--list",
            "--paths",
            "--output",
            "PATH,FSTYPE,TYPE,RM,LABEL,MOUNTPOINTS",
        ])
        .output()
        .context("lsblk couldn't be started")?;
    if !output.status.success() {
        bail!(
            "lsblk failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        );
    }
    let listing: Listing = serde_json::from_slice(&output.stdout)?;
    Ok(listing
        .blockdevices
        .into_iter()
        .filter(|block| block.fstype.as_deref() == Some(NTFS) && block.kind == "part" && !block.rm)
        .map(|block| Partition {
            device: block.path,
            label: block.label.filter(|label| !label.is_empty()),
            mounted: block.mountpoints.iter().any(Option::is_some),
        })
        .collect())
}

pub fn open(device: &str) -> Result<Volume<BufReader<File>>> {
    Volume::open(BufReader::new(File::open(device)?))
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Found {
    pub device: String,
    pub version: Option<String>,
    pub hibernated: bool,
    pub mounted: bool,
    pub fast_startup: bool,
    pub universal_clock: bool,
    pub bluetooth: Vec<Pairing>,
}

impl Found {
    pub fn changeable(&self) -> Result<()> {
        if self.mounted {
            bail!("Windows' drive is open in Luft. Close it in Rover first");
        }
        if self.hibernated {
            bail!(
                "Windows is hibernated or was shut down with Fast Startup. Start Windows and hold Shift while you choose Shut down, then try again"
            );
        }
        Ok(())
    }
}

#[derive(Serialize)]
pub struct Drive {
    pub device: String,
    pub label: Option<String>,
    pub hibernated: bool,
    pub mounted: bool,
}

pub fn drives() -> Vec<Drive> {
    let Ok(partitions) = partitions() else {
        return Vec::new();
    };
    partitions
        .into_iter()
        .filter_map(|partition| {
            let mut volume = open(&partition.device).ok()?;
            is_windows(&mut volume).ok()?.then_some(())?;
            Some(Drive {
                hibernated: hibernated(&mut volume).ok()?,
                device: partition.device,
                label: partition.label,
                mounted: partition.mounted,
            })
        })
        .collect()
}

fn inspect(partition: &Partition) -> Result<Option<Found>> {
    let mut volume = open(&partition.device)?;
    let Some(installation) = Installation::read(&mut volume)? else {
        return Ok(None);
    };
    let system = installation.system()?;
    let bluetooth = if settled(&installation.system_hive) && !installation.hibernated {
        let pairings = bluetooth::pairings(&system)?;
        bluez::waiting(Path::new(bluez::STORAGE), &pairings)
            .into_iter()
            .cloned()
            .collect()
    } else {
        Vec::new()
    };
    Ok(Some(Found {
        device: partition.device.clone(),
        fast_startup: system.fast_startup()?,
        universal_clock: system.universal_clock()?,
        version: installation.version.clone(),
        hibernated: installation.hibernated,
        mounted: partition.mounted,
        bluetooth,
    }))
}

pub fn survey() -> Result<Vec<Found>> {
    Ok(partitions()?
        .iter()
        .filter_map(|partition| {
            inspect(partition)
                .inspect_err(|error| {
                    eprintln!("Couldn't look into {}: {error:#}", partition.device)
                })
                .ok()
                .flatten()
        })
        .collect())
}
