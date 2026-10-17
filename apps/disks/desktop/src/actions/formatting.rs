use luft_app::dbus::objects::Objects;
use serde::{Deserialize, Serialize};
use zbus::{OwnedObjectPath, Variant};

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

pub async fn supported() -> Vec<Support> {
    let mut supported = Vec::with_capacity(FILESYSTEMS.len());
    for filesystem in FILESYSTEMS {
        let (available, missing) = udisks::manager::<(bool, String)>("CanFormat", &(*filesystem,))
            .await
            .unwrap_or((false, String::new()));
        let (resizable, resize, _) =
            udisks::manager::<(bool, u64, String)>("CanResize", &(*filesystem,))
                .await
                .unwrap_or((false, 0, String::new()));
        supported.push(Support {
            filesystem,
            available,
            missing,
            resize: if resizable { resize } else { 0 },
        });
    }
    supported
}

impl Format {
    pub fn plain(filesystem: String, label: String) -> Self {
        Self {
            filesystem,
            label,
            passphrase: None,
            remember: false,
            erase: false,
        }
    }

    fn options(&self, erase: bool, typed: bool) -> Result<Options<'_>, String> {
        if !FILESYSTEMS.contains(&self.filesystem.as_str()) {
            return Err(format!("{} isn't offered here", self.filesystem));
        }
        let mut options = no_options();
        options.insert("label", Variant::from(self.label.as_str()));
        options.insert("update-partition-type", Variant::from(typed));
        options.insert("tear-down", Variant::from(true));
        if OWNED.contains(&self.filesystem.as_str()) {
            options.insert("take-ownership", Variant::from(true));
        }
        if erase && self.erase {
            options.insert("erase", Variant::from("zero"));
        }
        if let Some(passphrase) = self
            .passphrase
            .as_deref()
            .filter(|passphrase| !passphrase.is_empty())
        {
            options.insert("encrypt.passphrase", Variant::from(passphrase));
            options.insert("encrypt.type", Variant::from("luks2"));
        }
        Ok(options)
    }

    async fn remember(&self, block: &str) -> Result<(), String> {
        match self.passphrase.as_deref() {
            Some(passphrase) if self.remember && !passphrase.is_empty() => {
                encryption::remember(block, passphrase).await
            }
            _ => Ok(()),
        }
    }
}

pub async fn format_volume(block: &str, format: &Format) -> Result<(), String> {
    mounting::release(block).await?;
    udisks::run(
        block,
        BLOCK,
        "Format",
        &(format.filesystem.as_str(), format.options(true, true)?),
    )
    .await?;
    format.remember(block).await
}

pub async fn format_drive(
    block: &str,
    size: u64,
    removable: bool,
    format: &Format,
) -> Result<(), String> {
    let objects = udisks::objects().await?;
    for path in partitions(&objects, block) {
        mounting::release_in(&objects, &path).await?;
    }
    mounting::release_in(&objects, block).await?;
    let table = if removable && size < LARGE_TABLE {
        "dos"
    } else {
        "gpt"
    };
    let mut options = no_options();
    options.insert("tear-down", Variant::from(true));
    if format.erase {
        options.insert("erase", Variant::from("zero"));
    }
    udisks::run(block, BLOCK, "Format", &(table, options)).await?;
    create_partition(block, ALIGNMENT, 0, format, false).await
}

pub async fn create_partition(
    table: &str,
    offset: u64,
    size: u64,
    format: &Format,
    erase: bool,
) -> Result<(), String> {
    let created = create_typed(table, (offset, size), ("", ""), format, erase).await?;
    format.remember(&created).await
}

pub async fn create_typed(
    table: &str,
    (offset, size): (u64, u64),
    (kind, name): (&str, &str),
    format: &Format,
    erase: bool,
) -> Result<String, String> {
    udisks::created(
        table,
        TABLE,
        "CreatePartitionAndFormat",
        &(
            offset,
            size,
            kind,
            name,
            no_options(),
            format.filesystem.as_str(),
            format.options(erase, kind.is_empty())?,
        ),
    )
    .await
}

fn partitions(objects: &Objects, block: &str) -> Vec<String> {
    objects
        .get(block, TABLE)
        .and_then(|table| table.get::<Vec<OwnedObjectPath>>("Partitions"))
        .unwrap_or_default()
        .into_iter()
        .map(|path| path.to_string())
        .collect()
}
