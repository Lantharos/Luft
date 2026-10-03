use serde::{Deserialize, Serialize};
use zbus::zvariant::Value;

use super::{encryption, mounting};
use crate::udisks::{self, BLOCK, Options, TABLE, no_options};

const FILESYSTEMS: &[&str] = &["ext4", "btrfs", "exfat", "ntfs", "vfat"];
const OWNED: &[&str] = &["ext4", "btrfs"];
const ALIGNMENT: u64 = 1024 * 1024;
const LARGE_TABLE: u64 = 2 * 1024 * 1024 * 1024 * 1024;

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Format {
    pub filesystem: String,
    pub label: String,
    pub passphrase: Option<String>,
    pub remember: bool,
    pub erase: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Support {
    filesystem: &'static str,
    available: bool,
    missing: String,
    resize: u64,
}

pub fn supported() -> Vec<Support> {
    FILESYSTEMS
        .iter()
        .map(|filesystem| {
            let (available, missing) =
                udisks::manager::<(bool, String)>("CanFormat", &(*filesystem,))
                    .unwrap_or((false, String::new()));
            let (resizable, resize, _) = udisks::manager::<(bool, u64, String)>(
                "CanResize",
                &(*filesystem,),
            )
            .unwrap_or((false, 0, String::new()));
            Support {
                filesystem,
                available,
                missing,
                resize: if resizable { resize } else { 0 },
            }
        })
        .collect()
}

impl Format {
    fn options(&self, erase: bool) -> Result<Options<'_>, String> {
        if !FILESYSTEMS.contains(&self.filesystem.as_str()) {
            return Err(format!("{} isn't offered here", self.filesystem));
        }
        let mut options = no_options();
        options.insert("label", Value::from(self.label.as_str()));
        options.insert("update-partition-type", Value::from(true));
        options.insert("tear-down", Value::from(true));
        if OWNED.contains(&self.filesystem.as_str()) {
            options.insert("take-ownership", Value::from(true));
        }
        if erase && self.erase {
            options.insert("erase", Value::from("zero"));
        }
        if let Some(passphrase) = self
            .passphrase
            .as_deref()
            .filter(|passphrase| !passphrase.is_empty())
        {
            options.insert("encrypt.passphrase", Value::from(passphrase));
            options.insert("encrypt.type", Value::from("luks2"));
        }
        Ok(options)
    }

    fn remember(&self, block: &str) -> Result<(), String> {
        match self.passphrase.as_deref() {
            Some(passphrase) if self.remember && !passphrase.is_empty() => {
                encryption::remember(block, passphrase)
            }
            _ => Ok(()),
        }
    }
}

pub fn format_volume(block: &str, format: &Format) -> Result<(), String> {
    mounting::release(block)?;
    udisks::run(
        block,
        BLOCK,
        "Format",
        &(format.filesystem.as_str(), format.options(true)?),
    )?;
    format.remember(block)
}

pub fn format_drive(
    block: &str,
    size: u64,
    removable: bool,
    format: &Format,
) -> Result<(), String> {
    let objects = udisks::objects()?;
    for path in partitions(&objects, block) {
        mounting::release_in(&objects, &path)?;
    }
    mounting::release_in(&objects, block)?;
    let table = if removable && size < LARGE_TABLE {
        "dos"
    } else {
        "gpt"
    };
    let mut options = no_options();
    options.insert("tear-down", Value::from(true));
    if format.erase {
        options.insert("erase", Value::from("zero"));
    }
    udisks::run(block, BLOCK, "Format", &(table, options))?;
    create_partition(block, ALIGNMENT, 0, format, false)
}

pub fn create_partition(
    table: &str,
    offset: u64,
    size: u64,
    format: &Format,
    erase: bool,
) -> Result<(), String> {
    let created = udisks::created(
        table,
        TABLE,
        "CreatePartitionAndFormat",
        &(
            offset,
            size,
            "",
            "",
            no_options(),
            format.filesystem.as_str(),
            format.options(erase)?,
        ),
    )?;
    format.remember(&created)
}

fn partitions(objects: &luft_app::dbus::objects::Objects, block: &str) -> Vec<String> {
    objects
        .get(block, TABLE)
        .and_then(|table| table.get::<Vec<zbus::zvariant::OwnedObjectPath>>("Partitions"))
        .unwrap_or_default()
        .into_iter()
        .map(|path| path.to_string())
        .collect()
}
