mod guard;
mod moving;
mod resize;

use luft_app::Events;
use serde::Deserialize;
use zbus::zvariant::Value;

use super::formatting::{self, Format};
use super::mounting;
use crate::udisks::{self, BLOCK, ENCRYPTED, FILESYSTEM, PARTITION, TABLE, no_options};
use guard::Guard;

#[derive(Deserialize)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Step {
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

pub fn run(events: &Events, step: Step) -> Result<Option<String>, String> {
    match step {
        Step::Create {
            table,
            offset,
            size,
            partition_type,
            name,
            flags,
            filesystem,
            label,
        } => {
            Guard::table(&table)?;
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
                )?
            } else {
                formatting::create_typed(
                    &table,
                    (offset, size),
                    (&partition_type, &name),
                    &Format::plain(filesystem, label),
                    false,
                )?
            };
            if !flags.is_empty() {
                set_flags(&created, &flags)?;
            }
            Ok(Some(created))
        }
        Step::Delete { block } => {
            Guard::volume(&block)?.changeable()?;
            delete(&block).map(|()| None)
        }
        Step::Place {
            block,
            offset,
            size,
        } => place(events, &block, offset, size),
        Step::Format {
            block,
            filesystem,
            label,
        } => {
            Guard::volume(&block)?.changeable()?;
            formatting::format_volume(&block, &Format::plain(filesystem, label)).map(|()| None)
        }
        Step::Change {
            block,
            partition_type,
            name,
            flags,
            label,
        } => {
            Guard::volume(&block)?.changeable()?;
            change(&block, partition_type, name, flags, label).map(|()| None)
        }
    }
}

pub fn delete(block: &str) -> Result<(), String> {
    mounting::release(block)?;
    let mut options = no_options();
    options.insert("tear-down", Value::from(true));
    udisks::run(block, PARTITION, "Delete", &(options,))
}

fn place(events: &Events, block: &str, offset: u64, size: u64) -> Result<Option<String>, String> {
    let guard = Guard::volume(block)?;
    if offset == guard.offset {
        guard.resizable()?;
        resize::resize(block, size, !guard.system)?;
        return Ok(None);
    }
    guard.movable()?;
    if size != guard.size {
        guard.resizable()?;
    }
    mounting::release(block)?;
    if size < guard.size {
        resize::resize(block, size, true)?;
    }
    let moved = moving::shift(events, block, offset)?;
    if size > guard.size {
        resize::resize(&moved, size, true)?;
    }
    Ok(Some(moved))
}

fn change(
    block: &str,
    partition_type: Option<String>,
    name: Option<String>,
    flags: Option<Vec<u8>>,
    label: Option<String>,
) -> Result<(), String> {
    if let Some(kind) = partition_type {
        udisks::run(block, PARTITION, "SetType", &(kind.as_str(), no_options()))?;
    }
    if let Some(name) = name {
        udisks::run(block, PARTITION, "SetName", &(name.as_str(), no_options()))?;
    }
    if let Some(flags) = flags {
        set_flags(block, &flags)?;
    }
    if let Some(label) = label {
        mounting::set_label(&labelled(block)?, &label)?;
    }
    Ok(())
}

fn labelled(block: &str) -> Result<String, String> {
    let objects = udisks::objects()?;
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

fn set_flags(block: &str, bits: &[u8]) -> Result<(), String> {
    let flags = bits
        .iter()
        .filter(|bit| **bit < 64)
        .fold(0_u64, |flags, bit| flags | 1 << bit);
    udisks::run(block, PARTITION, "SetFlags", &(flags, no_options()))
}
