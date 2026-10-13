use std::collections::HashMap;

use anyhow::{Context, Result, anyhow};
use luft_dbus::objects::Objects;
use luft_disks::udisks::{self, BLOCK, Options, TABLE, bytes_text};
use luft_disks::{mounting, resize};
use zbus::zvariant::{OwnedObjectPath, Value};

use super::layout::{Part, Role};
use super::plan::Plan;

pub struct Created {
    pub role: Role,
    pub device: String,
    pub uuid: String,
}

fn quiet() -> Options<'static> {
    HashMap::from([("auth.no_user_interaction", Value::from(true))])
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

fn wipe(drive: &str) -> Result<()> {
    let objects = udisks::objects().map_err(failed)?;
    for partition in partitions(&objects, drive) {
        mounting::release_in(&objects, &partition).map_err(failed)?;
    }
    udisks::run(drive, BLOCK, "Format", &("gpt", quiet())).map_err(failed)
}

fn create(drive: &str, part: &Part) -> Result<String> {
    let (offset, size, kind, name) = (
        part.offset,
        part.size,
        part.role.partition_type(),
        part.role.name(),
    );
    let created = match part.role.filesystem() {
        Some((filesystem, label)) => {
            let mut format = quiet();
            format.insert("label", Value::from(label));
            udisks::created(
                drive,
                TABLE,
                "CreatePartitionAndFormat",
                &(offset, size, kind, name, quiet(), filesystem, format),
            )
        }
        None => udisks::created(
            drive,
            TABLE,
            "CreatePartition",
            &(offset, size, kind, name, quiet()),
        ),
    };
    created
        .map_err(failed)
        .with_context(|| format!("Couldn't make the {} partition", part.role.name()))
}

fn describe(role: Role, block: &str) -> Result<Created> {
    let objects = udisks::objects().map_err(failed)?;
    let info = objects
        .get(block, BLOCK)
        .context("A new partition disappeared")?;
    Ok(Created {
        role,
        device: bytes_text(info.get("Device").unwrap_or_default()),
        uuid: info.get("IdUUID").unwrap_or_default(),
    })
}

pub fn apply(plan: &Plan) -> Result<Vec<Created>> {
    if plan.wipe {
        wipe(&plan.drive)?;
    }
    if let Some(shrink) = &plan.shrink {
        resize::resize(&shrink.block, shrink.size, true)
            .map_err(failed)
            .context("Windows couldn't be made smaller")?;
    }
    plan.parts
        .iter()
        .map(|part| create(&plan.drive, part).and_then(|block| describe(part.role, &block)))
        .collect()
}
