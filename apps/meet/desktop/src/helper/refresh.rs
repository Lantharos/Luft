use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use luft_meet::Handoff;

use super::drive::storage::{Layout, MSFT_Partition, Storage};
use super::drive::windows_drive::{self, WindowsDrive};
use super::drive::{record, state};
use super::system::protected::Scratch;
use super::system::start_entries;
use super::{Context, live_system, prepare, undo};
use crate::live::iso::Entry;
use crate::live::source::Source;
use crate::plan::layout::{self, Disk};
use crate::protocol::{Prepared, Stage};

const LOGS: &str = "Luft logs";

struct KeptLogs(Scratch);

impl KeptLogs {
    fn take(live: &Path) -> Result<Self, String> {
        let kept = Self(Scratch::new("logs")?);
        let logs = live.join(LOGS);
        if logs.is_dir() {
            copy_tree(&logs, &kept.folder()).map_err(|error| error.to_string())?;
        }
        Ok(kept)
    }

    fn folder(&self) -> PathBuf {
        self.0.path().join(LOGS)
    }

    fn put_back(&self, live: &Path) -> io::Result<()> {
        if self.folder().is_dir() {
            copy_tree(&self.folder(), &live.join(LOGS))?;
        }
        Ok(())
    }
}

fn copy_tree(from: &Path, to: &Path) -> io::Result<()> {
    fs::create_dir_all(to)?;
    for entry in fs::read_dir(from)? {
        let entry = entry?;
        let target = to.join(entry.file_name());
        if entry.file_type()?.is_dir() {
            copy_tree(&entry.path(), &target)?;
        } else {
            fs::copy(entry.path(), target)?;
        }
    }
    Ok(())
}

fn fits(partition: &MSFT_Partition, needed: u64) -> bool {
    partition.Size >= needed
}

fn without(layout: &Layout, old: &[&MSFT_Partition]) -> Disk {
    let mut disk = layout.plan_disk();
    disk.partitions
        .retain(|span| !old.iter().any(|partition| partition.span() == *span));
    disk
}

fn rebuild(
    context: &Context,
    storage: &Storage,
    drive: &WindowsDrive,
    handoff: &Handoff,
    old: [&MSFT_Partition; 2],
    entries: &[Entry],
    source: &Source,
) -> Result<(), String> {
    let layout = &storage.layout(&drive.volume)?;
    let windows = storage.windows_plan(layout, &drive.volume)?;
    let room = handoff.room().map_or(0, |room| room.size);
    let plan = layout::plan(
        &without(layout, &old),
        &windows,
        room,
        &live_system::partitions(entries),
    )
    .map_err(prepare::shortfall)?;
    let live = old[1]
        .volume_path()
        .ok_or("Luft's partition has no volume")?;
    let logs = KeptLogs::take(&live)?;
    context.progress(Stage::Partitioning, 0, 2);
    start_entries::remove(&[handoff.boot_entry])?;
    record::set_boot_entry(None)?;
    for partition in old {
        storage.delete(&storage.refreshed(partition)?)?;
        if let Some(guid) = partition.guid() {
            record::removed_partition(&guid)?;
        }
    }
    if plan.windows_size < layout.windows.Size {
        context.progress(Stage::Shrinking, 0, 1);
        storage.resize(&layout.windows, plan.windows_size)?;
        context.progress(Stage::Shrinking, 1, 1);
    }
    let layout = storage.layout(&drive.volume)?;
    let mut created = Vec::new();
    let moving_box = handoff.moving_box().map(str::to_owned);
    prepare::build(
        context,
        storage,
        &layout,
        &plan,
        source,
        moving_box,
        &mut created,
    )
    .inspect_err(|_| {
        if let Err(error) = undo::give_back(context, storage, drive, &created) {
            eprintln!("Cleaning up after a failed update didn't work: {error}");
        }
    })?;
    let live = storage
        .refreshed(&created[1])?
        .volume_path()
        .ok_or("Luft's new partition has no volume")?;
    if let Err(error) = logs.put_back(&live) {
        eprintln!("The logs from Try Luft couldn't be kept: {error}");
    }
    Ok(())
}

pub fn refresh(context: &Context, source: &Source) -> Result<Prepared, String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let found = state::find(&layout);
    let (Some(handoff), Some(live)) = (found.handoff.clone(), found.live.clone()) else {
        return Err("Make room for Luft first.".to_owned());
    };
    let made = handoff
        .made_partitions()
        .ok_or("Luft's partitions are missing from Meet Luft's notes")?;
    let start = found
        .made_partition(&made.start)
        .cloned()
        .ok_or("Luft's start partition is gone")?;
    let entries = live_system::listing(source)?.entries;
    let [(_, start_needed), (_, live_needed)] = live_system::partitions(&entries);
    if fits(&start, start_needed) && fits(&live, live_needed) {
        let start_path = start
            .volume_path()
            .ok_or("The start partition has no volume")?;
        let live_path = live.volume_path().ok_or("Luft's partition has no volume")?;
        live_system::rewrite(context, source, &start_path, &live_path, &made.live)?;
    } else {
        rebuild(
            context,
            &storage,
            &drive,
            &handoff,
            [&start, &live],
            &entries,
            source,
        )?;
    }
    let layout = storage.layout(&drive.volume)?;
    prepare::prepared(&state::find(&layout))
        .ok_or_else(|| "Luft's partitions disappeared".to_owned())
}
