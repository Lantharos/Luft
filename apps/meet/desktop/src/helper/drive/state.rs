use std::fs;
use std::path::{Path, PathBuf};

use luft_meet::handoff;
use luft_meet::regional::Hints;
use luft_meet::{Handoff, Intent};

use crate::protocol::WindowsChoices;

use super::bitlocker::BitLocker;
use super::record::{self, Made};
use super::storage::{Layout, MSFT_Partition, Storage};
use super::windows_drive;
use crate::boot::entries;
use crate::helper::live_system;
use crate::helper::system::{firmware, settings, start_entries};
use crate::live::durable;

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

pub fn find(layout: &Layout) -> Found {
    let record = Made::read();
    let made: Vec<MSFT_Partition> = layout
        .partitions
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
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let found = find(&layout);
    let (Some(mut handoff), Some(live)) = (found.handoff.clone(), found.live_path()) else {
        return Err("Luft isn't ready to start yet. Make room for it first.".to_owned());
    };
    if live_system::unfinished(&live) {
        return Err("Updating Luft didn't finish. Update it again first.".to_owned());
    }
    let made = handoff
        .made_partitions()
        .ok_or("Luft's partitions are missing from Meet Luft's notes")?;
    found
        .made_partition(&made.start)
        .ok_or("Luft's start partition isn't one Meet Luft made")?;
    let start = firmware::partition_on_disk(
        layout.disk.Number,
        layout.disk.LogicalSectorSize as u64,
        &made.start,
    )?;
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
