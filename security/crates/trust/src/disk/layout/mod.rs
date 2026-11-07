mod journal;
pub mod old_system;
pub(crate) mod parts;
mod plan;
mod requests;
mod steps;
mod top_level;

use anyhow::{Context, Result, bail, ensure};
use luft_meet::resize::{Change, Request, needed};

use super::{SystemDisk, encrypting};
use crate::errors::{Busy, Unsupported};
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;
use journal::{Journal, Working};
use parts::drive::{self, Disk, Part};
use parts::{btrfs, halves};
use plan::Step;

pub use halves::open_in_initrd;
pub(crate) use top_level::TopLevel;

const ATTEMPTS: u32 = 3;

pub fn claim() -> Result<Working> {
    match Working::try_take()? {
        Some(working) if Journal::load().is_none() => Ok(working),
        _ => bail!(Busy),
    }
}

fn run(mut journal: Journal, key: Option<&Secret>) -> Result<()> {
    while let Some(step) = journal.steps.get(journal.next) {
        eprintln!("Changing Luft's partition: {step:?}");
        if let Err(error) = steps::run(&journal.drive, step, key) {
            journal.attempts += 1;
            if journal.attempts >= ATTEMPTS {
                Journal::finish();
                return Err(error.context("Luft gave up changing its partition"));
            }
            journal.save()?;
            return Err(error);
        }
        journal.next += 1;
        journal.attempts = 0;
        journal.save()?;
    }
    Journal::finish();
    Tool::new("systemctl").arg("daemon-reload").status()
}

fn requested() -> Result<Option<Journal>> {
    match requests::meet::plan() {
        Ok(Some(journal)) => {
            journal.save()?;
            requests::meet::forget();
            return Ok(Some(journal));
        }
        Ok(None) => {}
        Err(error) => {
            requests::meet::forget();
            return Err(error.context("Luft didn't take back Meet Luft's space"));
        }
    }
    let planned = requests::windows::plan();
    if let Ok(Some(journal)) = &planned {
        journal.save()?;
    }
    if !matches!(planned, Ok(None)) {
        requests::windows::forget()?;
    }
    planned.context("Luft didn't change its size")
}

pub fn continue_at_start() -> Result<()> {
    if let Err(error) = super::moving::at_start() {
        eprintln!("Luft couldn't take back an unfinished move: {error:#}");
    }
    if encrypting::underway() {
        return Ok(());
    }
    let _working = Working::wait()?;
    if let Err(error) = requests::windows::report() {
        eprintln!("Luft couldn't tell Windows how full it is: {error:#}");
    }
    let key = halves::system_key(&Secret::default()).ok().flatten();
    while let Some(journal) = Journal::load().map_or_else(requested, |journal| Ok(Some(journal)))? {
        run(journal, key.as_ref())?;
    }
    Ok(())
}

fn refuse_while_encrypting() -> Result<()> {
    if encrypting::underway() {
        bail!(Unsupported(
            "Luft is being encrypted. Change its size once that's done.".to_owned()
        ));
    }
    Ok(())
}

pub fn grow_at_start() -> Result<()> {
    refuse_while_encrypting()?;
    let _working = claim()?;
    match waiting(&SystemDisk::find()?) {
        Some(Change::Grow) => return Ok(()),
        Some(_) => bail!(Unsupported(
            "Luft already waits to change its size at the next start. Call that off first."
                .to_owned()
        )),
        None => {}
    }
    let current = requests::windows::current().map_err(unsupported)?;
    if current.layout.free_before.is_none() {
        bail!(Unsupported(
            "There's no free space right before Luft.".to_owned()
        ));
    }
    plan::plan(&current.layout, Change::Grow).map_err(unsupported)?;
    requests::windows::ask(&Request {
        change: Change::Grow,
        partition: current.partition,
    })
}

pub fn waiting(disk: &SystemDisk) -> Option<Change> {
    let request = requests::windows::waiting()?;
    (blocks::partuuid(&disk.partition)? == request.partition).then_some(request.change)
}

pub fn cancel_waiting() -> Result<()> {
    let _working = claim()?;
    requests::windows::forget()
}

fn unsupported(error: anyhow::Error) -> anyhow::Error {
    Unsupported(format!("{error}.")).into()
}

fn change_in_place(
    typed: &Secret,
    step: impl FnOnce(&Disk, &Part) -> Result<Option<Step>>,
) -> Result<(u64, u64)> {
    refuse_while_encrypting()?;
    let _working = claim()?;
    let key = halves::system_key(typed)?;
    let device = drive::system_partition()?;
    let disk = drive::holding(&device)?;
    let root = disk
        .holding(&device)
        .context("Luft's partition isn't on its drive")?;
    let before = root.span.size;
    let Some(step) = step(&disk, root)? else {
        return Ok((before, before));
    };
    let journal = Journal::new(disk.id.clone(), vec![step]);
    journal.save()?;
    if let Err(error) = run(journal, key.as_ref()) {
        Journal::finish();
        return Err(error);
    }
    let after = drive::read(&disk.id)?
        .holding(&device)
        .map_or(before, |root| root.span.size);
    Ok((before, after))
}

pub fn grow(typed: &Secret) -> Result<u64> {
    let (before, after) = change_in_place(typed, |disk, root| {
        Ok(disk.free_after(root.span.end()).map(|free| Step::Grow {
            at: root.span.offset,
            end: free.end(),
        }))
    })?;
    Ok(after.saturating_sub(before))
}

pub fn resize(size: u64, typed: &Secret) -> Result<u64> {
    let size = plan::align_down(size);
    let (_, after) = change_in_place(typed, |disk, root| {
        let at = root.span.offset;
        if size < root.span.size {
            ensure!(
                size >= needed(btrfs::allocated(&root.fs_uuid)?),
                "Luft wouldn't have room for its files"
            );
            return Ok(Some(Step::Shrink { at, size }));
        }
        if size == root.span.size {
            return Ok(None);
        }
        disk.free_after(root.span.end())
            .filter(|free| at + size <= free.end())
            .context("There isn't that much free space right after Luft")?;
        Ok(Some(Step::Grow { at, end: at + size }))
    })?;
    Ok(after)
}
