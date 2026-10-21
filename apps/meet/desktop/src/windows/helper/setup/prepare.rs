use luft_i18n::t;
use luft_meet::handoff::{LIVE_LABEL, START_LABEL};
use luft_meet::regional::Hints;
use luft_meet::{Handoff, Intent, Made, Partitions, Room};

use super::{live_system, room, undo};
use crate::L10N;
use crate::check::common::LIVE_ESTIMATE;
use crate::check::facts::Facts;
use crate::check::rules;
use crate::live::source::Source;
use crate::plan::layout::{self, Role};
use crate::plan::places;
use crate::protocol::{Prepared, Report, Stage};
use crate::windows::helper::Context;
use crate::windows::helper::drive::storage::{
    BASIC_TYPE, ESP_TYPE, MSFT_Disk, MSFT_Partition, Storage,
};
use crate::windows::helper::drive::{record, state, windows_drive};
use crate::windows::helper::system::{facts, firmware, start_entries};

const FAT32: &str = "FAT32";
const EXFAT: &str = "exFAT";

fn other_drive(storage: &Storage, found: &state::Found) -> Option<String> {
    let live = found.live.as_ref()?;
    let windows = windows_drive::find()
        .and_then(|drive| storage.layout(&drive.volume))
        .ok()?;
    if live.DiskNumber == windows.disk.Number {
        return None;
    }
    Some(
        storage
            .disk(live.DiskNumber)
            .ok()?
            .FriendlyName?
            .trim()
            .to_owned(),
    )
}

pub fn prepared(storage: &Storage, found: &state::Found) -> Option<Prepared> {
    let handoff = found.handoff.as_ref()?;
    Some(Prepared {
        room: handoff.room().map_or(0, |room| room.size),
        moving_box: found.moving_box.as_ref().map(|partition| partition.Size),
        drive: other_drive(storage, found),
    })
}

pub fn now_prepared(storage: &Storage) -> Result<Prepared, String> {
    prepared(storage, &state::find(&storage.all_partitions()?))
        .ok_or_else(|| t!(L10N, "drive-partitions-gone"))
}

pub fn check(source: &Source) -> Result<Report<Facts>, String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let windows = storage.windows_plan(&layout, &drive.volume)?;
    let found = state::find(&storage.all_partitions()?);
    let listing = live_system::listing(source)
        .inspect_err(|error| eprintln!("Luft's download isn't reachable: {error}"))
        .ok();
    let live = listing.as_ref().map(|listing| {
        live_system::partitions(&listing.entries)
            .iter()
            .map(|(_, size)| size)
            .sum::<u64>()
    });
    let survey = room::Survey {
        storage: &storage,
        drive: &drive,
        layout: &layout,
        windows,
    };
    let places = if found.handoff.is_some() {
        Vec::new()
    } else {
        room::places(&survey, live.unwrap_or(LIVE_ESTIMATE), source)?
    };
    let facts = facts::gather(&storage, &layout, &windows, &drive.letter, &found, places);
    Ok(Report {
        findings: rules::evaluate(&facts, live),
        live: live.unwrap_or(0),
        download: listing.map_or(0, |listing| listing.download),
        prepared: prepared(&storage, &found),
        outdated: found
            .live_path()
            .is_some_and(|live| live_system::outdated(&live, source)),
        facts,
    })
}

pub fn tidy() -> Result<(), String> {
    let storage = Storage::open()?;
    let luft_entry = state::find(&storage.all_partitions()?).boot_entry;
    start_entries::tidy(&start_entries::stale(
        &storage.all_partitions()?,
        luft_entry,
    ))
}

pub fn shortfall(shortfall: layout::Shortfall) -> String {
    t!(
        L10N,
        "helper-room-shortfall",
        available = shortfall.available >> 30,
        needed = shortfall.needed.div_ceil(1 << 30)
    )
}

pub fn build(
    context: &Context,
    storage: &Storage,
    disk: &MSFT_Disk,
    plan: &layout::Plan,
    source: &Source,
    moving_box: Option<String>,
    created: &mut Vec<MSFT_Partition>,
) -> Result<(), String> {
    context.progress(Stage::Partitioning, 0, 2);
    let [start, live] = [Role::Start, Role::Live].map(|role| {
        plan.partitions
            .iter()
            .find(|new| new.role == role)
            .expect("both partitions are planned")
            .span
    });
    let start = storage.create(disk, start, ESP_TYPE)?;
    created.push(start.clone());
    record::made_partition(
        &start
            .guid()
            .ok_or_else(|| t!(L10N, "drive-start-no-guid"))?,
    )?;
    let start_path = storage.format(&start, FAT32, START_LABEL, None)?;
    context.progress(Stage::Partitioning, 1, 2);
    let live = storage.create(disk, live, BASIC_TYPE)?;
    created.push(live.clone());
    record::made_partition(&live.guid().ok_or_else(|| t!(L10N, "drive-live-no-guid"))?)?;
    let live_path = storage.format(&live, EXFAT, LIVE_LABEL, None)?;
    context.progress(Stage::Partitioning, 2, 2);
    let live_guid = live.guid().ok_or_else(|| t!(L10N, "drive-live-no-guid"))?;
    let start_guid = start
        .guid()
        .ok_or_else(|| t!(L10N, "drive-start-no-guid"))?;
    live_system::write(context, source, &start_path, &live_path, &live_guid)?;
    let partition =
        firmware::partition_on_disk(disk.Number, disk.LogicalSectorSize as u64, &start_guid)?;
    let boot_entry = start_entries::add(&partition)?;
    record::set_boot_entry(Some(boot_entry))?;
    let handoff = Handoff {
        intent: Intent::Try,
        boot_entry,
        made: Made::Partitions(Partitions {
            start: start_guid,
            live: live_guid,
            moving_box,
            room: Some(Room {
                offset: plan.room.offset,
                size: plan.room.size,
                other_drive: windows_drive::find()
                    .and_then(|drive| storage.layout(&drive.volume))
                    .is_ok_and(|layout| layout.disk.Number != disk.Number),
            }),
        }),
        hints: Hints::default(),
    };
    state::write_handoff(&live_path, &handoff)
}

pub fn prepare(
    context: &Context,
    luft: u64,
    source: &Source,
    place: &str,
) -> Result<Prepared, String> {
    let storage = Storage::open()?;
    let found = state::find(&storage.all_partitions()?);
    if let Some(prepared) = prepared(&storage, &found) {
        return Ok(prepared);
    }
    if !found.made.is_empty() || found.boot_entry.is_some() {
        undo::undo(context)?;
        return prepare(context, luft, source, place);
    }
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let windows = if place == places::WINDOWS {
        storage.windows_plan(&layout, &drive.volume)?
    } else {
        storage.windows_usage(&layout, &drive.volume)?
    };
    let survey = room::Survey {
        storage: &storage,
        windows,
        drive: &drive,
        layout: &layout,
    };
    let entries = live_system::listing(source)?.entries;
    room::make(
        context,
        &survey,
        luft,
        place,
        &live_system::partitions(&entries),
        source,
    )
}
