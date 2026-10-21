use std::fs;
use std::path::{Path, PathBuf};

use luft_i18n::t;
use luft_meet::handoff;
use luft_meet::regional::Hints;
use luft_meet::{Handoff, Intent};

use crate::L10N;
use crate::protocol::WindowsChoices;

use super::bitlocker::BitLocker;
use super::record::{self, Made};
use super::storage::{Layout, MSFT_Partition, Storage};
use crate::boot::entries;
use crate::live::durable;
use crate::plan::layout::Span;
use crate::windows::helper::live_system;
use crate::windows::helper::system::{firmware, settings, start_entries};

const LIVE_FOLDER: &str = "LiveOS";

pub struct Found {
    pub handoff: Option<Handoff>,
    pub live: Option<MSFT_Partition>,
    pub moving_box: Option<MSFT_Partition>,
    pub made: Vec<MSFT_Partition>,
    pub boot_entry: Option<u16>,
}

impl Found {
    pub fn live_path(&self) -> Option<PathBuf> {
        self.live.as_ref()?.volume_path()
    }

    pub fn made_partition(&self, guid: &str) -> Option<&MSFT_Partition> {
        made_partition(&self.made, guid)
    }

    pub fn room(&self) -> Option<Span> {
        let room = self.handoff.as_ref()?.room()?;
        Some(Span {
            offset: room.offset,
            size: room.size,
        })
    }

    pub fn beside_windows(&self, layout: &Layout) -> bool {
        let windows = &layout.windows;
        self.live
            .as_ref()
            .is_some_and(|live| live.DiskNumber == windows.DiskNumber)
            && self
                .room()
                .is_some_and(|room| room.offset == windows.Offset + windows.Size)
    }
}

fn made_partition<'a>(made: &'a [MSFT_Partition], guid: &str) -> Option<&'a MSFT_Partition> {
    made.iter()
        .find(|partition| partition.guid().as_deref() == Some(guid))
}

fn holds_live_system(partition: &MSFT_Partition) -> bool {
    partition
        .volume_path()
        .is_some_and(|root| root.join(handoff::FILE).exists() || root.join(LIVE_FOLDER).exists())
}

pub fn read_handoff(live: &Path) -> Option<Handoff> {
    Handoff::parse(&fs::read_to_string(live.join(handoff::FILE)).ok()?).ok()
}

pub fn write_handoff(live: &Path, handoff: &Handoff) -> Result<(), String> {
    durable::write(&live.join(handoff::FILE), handoff.to_json().as_bytes())
        .map_err(|error| error.to_string())
}

pub fn find(partitions: &[MSFT_Partition]) -> Found {
    let record = Made::read();
    let made: Vec<MSFT_Partition> = partitions
        .iter()
        .filter(|partition| {
            partition
                .guid()
                .is_some_and(|guid| record.partitions.contains(&guid))
        })
        .cloned()
        .collect();
    let live = made
        .iter()
        .find(|partition| holds_live_system(partition))
        .cloned();
    let handoff = live
        .as_ref()
        .and_then(MSFT_Partition::volume_path)
        .and_then(|path| read_handoff(&path));
    let moving_box = handoff
        .as_ref()
        .and_then(Handoff::moving_box)
        .and_then(|guid| made_partition(&made, guid))
        .cloned();
    Found {
        boot_entry: record.boot_entry,
        handoff,
        live,
        moving_box,
        made,
    }
}

pub fn restart(intent: Intent, windows: WindowsChoices, hints: Hints) -> Result<(), String> {
    let storage = Storage::open()?;
    let found = find(&storage.all_partitions()?);
    let (Some(mut handoff), Some(live)) = (found.handoff.clone(), found.live_path()) else {
        return Err(t!(L10N, "helper-not-ready-to-start-windows"));
    };
    if live_system::unfinished(&live) {
        return Err(t!(L10N, "helper-update-unfinished"));
    }
    let made = handoff
        .made_partitions()
        .ok_or_else(|| t!(L10N, "drive-partitions-not-noted"))?;
    let start = found
        .made_partition(&made.start)
        .ok_or_else(|| t!(L10N, "drive-start-partition-foreign"))?;
    let disk = storage.disk(start.DiskNumber)?;
    let start =
        firmware::partition_on_disk(disk.Number, disk.LogicalSectorSize as u64, &made.start)?;
    let bitlocker = BitLocker::open()?;
    for path in found.made.iter().filter_map(MSFT_Partition::volume_path) {
        bitlocker.keep_readable(&path)?;
    }
    handoff.boot_entry = start_entries::ensure(&start, handoff.boot_entry)?;
    record::set_boot_entry(Some(handoff.boot_entry))?;
    handoff.intent = intent;
    handoff.hints = hints;
    write_handoff(&live, &handoff)?;
    settings::apply(windows)?;
    entries::boot_next(&firmware::Nvram, handoff.boot_entry)?;
    firmware::restart()
}
