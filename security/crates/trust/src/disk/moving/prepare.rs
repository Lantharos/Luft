use std::path::Path;

use anyhow::{Context, Result, bail, ensure};
use luft_disks::moving::layout::{
    ESP_TYPE, Planned, ROOT_TYPE, Span, Startup, XBOOTLDR_TYPE, whole_drive, within,
};
use luft_disks::moving::{self, startup_for};
use luft_disks::udisks::snapshot::{self, Drive, PartitionTable};
use luft_disks::udisks::volumes::{Segment, Volume};
use luft_disks::udisks::{self, BLOCK, TABLE, no_options};

use super::request::{Request, Stage, Target};
use super::{Needs, retire};
use crate::boot::other_systems;
use crate::disk::SystemDisk;
use crate::disk::unlock::luks;
use crate::errors::Unsupported;
use crate::system::host::command::Tool;
use crate::system::host::{blocks, uuid, wait};

const ESP_NAME: &str = "EFI system partition";
const STARTUP_NAME: &str = "Luft startup";
const ROOT_NAME: &str = "Luft";

pub enum Place {
    Free(Span),
    Erase,
}

fn drives() -> Result<Vec<Drive>> {
    Ok(snapshot::build(&wait(udisks::objects()).map_err(anyhow::Error::msg)?).drives)
}

fn drive(id: &str) -> Result<Drive> {
    drives()?
        .into_iter()
        .find(|drive| drive.id == id)
        .with_context(|| Unsupported("That drive isn't there anymore.".to_owned()))
}

fn volumes(drive: &Drive) -> impl Iterator<Item = &Volume> {
    drive.segments.iter().filter_map(|segment| match segment {
        Segment::Volume(volume) => Some(volume.as_ref()),
        Segment::Free { .. } => None,
    })
}

fn at(drive: &Drive, offset: u64) -> Option<&Volume> {
    volumes(drive).find(|volume| volume.offset == offset)
}

fn typed(volume: &Volume, kind: &str) -> bool {
    volume
        .partition_type
        .as_deref()
        .is_some_and(|own| own.eq_ignore_ascii_case(kind))
}

fn refuse(message: String) -> anyhow::Error {
    Unsupported(message).into()
}

fn check_drive(drive: &Drive) -> Result<()> {
    if drive.system {
        bail!(refuse("Luft is already on this drive.".to_owned()));
    }
    if drive.removable || drive.read_only {
        bail!(refuse(format!(
            "Luft can't move to {}. Pick a drive inside the computer.",
            drive.name
        )));
    }
    Ok(())
}

fn check_erasable(drive: &Drive) -> Result<()> {
    if let Some(volume) = volumes(drive).find(|volume| volume.in_use_by_system()) {
        bail!(refuse(format!(
            "{} is in use, so {} can't be erased right now.",
            moving::name_of(volume),
            drive.name
        )));
    }
    let partitions: Vec<String> = volumes(drive)
        .map(|volume| volume.partition_uuid.to_lowercase())
        .collect();
    let starts_another_system = other_systems::list()?.into_iter().any(|startup| {
        partitions.contains(&startup.esp)
            || startup
                .partitions
                .iter()
                .any(|partition| partitions.contains(partition))
    });
    if starts_another_system {
        bail!(refuse(format!(
            "Another system starts from {}, so it can't be erased for Luft. Make room next to it instead.",
            drive.name
        )));
    }
    Ok(())
}

fn erase(drive: &Drive) -> Result<Drive> {
    check_erasable(drive)?;
    for volume in volumes(drive).filter(|volume| volume.encryption.is_some()) {
        retire(Path::new(&volume.device));
    }
    wait(udisks::run(
        &drive.block,
        BLOCK,
        "Format",
        &("gpt", no_options()),
    ))
    .map_err(anyhow::Error::msg)
    .with_context(|| format!("{} couldn't be erased", drive.name))?;
    self::drive(&drive.id)
}

fn region(drive: &Drive, place: &Place) -> Result<Span> {
    match place {
        Place::Erase => Ok(whole_drive(drive.size)),
        Place::Free(span) => {
            let table = match drive.table {
                Some(PartitionTable::Gpt) => None,
                Some(PartitionTable::Dos) => Some("an MBR partition table"),
                None => Some("no partition table"),
            };
            if let Some(table) = table {
                bail!(refuse(format!(
                    "{} has {table}, so Luft can only move there by erasing it.",
                    drive.name
                )));
            }
            let free = drive.segments.iter().any(|segment| {
                matches!(segment, Segment::Free { offset, size }
                    if *offset <= span.offset && span.end() <= offset + size)
            });
            ensure!(free, refuse("That space isn't free anymore.".to_owned()));
            Ok(*span)
        }
    }
}

fn create(drive: &Drive, span: Span, kind: &str, name: &str) -> Result<()> {
    wait(udisks::created(
        &drive.block,
        TABLE,
        "CreatePartition",
        &(span.offset, span.size, kind, name, no_options()),
    ))
    .map_err(anyhow::Error::msg)
    .with_context(|| format!("A partition couldn't be made on {}", drive.name))
    .map(drop)
}

fn partuuid(drive: &Drive, span: Span) -> Result<String> {
    at(drive, span.offset)
        .map(|volume| volume.partition_uuid.to_lowercase())
        .filter(|partuuid| !partuuid.is_empty())
        .context("A new partition has no partition GUID")
}

fn format_boot(device: &str, label: &str) -> Result<()> {
    Tool::new("mkfs.vfat")
        .args(["-F", "32", "-n", label])
        .arg(device)
        .status()
        .context("Luft's startup partition couldn't be formatted")
}

fn device(drive: &Drive, partuuid: &str) -> Result<String> {
    volumes(drive)
        .find(|volume| volume.partition_uuid.eq_ignore_ascii_case(partuuid))
        .map(|volume| volume.device.clone())
        .context("A new partition disappeared")
}

fn lay_out(drive: &Drive, planned: Planned, disk: &SystemDisk) -> Result<Target> {
    let mut made = Vec::new();
    for (span, kind, name) in [
        (planned.esp, ESP_TYPE, ESP_NAME),
        (planned.startup, XBOOTLDR_TYPE, STARTUP_NAME),
        (Some(planned.root), ROOT_TYPE, ROOT_NAME),
    ] {
        let Some(span) = span else { continue };
        create(drive, span, kind, name)?;
        made.push(partuuid(&self::drive(&drive.id)?, span)?);
    }
    let drive = self::drive(&drive.id)?;
    let root = partuuid(&drive, planned.root)?;
    let esp = match planned.esp {
        Some(span) => partuuid(&drive, span)?,
        None => volumes(&drive)
            .find(|volume| typed(volume, ESP_TYPE))
            .map(|esp| esp.partition_uuid.to_lowercase())
            .context("The drive's EFI system partition is gone")?,
    };
    let startup = planned
        .startup
        .map(|span| partuuid(&drive, span))
        .transpose()?;
    if planned.esp.is_some() {
        format_boot(&device(&drive, &esp)?, "EFI")?;
    }
    if let Some(startup) = &startup {
        format_boot(&device(&drive, startup)?, "LUFT-BOOT")?;
    }
    let root_device = device(&drive, &root)?;
    Tool::new("wipefs")
        .arg("--all")
        .arg(&root_device)
        .status()?;
    if disk.mapping.is_some() {
        luks::copy_header(&disk.device(), Path::new(&root_device))
            .context("The encryption couldn't be copied to the new drive")?;
    }
    Ok(Target {
        drive: drive.id.clone(),
        name: drive.name.clone(),
        root,
        esp,
        startup,
        made,
    })
}

pub fn prepare(drive_id: &str, place: Place, needs: Needs) -> Result<()> {
    let disk = SystemDisk::find()?;
    let from = blocks::partuuid(&disk.partition).context("Luft's partition has no GUID")?;
    let mut drive = drive(drive_id)?;
    check_drive(&drive)?;
    let region = region(&drive, &place)?;
    let startup = match place {
        Place::Erase => Startup::NewEsp,
        Place::Free(_) => startup_for(&drive),
    };
    let planned = within(region, startup);
    ensure!(
        planned.root.size >= needs.luft,
        refuse(format!(
            "Luft needs {} GB there, and that space only leaves it {} GB.",
            needs.luft.div_ceil(1 << 30),
            planned.root.size >> 30
        ))
    );
    if matches!(place, Place::Erase) {
        drive = erase(&drive)?;
    }
    let target = match lay_out(&drive, planned, &disk) {
        Ok(target) => target,
        Err(error) => {
            remove_made(&drive.id, &made_at(&drive.id, planned));
            return Err(error);
        }
    };
    Request {
        stage: Stage::Waiting,
        from,
        to: target,
        filesystem: uuid::random()?,
        encrypted: disk.mapping.is_some(),
        reason: String::new(),
    }
    .save()
}

fn made_at(drive_id: &str, planned: Planned) -> Vec<String> {
    let Ok(drive) = drive(drive_id) else {
        return Vec::new();
    };
    [planned.esp, planned.startup, Some(planned.root)]
        .into_iter()
        .flatten()
        .filter_map(|span| partuuid(&drive, span).ok())
        .collect()
}

pub fn remove_made(drive_id: &str, made: &[String]) {
    let Ok(drive) = drive(drive_id) else {
        return;
    };
    for volume in volumes(&drive).filter(|volume| {
        made.iter()
            .any(|partuuid| volume.partition_uuid.eq_ignore_ascii_case(partuuid))
    }) {
        if typed(volume, ROOT_TYPE) {
            retire(Path::new(&volume.device));
        }
        if let Err(error) = wait(luft_disks::partitions::delete(&volume.block)) {
            eprintln!("{} couldn't be removed: {error}", volume.device);
        }
    }
}
