use std::collections::HashMap;

use anyhow::{Context, Result, anyhow};
use luft_dbus::objects::Objects;
use luft_disks::udisks::{self, BLOCK, Options, TABLE, bytes_text};
use luft_disks::{mounting, resize};
use luft_i18n::t;
use zbus::{OwnedObjectPath, Variant};

use super::layout::{Part, Role};
use super::plan::Plan;
use crate::L10N;

pub struct Created {
    pub role: Role,
    pub device: String,
    pub uuid: String,
}

fn quiet() -> Options<'static> {
    HashMap::from([("auth.no_user_interaction", Variant::from(true))])
}

fn failed(message: String) -> anyhow::Error {
    anyhow!(message)
}

fn partitions(objects: &Objects, drive: &str) -> Vec<String> {
    objects
        .get(drive, TABLE)
        .and_then(|table| table.get::<Vec<OwnedObjectPath>>("Partitions"))
        .unwrap_or_default()
        .into_iter()
        .map(|path| path.to_string())
        .collect()
}

async fn wipe(drive: &str) -> Result<()> {
    let objects = udisks::objects().await.map_err(failed)?;
    for partition in partitions(&objects, drive) {
        mounting::release_in(&objects, &partition)
            .await
            .map_err(failed)?;
    }
    udisks::run(drive, BLOCK, "Format", &("gpt", quiet()))
        .await
        .map_err(failed)
}

async fn create(drive: &str, part: &Part, encrypted: bool) -> Result<String> {
    let (offset, size, kind, name) = (
        part.offset,
        part.size,
        part.role.partition_type(),
        part.role.name(),
    );
    let created = if encrypted && part.role == Role::Root {
        udisks::created(
            drive,
            TABLE,
            "CreatePartition",
            &(offset, size, kind, name, quiet()),
        )
        .await
    } else {
        let (filesystem, label) = part.role.filesystem();
        let mut format = quiet();
        format.insert("label", Variant::from(label));
        udisks::created(
            drive,
            TABLE,
            "CreatePartitionAndFormat",
            &(offset, size, kind, name, quiet(), filesystem, format),
        )
        .await
    };
    created
        .map_err(failed)
        .with_context(|| part.role.creation_failed())
}

async fn describe(role: Role, block: &str) -> Result<Created> {
    let objects = udisks::objects().await.map_err(failed)?;
    let info = objects
        .get(block, BLOCK)
        .context("A new partition disappeared")?;
    Ok(Created {
        role,
        device: bytes_text(info.get("Device").unwrap_or_default()),
        uuid: info.get("IdUUID").unwrap_or_default(),
    })
}

pub async fn apply(plan: &Plan, encrypted: bool) -> Result<Vec<Created>> {
    if plan.wipe {
        wipe(&plan.drive).await?;
    }
    if let Some(shrink) = &plan.shrink {
        resize::resize(&shrink.block, shrink.size, true)
            .await
            .map_err(failed)
            .with_context(|| t!(L10N, "installer-shrink-failed"))?;
    }
    let mut created = Vec::with_capacity(plan.parts.len());
    for part in &plan.parts {
        let block = create(&plan.drive, part, encrypted).await?;
        created.push(describe(part.role, &block).await?);
    }
    Ok(created)
}
