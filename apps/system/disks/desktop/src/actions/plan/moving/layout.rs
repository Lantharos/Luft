use luft_app::dbus::objects::Objects;
use serde::{Deserialize, Serialize};
use zbus::Variant;

use super::journal::Move;
use crate::udisks::{self, BLOCK, PARTITION, TABLE, no_options};

#[derive(Serialize, Deserialize)]
pub struct Entry {
    pub offset: u64,
    pub size: u64,
    pub(super) kind: String,
    pub(super) name: String,
    pub(super) uuid: String,
    pub(super) flags: u64,
    pub(super) gpt: bool,
}

pub struct Found {
    pub table: String,
    pub old: Option<String>,
    pub new: Option<String>,
    free: bool,
}

impl Found {
    pub fn fits(&self, plan: &Move, copied: u64) -> bool {
        self.old.is_some() || (copied == plan.body() && (self.new.is_some() || self.free))
    }
}

pub async fn plan(block: &str, to: u64, label: &str) -> Result<(String, Move), String> {
    let objects = udisks::objects().await?;
    let partition = objects
        .get(block, PARTITION)
        .ok_or("This partition is gone")?;
    let table = partition
        .link("Table")
        .ok_or("This partition has no table")?;
    let gpt = objects
        .get(&table, TABLE)
        .and_then(|table| table.get::<String>("Type"))
        .is_some_and(|kind| kind == "gpt");
    let drive = objects.get(&table, BLOCK).ok_or("This drive is gone")?;
    let plan = Move {
        drive: drive.get("Id").unwrap_or_default(),
        drive_size: drive.get("Size").unwrap_or(0),
        label: label.to_owned(),
        entry: Entry {
            offset: partition.get("Offset").unwrap_or(0),
            size: partition.get("Size").unwrap_or(0),
            kind: partition.get("Type").unwrap_or_default(),
            name: partition.get("Name").unwrap_or_default(),
            uuid: partition.get("UUID").unwrap_or_default(),
            flags: partition.get("Flags").unwrap_or(0),
            gpt,
        },
        to,
    };
    Ok((table, plan))
}

pub fn find(objects: &Objects, plan: &Move) -> Option<Found> {
    let table = objects.implementing(TABLE).find(|table| {
        objects.get(table.path, BLOCK).is_some_and(|block| {
            block.get::<String>("Id").unwrap_or_default() == plan.drive
                && block.get::<u64>("Size") == Some(plan.drive_size)
        })
    })?;
    let size = plan.entry.size;
    let spans: Vec<(&str, u64, u64)> = objects
        .implementing(PARTITION)
        .filter(|partition| partition.link("Table").as_deref() == Some(table.path))
        .filter(|partition| !partition.flag("IsContainer"))
        .map(|partition| {
            (
                partition.path,
                partition.get("Offset").unwrap_or(0),
                partition.get("Size").unwrap_or(0),
            )
        })
        .collect();
    let at = |offset: u64| {
        spans
            .iter()
            .find(|span| span.1 == offset && span.2 == size)
            .map(|span| span.0.to_owned())
    };
    Some(Found {
        table: table.path.to_owned(),
        old: at(plan.entry.offset),
        new: at(plan.to),
        free: spans
            .iter()
            .all(|span| span.1 + span.2 <= plan.to || plan.to + size <= span.1),
    })
}

async fn create(table: &str, entry: &Entry, offset: u64) -> Result<String, String> {
    let mut options = no_options();
    if entry.gpt && !entry.uuid.is_empty() {
        options.insert("partition-uuid", Variant::from(entry.uuid.as_str()));
    }
    let name = if entry.gpt { entry.name.as_str() } else { "" };
    let created = udisks::created(
        table,
        TABLE,
        "CreatePartition",
        &(offset, entry.size, entry.kind.as_str(), name, options),
    )
    .await?;
    if entry.flags != 0 {
        udisks::run(
            &created,
            PARTITION,
            "SetFlags",
            &(entry.flags, no_options()),
        )
        .await?;
    }
    Ok(created)
}

pub async fn settle(plan: &Move) -> Result<String, String> {
    let found = find(&udisks::objects().await?, plan).ok_or("This drive is gone")?;
    if let Some(old) = &found.old {
        udisks::run(old, PARTITION, "Delete", &(no_options(),)).await?;
    }
    match found.new {
        Some(moved) => Ok(moved),
        None => create(&found.table, &plan.entry, plan.to).await,
    }
}
