mod guard;
pub mod moving;

use luft_app::Events;
use luft_disks::{partitions, resize};
use serde::Deserialize;

use super::formatting::{self, Format};
use super::mounting;
use crate::trust;
use crate::udisks::{self, BLOCK, ENCRYPTED, FILESYSTEM, PARTITION, TABLE, no_options};
use guard::Guard;
use specta::Type;

#[derive(Deserialize, Type)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum PlanStep {
    Create {
        table: String,
        offset: u64,
        size: u64,
        partition_type: String,
        name: String,
        flags: Vec<u8>,
        filesystem: String,
        label: String,
    },
    Delete {
        block: String,
    },
    Place {
        block: String,
        offset: u64,
        size: u64,
    },
    Format {
        block: String,
        filesystem: String,
        label: String,
    },
    Change {
        block: String,
        partition_type: Option<String>,
        name: Option<String>,
        flags: Option<Vec<u8>>,
        label: Option<String>,
    },
}

pub async fn run(events: &Events, step: PlanStep) -> Result<Option<String>, String> {
    match step {
        PlanStep::Create {
            table,
            offset,
            size,
            partition_type,
            name,
            flags,
            filesystem,
            label,
        } => {
            Guard::table(&table).await?;
            let created = if filesystem.is_empty() {
                udisks::created(
                    &table,
                    TABLE,
                    "CreatePartition",
                    &(
                        offset,
                        size,
                        partition_type.as_str(),
                        name.as_str(),
                        no_options(),
                    ),
                )
                .await?
            } else {
                formatting::create_typed(
                    &table,
                    (offset, size),
                    (&partition_type, &name),
                    &Format::plain(&filesystem, label)?,
                    false,
                )
                .await?
            };
            if !flags.is_empty() {
                set_flags(&created, &flags).await?;
            }
            Ok(Some(created))
        }
        PlanStep::Delete { block } => {
            Guard::volume(&block).await?.changeable()?;
            partitions::delete(&block).await.map(|()| None)
        }
        PlanStep::Place {
            block,
            offset,
            size,
        } => place(events, &block, offset, size).await,
        PlanStep::Format {
            block,
            filesystem,
            label,
        } => {
            Guard::volume(&block).await?.changeable()?;
            formatting::format_volume(&block, &Format::plain(&filesystem, label)?)
                .await
                .map(|()| None)
        }
        PlanStep::Change {
            block,
            partition_type,
            name,
            flags,
            label,
        } => {
            Guard::volume(&block).await?.changeable()?;
            change(&block, partition_type, name, flags, label)
                .await
                .map(|()| None)
        }
    }
}

async fn place(
    events: &Events,
    block: &str,
    offset: u64,
    size: u64,
) -> Result<Option<String>, String> {
    let guard = Guard::volume(block).await?;
    if offset == guard.offset && guard.system {
        return trust::resize_system(size).await.map(|_| None);
    }
    if offset == guard.offset {
        guard.resizable()?;
        resize::resize(block, size, true).await?;
        return Ok(None);
    }
    guard.movable()?;
    if size != guard.size {
        guard.resizable()?;
    }
    mounting::release(block).await?;
    if size < guard.size {
        resize::resize(block, size, true).await?;
    }
    let moved = moving::shift(events, block, offset).await?;
    if size > guard.size {
        resize::resize(&moved, size, true).await?;
    }
    Ok(Some(moved))
}

async fn change(
    block: &str,
    partition_type: Option<String>,
    name: Option<String>,
    flags: Option<Vec<u8>>,
    label: Option<String>,
) -> Result<(), String> {
    if let Some(kind) = partition_type {
        udisks::run(block, PARTITION, "SetType", &(kind.as_str(), no_options())).await?;
    }
    if let Some(name) = name {
        udisks::run(block, PARTITION, "SetName", &(name.as_str(), no_options())).await?;
    }
    if let Some(flags) = flags {
        set_flags(block, &flags).await?;
    }
    if let Some(label) = label {
        mounting::set_label(&labelled(block).await?, &label).await?;
    }
    Ok(())
}

async fn labelled(block: &str) -> Result<String, String> {
    let objects = udisks::objects().await?;
    if objects.get(block, FILESYSTEM).is_some() {
        return Ok(block.to_owned());
    }
    objects
        .get(block, ENCRYPTED)
        .and_then(|_| {
            objects
                .implementing(BLOCK)
                .find(|candidate| candidate.link("CryptoBackingDevice").as_deref() == Some(block))
        })
        .filter(|cleartext| objects.get(cleartext.path, FILESYSTEM).is_some())
        .map(|cleartext| cleartext.path.to_owned())
        .ok_or_else(|| "There's no file system to name".to_owned())
}

async fn set_flags(block: &str, bits: &[u8]) -> Result<(), String> {
    let flags = bits
        .iter()
        .filter(|bit| **bit < 64)
        .fold(0_u64, |flags, bit| flags | 1 << bit);
    udisks::run(block, PARTITION, "SetFlags", &(flags, no_options())).await
}
