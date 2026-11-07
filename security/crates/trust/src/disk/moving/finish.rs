use std::path::Path;

use anyhow::{Context, Result};
use luft_disks::moving::layout::{ESP_TYPE, XBOOTLDR_TYPE};
use serde::{Deserialize, Serialize};

use super::boot_files::{self, Mounted};
use super::earlier::Earlier;
use super::prepare::remove_made;
use super::request::{Request, Stage};
use crate::boot::{entry, esp, startup};
use crate::disk::SystemDisk;
use crate::paths;
use crate::system::host::blocks;

const FAILED: &str = "move-failed.json";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Failure {
    pub drive: String,
    pub reason: String,
}

impl Failure {
    pub fn load() -> Option<Self> {
        serde_json::from_slice(&std::fs::read(paths::state(FAILED)).ok()?).ok()
    }

    fn save(&self) -> Result<()> {
        paths::ensure_private(paths::STATE)?;
        paths::write_private(&paths::state(FAILED), &serde_json::to_vec(self)?)?;
        Ok(())
    }

    pub fn forget() {
        let _ = std::fs::remove_file(paths::state(FAILED));
    }
}

fn running_from() -> Option<String> {
    blocks::partuuid(&SystemDisk::find().ok()?.partition)
}

fn partuuid_on(disk: &str, kind: &str) -> Option<String> {
    esp::on_disk(disk, kind).and_then(|name| blocks::partuuid(&name))
}

fn drive_name(partition: &str) -> String {
    let Ok(objects) = crate::system::host::wait(luft_disks::udisks::objects()) else {
        return String::new();
    };
    luft_disks::udisks::snapshot::build(&objects)
        .drives
        .into_iter()
        .find(|drive| {
            drive.segments.iter().any(|segment| {
                matches!(segment, luft_disks::udisks::volumes::Segment::Volume(volume)
                    if volume.partition_uuid.eq_ignore_ascii_case(partition))
            })
        })
        .map(|drive| drive.name)
        .unwrap_or_default()
}

fn remember_earlier(request: &Request) -> Result<()> {
    let root = Path::new("/dev/disk/by-partuuid").join(&request.from);
    let name = blocks::kernel_name(&root).context("Luft's earlier copy is gone")?;
    let disk = blocks::disk_of(&name).context("Luft's earlier copy isn't on a disk")?;
    let esp =
        partuuid_on(&disk, ESP_TYPE).context("The earlier drive has no EFI system partition")?;
    let startup = partuuid_on(&disk, XBOOTLDR_TYPE);
    let esp_only_luft = boot_files::only_luft(&Mounted::partuuid(&esp, "earlier-esp")?);
    let size = blocks::size_bytes(&name)
        + startup.as_deref().map_or(0, |startup| {
            blocks::kernel_name(&Path::new("/dev/disk/by-partuuid").join(startup))
                .map_or(0, |name| blocks::size_bytes(&name))
        });
    Earlier {
        drive: drive_name(&request.from),
        root: request.from.clone(),
        startup,
        esp,
        esp_only_luft,
        size,
    }
    .save()
}

pub fn confirmed() -> Result<bool> {
    let Some(request) = Request::load() else {
        return Ok(false);
    };
    if running_from().as_deref() != Some(request.to.root.as_str()) {
        return Ok(false);
    }
    if let Err(error) = remember_earlier(&request) {
        eprintln!("Luft's earlier copy can't be offered for removal: {error:#}");
    }
    let esp = esp::find()?;
    let partuuid = blocks::partuuid(&esp.name).context("The EFI system partition has no GUID")?;
    boot_files::forget_entries_elsewhere(&partuuid)?;
    entry::remove(&boot_files::trial_label(&request.to.name))?;
    startup::place(&esp)?;
    Failure::forget();
    Request::forget()?;
    eprintln!("Luft now starts from {}", request.to.name);
    Ok(true)
}

fn roll_back(request: &Request) -> Result<()> {
    entry::remove(&boot_files::trial_label(&request.to.name))?;
    if !request.to.made.contains(&request.to.esp) {
        let esp = Mounted::partuuid(&request.to.esp, "new-esp")?;
        boot_files::clear(&esp, None);
    }
    remove_made(&request.to.drive, &request.to.made);
    let reason = match request.stage {
        Stage::Failed => request.reason.clone(),
        _ => format!(
            "Luft didn't finish starting from {}, so it stayed where it was.",
            request.to.name
        ),
    };
    Failure {
        drive: request.to.name.clone(),
        reason,
    }
    .save()?;
    Request::forget()
}

pub fn at_start() -> Result<()> {
    let Some(request) = Request::load() else {
        return Ok(());
    };
    if request.stage != Stage::Waiting && running_from().as_deref() == Some(request.from.as_str()) {
        eprintln!(
            "Luft didn't move to {}, so it takes back what it made there",
            request.to.name
        );
        return roll_back(&request);
    }
    Ok(())
}

pub fn cancel() -> Result<()> {
    let Some(request) = Request::load().filter(|request| request.stage == Stage::Waiting) else {
        return Ok(());
    };
    remove_made(&request.to.drive, &request.to.made);
    Request::forget()
}
