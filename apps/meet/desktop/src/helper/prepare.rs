use std::io;

use luft_meet::handoff::{LIVE_LABEL, START_LABEL};
use luft_meet::{Handoff, Intent, Room};

use super::drive::storage::{ESP_TYPE, Layout, MSFT_Partition, Storage};
use super::drive::{record, state, windows_drive};
use super::system::{facts, firmware, start_entries};
use super::{Context, undo};
use crate::check::rules;
use crate::live::download::Hashing;
use crate::live::files::{self, Place, Volumes};
use crate::live::iso::{self, Entry};
use crate::live::source::Source;
use crate::plan::layout::{self, Role};
use crate::plan::sizes;
use crate::protocol::{Prepared, Report, Stage};

const FAT32: &str = "FAT32";
const EXFAT: &str = "exFAT";

fn listing(source: &Source) -> Result<Vec<Entry>, String> {
    let opened = source.open().map_err(|error| error.to_string())?;
    let entries = iso::list(opened.reader).map_err(|error| error.to_string())?;
    if let Some(missing) = files::missing(&entries) {
        return Err(format!("The downloaded Luft is missing {missing}"));
    }
    Ok(entries)
}

fn meet_partitions(entries: &[Entry]) -> [(Role, u64); 2] {
    [
        (
            Role::Start,
            sizes::start(files::bytes_for(entries, Place::Start)),
        ),
        (
            Role::Live,
            sizes::live(files::bytes_for(entries, Place::Live)),
        ),
    ]
}

pub fn prepared(found: &state::Found) -> Option<Prepared> {
    let handoff = found.handoff.as_ref()?;
    Some(Prepared {
        room: handoff.room.map_or(0, |room| room.size),
        moving_box: found.moving_box.as_ref().map(|partition| partition.Size),
    })
}

pub fn check(source: &Source) -> Result<Report, String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let windows = storage.windows_plan(&layout, &drive.volume)?;
    let found = state::find(&layout);
    let facts = facts::gather(&storage, &layout, &windows, &drive.letter, &found);
    let live = listing(source)
        .inspect_err(|error| eprintln!("Luft's download isn't reachable: {error}"))
        .ok()
        .map(|entries| {
            meet_partitions(&entries)
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
        prepared: prepared(&found),
        facts,
    })
}

pub fn tidy() -> Result<(), String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let luft_entry = state::find(&layout).boot_entry;
    let stale: Vec<u16> = start_entries::stale(&storage.all_partitions()?, luft_entry)
        .iter()
        .map(|entry| entry.number)
        .collect();
    start_entries::remove(&stale)
}

fn write_live_system(
    context: &Context,
    source: &Source,
    volumes: &mut Volumes,
) -> Result<(), String> {
    let expected = source
        .checksum()
        .map_err(|error| format!("Luft's checksum couldn't be read: {error}"))?;
    let opened = source.open().map_err(|error| error.to_string())?;
    let total = opened.total;
    let mut hashing = Hashing::new(opened.reader, |read| {
        context.progress(Stage::Downloading, read, total)
    });
    iso::extract(&mut hashing, volumes)
        .map_err(|error: io::Error| format!("Luft couldn't be downloaded: {error}"))?;
    volumes.finish().map_err(|error| error.to_string())?;
    if expected.is_some_and(|expected| hashing.digest() != expected) {
        return Err("The download was damaged on the way. Try again.".to_owned());
    }
    Ok(())
}

fn build(
    context: &Context,
    storage: &Storage,
    layout: &Layout,
    plan: &layout::Plan,
    source: &Source,
    created: &mut Vec<MSFT_Partition>,
) -> Result<Prepared, String> {
    context.progress(Stage::Partitioning, 0, 2);
    let [start, live] = [Role::Start, Role::Live].map(|role| {
        plan.partitions
            .iter()
            .find(|new| new.role == role)
            .expect("both partitions are planned")
            .span
    });
    let start = storage.create(layout, start)?;
    created.push(start.clone());
    record::made_partition(&start.guid().ok_or("The start partition has no GUID")?)?;
    let start_path = storage.format(&start, FAT32, START_LABEL, None)?;
    context.progress(Stage::Partitioning, 1, 2);
    let live = storage.create(layout, live)?;
    created.push(live.clone());
    record::made_partition(&live.guid().ok_or("The live partition has no GUID")?)?;
    let live_path = storage.format(&live, EXFAT, LIVE_LABEL, None)?;
    context.progress(Stage::Partitioning, 2, 2);
    let live_guid = live.guid().ok_or("The live partition has no GUID")?;
    let start_guid = start.guid().ok_or("The start partition has no GUID")?;
    write_live_system(
        context,
        source,
        &mut Volumes::new(start_path.clone(), live_path.clone()),
    )?;
    files::write_grub_configs(&start_path, &live_guid).map_err(|error| error.to_string())?;
    storage.set_type(&start, ESP_TYPE)?;
    let partition = firmware::partition_on_disk(
        layout.disk.Number,
        layout.disk.LogicalSectorSize as u64,
        &start_guid,
    )?;
    let boot_entry = start_entries::add(&partition)?;
    record::set_boot_entry(Some(boot_entry))?;
    let handoff = Handoff {
        intent: Intent::Try,
        start: start_guid,
        live: live_guid,
        moving_box: None,
        room: Some(Room {
            offset: plan.room.offset,
            size: plan.room.size,
        }),
        boot_entry,
    };
    state::write_handoff(&live_path, &handoff)?;
    Ok(Prepared {
        room: plan.room.size,
        moving_box: None,
    })
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
    let entries = listing(source)?;
    let plan = layout::plan(
        &layout.plan_disk(),
        &windows,
        luft,
        &meet_partitions(&entries),
    )
    .map_err(|shortfall| {
        format!(
            "Windows can give up {} GB, and Luft needs {} GB.",
            shortfall.available >> 30,
            shortfall.needed.div_ceil(1 << 30)
        )
    })?;
    if plan.windows_size < layout.windows.Size {
        context.progress(Stage::Shrinking, 0, 1);
        storage.resize(&layout.windows, plan.windows_size)?;
        context.progress(Stage::Shrinking, 1, 1);
    }
    let layout = storage.layout(&drive.volume)?;
    let mut created = Vec::new();
    build(context, &storage, &layout, &plan, source, &mut created).inspect_err(|_| {
        if let Err(error) = undo::give_back(context, &storage, &drive, &created) {
            eprintln!("Cleaning up after a failed start didn't work: {error}");
        }
    })
}
