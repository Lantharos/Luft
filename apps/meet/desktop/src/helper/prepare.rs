use luft_meet::handoff::{LIVE_LABEL, START_LABEL};
use luft_meet::regional::Hints;
use luft_meet::{Handoff, Intent, Made, Partitions, Room};

use super::drive::storage::{BASIC_TYPE, ESP_TYPE, Layout, MSFT_Partition, Storage};
use super::drive::{record, state, windows_drive};
use super::system::{facts, firmware, start_entries};
use super::{Context, live_system, undo};
use crate::check::facts::Facts;
use crate::check::rules;
use crate::live::source::Source;
use crate::plan::layout::{self, Role};
use crate::plan::sizes;
use crate::protocol::{Prepared, Report, Stage};

const FAT32: &str = "FAT32";
const EXFAT: &str = "exFAT";

pub fn prepared(found: &state::Found) -> Option<Prepared> {
    let handoff = found.handoff.as_ref()?;
    Some(Prepared {
        room: handoff.room().map_or(0, |room| room.size),
        moving_box: found.moving_box.as_ref().map(|partition| partition.Size),
    })
}

pub fn check(source: &Source) -> Result<Report<Facts>, String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let windows = storage.windows_plan(&layout, &drive.volume)?;
    let found = state::find(&layout);
    let facts = facts::gather(&storage, &layout, &windows, &drive.letter, &found);
    let listing = live_system::listing(source)
        .inspect_err(|error| eprintln!("Luft's download isn't reachable: {error}"))
        .ok();
    let live = listing.as_ref().map(|listing| {
        live_system::partitions(&listing.entries)
            .iter()
            .map(|(_, size)| size)
            .sum::<u64>()
    });
    let smallest_luft = sizes::smallest_luft(facts.esp_size);
    Ok(Report {
        findings: rules::evaluate(&facts, live),
        most_luft: facts.most_room.saturating_sub(live.unwrap_or(0)),
        smallest_luft,
        live: live.unwrap_or(0),
        download: listing.map_or(0, |listing| listing.download),
        prepared: prepared(&found),
        outdated: found
            .live_path()
            .is_some_and(|live| live_system::outdated(&live, source)),
        facts,
    })
}

pub fn tidy() -> Result<(), String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let luft_entry = state::find(&layout).boot_entry;
    start_entries::tidy(&start_entries::stale(
        &storage.all_partitions()?,
        luft_entry,
    ))
}

pub fn shortfall(shortfall: layout::Shortfall) -> String {
    format!(
        "Windows can give up {} GB, and Luft needs {} GB.",
        shortfall.available >> 30,
        shortfall.needed.div_ceil(1 << 30)
    )
}

pub fn build(
    context: &Context,
    storage: &Storage,
    layout: &Layout,
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
    let start = storage.create(layout, start, ESP_TYPE)?;
    created.push(start.clone());
    record::made_partition(&start.guid().ok_or("The start partition has no GUID")?)?;
    let start_path = storage.format(&start, FAT32, START_LABEL, None)?;
    context.progress(Stage::Partitioning, 1, 2);
    let live = storage.create(layout, live, BASIC_TYPE)?;
    created.push(live.clone());
    record::made_partition(&live.guid().ok_or("The live partition has no GUID")?)?;
    let live_path = storage.format(&live, EXFAT, LIVE_LABEL, None)?;
    context.progress(Stage::Partitioning, 2, 2);
    let live_guid = live.guid().ok_or("The live partition has no GUID")?;
    let start_guid = start.guid().ok_or("The start partition has no GUID")?;
    live_system::write(context, source, &start_path, &live_path, &live_guid)?;
    let partition = firmware::partition_on_disk(
        layout.disk.Number,
        layout.disk.LogicalSectorSize as u64,
        &start_guid,
    )?;
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
            }),
        }),
        hints: Hints::default(),
    };
    state::write_handoff(&live_path, &handoff)
}

pub fn prepare(context: &Context, luft: u64, source: &Source) -> Result<Prepared, String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let found = state::find(&layout);
    if let Some(prepared) = prepared(&found) {
        return Ok(prepared);
    }
    if !found.made.is_empty() || found.boot_entry.is_some() {
        undo::undo(context)?;
        return prepare(context, luft, source);
    }
    let windows = storage.windows_plan(&layout, &drive.volume)?;
    if luft < sizes::smallest_luft(layout.esp_size(&found.made)) {
        return Err("Luft needs more room than that.".to_owned());
    }
    let entries = live_system::listing(source)?.entries;
    let plan = layout::plan(
        &layout.plan_disk(),
        &windows,
        luft,
        &live_system::partitions(&entries),
    )
    .map_err(shortfall)?;
    if plan.windows_size < layout.windows.Size {
        context.progress(Stage::Shrinking, 0, 1);
        storage.resize(&layout.windows, plan.windows_size)?;
        context.progress(Stage::Shrinking, 1, 1);
    }
    let layout = storage.layout(&drive.volume)?;
    let mut created = Vec::new();
    build(
        context,
        &storage,
        &layout,
        &plan,
        source,
        None,
        &mut created,
    )
    .inspect_err(|_| {
        if let Err(error) = undo::give_back(context, &storage, &drive, &created) {
            eprintln!("Cleaning up after a failed start didn't work: {error}");
        }
    })?;
    Ok(Prepared {
        room: plan.room.size,
        moving_box: None,
    })
}
