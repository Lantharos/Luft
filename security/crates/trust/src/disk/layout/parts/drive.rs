use std::path::Path;

use anyhow::{Context, Result};
use luft_disks::mounting;
use luft_disks::udisks::snapshot::{self, Drive};
use luft_disks::udisks::volumes::{Segment, Volume};
use luft_disks::udisks::{self, PARTITION, TABLE, no_options};

use crate::disk::SystemDisk;
use crate::disk::layout::plan::Span;
use crate::system::host::wait;

const STARTUP_FILESYSTEM: &str = "vfat";

pub struct Part {
    pub span: Span,
    pub block: String,
    pub device: String,
    pub kind: String,
    pub label: String,
    pub fs_uuid: String,
    pub uuid: String,
    pub filesystem: String,
    pub luks_uuid: Option<String>,
    pub mapped: Option<String>,
}

pub struct Disk {
    pub id: String,
    pub table: String,
    pub parts: Vec<Part>,
    pub free: Vec<Span>,
}

fn canonical(device: &str) -> String {
    std::fs::canonicalize(device)
        .map_or_else(|_| device.to_owned(), |path| path.display().to_string())
}

fn part(volume: &Volume) -> Part {
    let cleartext = volume
        .encryption
        .as_ref()
        .and_then(|encryption| encryption.cleartext.as_deref());
    let contents = cleartext.unwrap_or(volume);
    Part {
        span: Span {
            offset: volume.offset,
            size: volume.size,
        },
        block: volume.block.clone(),
        device: canonical(&volume.device),
        kind: volume
            .partition_type
            .clone()
            .unwrap_or_default()
            .to_ascii_lowercase(),
        label: contents.label.clone(),
        fs_uuid: contents.uuid.clone(),
        uuid: volume.partition_uuid.to_ascii_lowercase(),
        filesystem: contents.fs_type.clone(),
        luks_uuid: volume.encryption.is_some().then(|| volume.uuid.clone()),
        mapped: cleartext.map(|cleartext| canonical(&cleartext.device)),
    }
}

fn describe(drive: &Drive) -> Disk {
    let mut parts = Vec::new();
    let mut free = Vec::new();
    for segment in &drive.segments {
        match segment {
            Segment::Volume(volume) => parts.push(part(volume)),
            Segment::Free { offset, size } => free.push(Span {
                offset: *offset,
                size: *size,
            }),
        }
    }
    Disk {
        id: drive.id.clone(),
        table: drive.block.clone(),
        parts,
        free,
    }
}

fn drives() -> Result<Vec<Drive>> {
    let objects = wait(udisks::objects()).map_err(anyhow::Error::msg)?;
    Ok(snapshot::build(&objects).drives)
}

pub fn mapper_name(device: &str) -> Result<String> {
    let name = Path::new(device)
        .file_name()
        .and_then(|name| name.to_str())
        .context("An open disk has no name")?;
    let mapped = std::fs::read_to_string(format!("/sys/class/block/{name}/dm/name"))
        .with_context(|| format!("{device} isn't an open disk"))?;
    Ok(mapped.trim().to_owned())
}

pub fn system_partition() -> Result<String> {
    Ok(SystemDisk::find()?.device().display().to_string())
}

pub fn holding(device: &str) -> Result<Disk> {
    drives()?
        .iter()
        .map(describe)
        .find(|disk| disk.parts.iter().any(|part| part.device == device))
        .context("Luft's partition isn't on any drive")
}

pub fn read(id: &str) -> Result<Disk> {
    drives()?
        .iter()
        .find(|drive| drive.id == id)
        .map(describe)
        .with_context(|| format!("The drive {id} is gone"))
}

impl Disk {
    pub fn at(&self, offset: u64) -> Option<&Part> {
        self.parts.iter().find(|part| part.span.offset == offset)
    }

    pub fn holding(&self, device: &str) -> Option<&Part> {
        self.parts.iter().find(|part| part.device == device)
    }

    pub fn before(&self, offset: u64) -> Option<&Part> {
        self.parts.iter().find(|part| part.span.end() == offset)
    }

    pub fn free_before(&self, offset: u64) -> Option<Span> {
        self.free.iter().copied().find(|span| span.end() == offset)
    }

    pub fn free_after(&self, offset: u64) -> Option<Span> {
        self.free.iter().copied().find(|span| span.offset == offset)
    }

    pub fn create(&self, span: Span, kind: &str, name: &str) -> Result<()> {
        wait(udisks::created(
            &self.table,
            TABLE,
            "CreatePartition",
            &(span.offset, span.size, kind, name, no_options()),
        ))
        .map_err(anyhow::Error::msg)
        .with_context(|| format!("A partition couldn't be made at {}", span.offset))?;
        Ok(())
    }
}

impl Part {
    pub fn filesystem_device(&self) -> &str {
        self.mapped.as_deref().unwrap_or(&self.device)
    }

    fn changed(&self, result: Result<(), String>) -> Result<()> {
        result
            .map_err(anyhow::Error::msg)
            .with_context(|| format!("{} couldn't be changed", self.device))
    }

    fn set(&self, method: &str, value: &str) -> Result<()> {
        self.changed(wait(udisks::run(
            &self.block,
            PARTITION,
            method,
            &(value, no_options()),
        )))
    }

    pub fn resize(&self, size: u64) -> Result<()> {
        self.changed(wait(udisks::run(
            &self.block,
            PARTITION,
            "Resize",
            &(size, no_options()),
        )))
    }

    pub fn set_type(&self, kind: &str) -> Result<()> {
        if self.kind == kind {
            return Ok(());
        }
        self.set("SetType", kind)
    }

    pub fn set_uuid(&self, uuid: &str) -> Result<()> {
        if self.uuid == uuid {
            return Ok(());
        }
        self.set("SetUUID", uuid)
    }

    pub fn delete(&self) -> Result<()> {
        if self.filesystem == STARTUP_FILESYSTEM {
            wait(mounting::release(&self.block)).map_err(anyhow::Error::msg)?;
        }
        wait(udisks::run(
            &self.block,
            PARTITION,
            "Delete",
            &(no_options(),),
        ))
        .map_err(anyhow::Error::msg)
        .with_context(|| format!("{} couldn't be removed", self.device))
    }
}
