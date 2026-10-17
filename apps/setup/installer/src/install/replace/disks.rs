use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result, anyhow};
use luft_disks::udisks::{self, BLOCK, Options, PARTITION};
use zvariant::Value;

use crate::install::drive::layout::Role;
use crate::survey::linux::Part;
use crate::system::command::Tool;

pub const LUFT_SUBVOLUME: &str = "luft";

fn options(label: Option<&str>) -> Options<'static> {
    let mut options: Options<'static> =
        HashMap::from([("auth.no_user_interaction", Value::from(true))]);
    if let Some(label) = label {
        options.insert("label", Value::from(label.to_owned()));
    }
    options
}

fn set_type(part: &Part, role: Role) -> Result<()> {
    udisks::run(
        &part.block,
        PARTITION,
        "SetType",
        &(role.partition_type(), options(None)),
    )
    .map_err(|error| anyhow!(error))
    .with_context(|| format!("{} couldn't be marked for Luft", part.device))
}

pub fn format(part: &Part, role: Role) -> Result<()> {
    let (filesystem, label) = role.filesystem();
    udisks::run(
        &part.block,
        BLOCK,
        "Format",
        &(filesystem, options(Some(label))),
    )
    .map_err(|error| anyhow!(error))
    .with_context(|| format!("{} couldn't be formatted", part.device))?;
    set_type(part, role)
}

pub fn mark_root(part: &Part) -> Result<()> {
    set_type(part, Role::Root)
}

pub fn new_subvolume(top: &Path) -> Result<()> {
    let path = top.join(LUFT_SUBVOLUME);
    if path.exists() {
        Tool::new("btrfs")
            .args(["subvolume", "delete", "--recursive"])
            .arg(&path)
            .run()
            .context("What an earlier attempt left couldn't be cleared")?;
    }
    Tool::new("btrfs")
        .args(["subvolume", "create"])
        .arg(&path)
        .run()?;
    Tool::new("btrfs")
        .args(["subvolume", "set-default"])
        .arg(&path)
        .run()
        .context("Luft couldn't be made the system that starts")
}

pub fn free_name(top: &Path, wanted: &str) -> String {
    (1..)
        .map(|number| match number {
            1 => wanted.to_owned(),
            _ => format!("{wanted}-{number}"),
        })
        .find(|name| !top.join(name).exists())
        .expect("some name is free")
}
