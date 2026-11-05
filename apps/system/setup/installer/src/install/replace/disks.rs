use std::collections::HashMap;
use std::path::Path;

use anyhow::{Context, Result, anyhow};
use luft_disks::udisks::{self, BLOCK, Options, PARTITION};
use luft_i18n::t;
use zbus::Variant;

use crate::L10N;
use crate::install::drive::layout::Role;
use crate::survey::linux::Part;
use crate::system::command::Tool;
use crate::system::wait;

pub const LUFT_SUBVOLUME: &str = "luft";

fn options(label: Option<&str>) -> Options<'static> {
    let mut options: Options<'static> =
        HashMap::from([("auth.no_user_interaction", Variant::from(true))]);
    if let Some(label) = label {
        options.insert("label", Variant::from(label.to_owned()));
    }
    options
}

fn set_type(part: &Part, role: Role) -> Result<()> {
    wait(udisks::run(
        &part.block,
        PARTITION,
        "SetType",
        &(role.partition_type(), options(None)),
    ))
    .map_err(|error| anyhow!(error))
    .with_context(|| format!("{} couldn't be marked for Luft", part.device))
}

fn format_as(part: &Part, role: Role, filesystem: &str, label: Option<&str>) -> Result<()> {
    wait(udisks::run(
        &part.block,
        BLOCK,
        "Format",
        &(filesystem, options(label)),
    ))
    .map_err(|error| anyhow!(error))
    .with_context(|| format!("{} couldn't be formatted", part.device))?;
    set_type(part, role)
}

pub fn format(part: &Part, role: Role) -> Result<()> {
    let (filesystem, label) = role.filesystem();
    format_as(part, role, filesystem, Some(label))
}

pub fn erase(part: &Part, role: Role) -> Result<()> {
    format_as(part, role, "empty", None)
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
            .with_context(|| t!(L10N, "installer-leftovers-failed"))?;
    }
    Tool::new("btrfs")
        .args(["subvolume", "create"])
        .arg(&path)
        .run()?;
    Tool::new("btrfs")
        .args(["subvolume", "set-default"])
        .arg(&path)
        .run()
        .with_context(|| t!(L10N, "installer-default-failed"))
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
