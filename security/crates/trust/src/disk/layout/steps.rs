use std::path::Path;

use anyhow::{Context, Result, bail};
use luft_meet::resize::{ROOT_NAME, ROOT_TYPE};

use super::parts::drive::{self, Disk, Part};
use super::parts::{btrfs, halves, startup};
use super::plan::{Span, Step};
use super::requests::meet;
use crate::errors::NeedsKey;
use crate::system::firmware::efi;
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;

const LINUX_DATA: &str = "0fc63daf-8483-4772-8e79-3d69d8477de4";

fn needed(disk: &Disk, at: u64) -> Result<&Part> {
    disk.at(at)
        .with_context(|| format!("The partition at {at} is gone"))
}

fn needs(key: Option<&Secret>) -> Result<&Secret> {
    key.ok_or_else(|| NeedsKey.into())
}

fn file_system_size(part: &Part, size: u64) -> Result<u64> {
    let offset = match part.mapped.as_deref() {
        Some(mapped) => halves::data_offset(&drive::mapper_name(mapped)?)?,
        None => 0,
    };
    Ok(size - offset)
}

fn shrink(disk: &Disk, at: u64, size: u64, key: Option<&Secret>) -> Result<()> {
    let part = needed(disk, at)?;
    let inside = file_system_size(part, size)?;
    if let Some(member) = btrfs::member(part.filesystem_device())?
        && member.size > inside
    {
        btrfs::resize(member.devid, Some(inside))?;
    }
    if part.mapped.is_some() {
        halves::fit(Path::new(&part.device), Some(size), needs(key)?)?;
    }
    if part.span.size > size {
        part.resize(size)?;
    }
    Ok(())
}

fn grow(disk: &Disk, at: u64, end: u64, key: Option<&Secret>) -> Result<()> {
    let part = needed(disk, at)?;
    if part.span.end() < end {
        part.resize(end - at)?;
    }
    if part.mapped.is_some() {
        halves::fit(Path::new(&part.device), None, needs(key)?)?;
    }
    let member = btrfs::member(part.filesystem_device())?
        .context("The grown partition isn't part of Luft's file system")?;
    btrfs::resize(member.devid, None)
}

fn delete(disk: &Disk, at: u64) -> Result<()> {
    let Some(part) = disk.at(at) else {
        return Ok(());
    };
    if part.mapped.is_some() || btrfs::member(part.filesystem_device())?.is_some() {
        bail!("{} still holds Luft's files", part.device);
    }
    part.delete()
}

fn discard(disk: &Disk, at: u64, uuid: &str) -> Result<()> {
    match disk.at(at) {
        Some(part) if part.uuid == uuid => part.delete(),
        _ => Ok(()),
    }
}

fn forget_start_entry(number: u16) -> Result<()> {
    if efi::global_variable(&format!("Boot{number:04X}")).is_none() {
        return Ok(());
    }
    Tool::new("efibootmgr")
        .args([
            "--quiet",
            "--bootnum",
            &format!("{number:04X}"),
            "--delete-bootnum",
        ])
        .status()
}

pub fn run(drive: &str, step: &Step, key: Option<&Secret>) -> Result<()> {
    let disk = drive::read(drive)?;
    match step {
        Step::CopyStartup { from, to } => startup::copy(&disk, *from, *to),
        Step::Shrink { at, size } => shrink(&disk, *at, *size, key),
        Step::Create { at, size } if disk.at(*at).is_none() => disk.create(
            Span {
                offset: *at,
                size: *size,
            },
            LINUX_DATA,
            ROOT_NAME,
        ),
        Step::Create { .. } => Ok(()),
        Step::Seal { at } => {
            halves::seal(Path::new(&needed(&disk, *at)?.device), needs(key)?).map(drop)
        }
        Step::Join { at } => {
            let device = needed(&disk, *at)?.filesystem_device().to_owned();
            if btrfs::member(&device)?.is_none() {
                btrfs::add(&device)?;
            }
            Ok(())
        }
        Step::Hand { from, to } => {
            needed(&disk, *to)?.set_type(ROOT_TYPE)?;
            disk.at(*from)
                .map_or(Ok(()), |from| from.set_type(LINUX_DATA))
        }
        Step::Leave { at } => match disk.at(*at) {
            Some(part) if btrfs::member(part.filesystem_device())?.is_some() => {
                btrfs::remove(part.filesystem_device())
            }
            _ => Ok(()),
        },
        Step::Retire { at } => disk
            .at(*at)
            .map_or(Ok(()), |part| halves::retire(Path::new(&part.device))),
        Step::Delete { at } => delete(&disk, *at),
        Step::Grow { at, end } => grow(&disk, *at, *end, key),
        Step::Rename { at, uuid } => needed(&disk, *at)?.set_uuid(uuid),
        Step::Settle { at, uuid } => halves::settle(Path::new(&needed(&disk, *at)?.device), uuid),
        Step::Discard { at, uuid } => discard(&disk, *at, uuid),
        Step::ForgetStartEntry { number } => forget_start_entry(*number),
        Step::RemoveFolder { folder } => meet::remove_folder(folder),
    }
}
