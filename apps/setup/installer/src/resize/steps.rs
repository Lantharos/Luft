use anyhow::{Context, Result, bail};
use luft_meet::resize::{ROOT_NAME, ROOT_TYPE};

use super::disk::{self, Disk, Part};
use super::plan::{Span, Step};
use super::{btrfs, startup};

const LINUX_DATA: &str = "0fc63daf-8483-4772-8e79-3d69d8477de4";

fn needed(disk: &Disk, at: u64) -> Result<&Part> {
    disk.at(at)
        .with_context(|| format!("The partition at {at} is gone"))
}

fn shrink(disk: &Disk, at: u64, size: u64) -> Result<()> {
    let part = needed(disk, at)?;
    if let Some(member) = btrfs::member(&part.device)?
        && member.size > size
    {
        btrfs::resize(member.devid, Some(size))?;
    }
    if part.span.size > size {
        part.resize(size)?;
    }
    Ok(())
}

fn grow(disk: &Disk, at: u64, end: u64) -> Result<()> {
    let part = needed(disk, at)?;
    if part.span.end() < end {
        part.resize(end - at)?;
    }
    let member = btrfs::member(&part.device)?
        .context("The grown partition isn't part of Luft's file system")?;
    btrfs::resize(member.devid, None)
}

fn delete(disk: &Disk, at: u64) -> Result<()> {
    let Some(part) = disk.at(at) else {
        return Ok(());
    };
    if btrfs::member(&part.device)?.is_some() {
        bail!("{} still holds Luft's files", part.device);
    }
    part.delete()
}

pub fn run(drive: &str, step: &Step) -> Result<()> {
    let disk = disk::read(drive)?;
    match step {
        Step::CopyStartup { from, to } => startup::copy(&disk, *from, *to),
        Step::Shrink { at, size } => shrink(&disk, *at, *size),
        Step::Create { at, size } if disk.at(*at).is_none() => disk.create(
            Span {
                offset: *at,
                size: *size,
            },
            LINUX_DATA,
            ROOT_NAME,
        ),
        Step::Create { .. } => Ok(()),
        Step::Join { at } => {
            let part = needed(&disk, *at)?;
            if btrfs::member(&part.device)?.is_none() {
                btrfs::add(&part.device)?;
            }
            Ok(())
        }
        Step::Hand { from, to } => {
            needed(&disk, *to)?.set_type(ROOT_TYPE)?;
            disk.at(*from)
                .map_or(Ok(()), |from| from.set_type(LINUX_DATA))
        }
        Step::Leave { at } => match disk.at(*at) {
            Some(part) if btrfs::member(&part.device)?.is_some() => btrfs::remove(&part.device),
            _ => Ok(()),
        },
        Step::Delete { at } => delete(&disk, *at),
        Step::Grow { at, end } => grow(&disk, *at, *end),
        Step::Rename { at, uuid } => needed(&disk, *at)?.set_uuid(uuid),
    }
}
