use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use luft_i18n::t;

use super::drive::state::Found;
use super::drive::storage::{self, MSFT_Disk, MSFT_Partition, Storage};
use super::drive::windows_drive::{self, WindowsDrive};
use super::drive::{record, state};
use super::system::protected::Scratch;
use super::system::start_entries;
use super::{Context, live_system, prepare, room, undo, windows_space};
use crate::L10N;
use crate::live::iso::Entry;
use crate::live::source::Source;
use crate::plan::gap::{self, Head};
use crate::plan::layout::{self, Disk, Plan, Role};
use crate::plan::sizes;
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

fn without(disk: Disk, old: &[&MSFT_Partition]) -> Disk {
    let mut disk = disk;
    disk.partitions
        .retain(|span| !old.iter().any(|partition| partition.span() == *span));
    disk
}

fn replan(
    storage: &Storage,
    drive: &WindowsDrive,
    found: &Found,
    old: [&MSFT_Partition; 2],
    new: &[(Role, u64)],
) -> Result<(Plan, MSFT_Disk), String> {
    let layout = storage.layout(&drive.volume)?;
    if found.beside_windows(&layout) {
        let windows = storage.windows_plan(&layout, &drive.volume)?;
        let room = found.room().map_or(0, |room| room.size);
        let plan = layout::plan(&without(layout.plan_disk(), &old), &windows, room, new)
            .map_err(prepare::shortfall)?;
        return Ok((plan, layout.disk));
    }
    let disk = storage.disk(old[0].DiskNumber)?;
    let partitions = storage.partitions_of(disk.Number)?;
    let gap = gap::gaps(&without(room::disk_plan(&disk, &partitions), &old))
        .into_iter()
        .find(|gap| gap.offset <= old[0].Offset && old[0].Offset < gap.end())
        .ok_or_else(|| t!(L10N, "drive-partitions-gone"))?;
    let head = match (found.moving_box.as_ref(), found.room()) {
        (Some(_), Some(room)) => Head::Kept(room),
        _ => Head::Room {
            smallest: sizes::smallest_luft(storage::esp_size(&partitions, &found.made)),
        },
    };
    let plan = gap::inside(gap, head, new).map_err(room::gap_shortfall)?;
    Ok((plan, disk))
}

fn rebuild(
    context: &Context,
    storage: &Storage,
    drive: &WindowsDrive,
    found: &Found,
    old: [&MSFT_Partition; 2],
    entries: &[Entry],
    source: &Source,
) -> Result<(), String> {
    let handoff = found
        .handoff
        .as_ref()
        .ok_or_else(|| t!(L10N, "helper-no-room-yet"))?;
    let (plan, disk) = replan(
        storage,
        drive,
        found,
        old,
        &live_system::partitions(entries),
    )?;
    let live = old[1]
        .volume_path()
        .ok_or_else(|| t!(L10N, "drive-live-no-volume"))?;
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
    if let Some(size) = plan.windows_size {
        let windows = storage.layout(&drive.volume)?.windows;
        windows_space::shrink(context, storage, &windows, size)?;
    }
    let mut created = Vec::new();
    let moving_box = handoff.moving_box().map(str::to_owned);
    prepare::build(
        context,
        storage,
        &disk,
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
        .ok_or_else(|| t!(L10N, "drive-new-live-no-volume"))?;
    if let Err(error) = logs.put_back(&live) {
        eprintln!("The logs from Try Luft couldn't be kept: {error}");
    }
    Ok(())
}

pub fn refresh(context: &Context, source: &Source) -> Result<Prepared, String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let found = state::find(&storage.all_partitions()?);
    let (Some(handoff), Some(live)) = (found.handoff.clone(), found.live.clone()) else {
        return Err(t!(L10N, "helper-no-room-yet"));
    };
    let made = handoff
        .made_partitions()
        .ok_or_else(|| t!(L10N, "drive-partitions-not-noted"))?;
    let start = found
        .made_partition(&made.start)
        .cloned()
        .ok_or_else(|| t!(L10N, "drive-start-partition-gone"))?;
    let entries = live_system::listing(source)?.entries;
    let [(_, start_needed), (_, live_needed)] = live_system::partitions(&entries);
    if fits(&start, start_needed) && fits(&live, live_needed) {
        let start_path = start
            .volume_path()
            .ok_or_else(|| t!(L10N, "drive-start-no-volume"))?;
        let live_path = live
            .volume_path()
            .ok_or_else(|| t!(L10N, "drive-live-no-volume"))?;
        live_system::rewrite(context, source, &start_path, &live_path, &made.live)?;
    } else {
        rebuild(
            context,
            &storage,
            &drive,
            &found,
            [&start, &live],
            &entries,
            source,
        )?;
    }
    prepare::now_prepared(&storage)
}
