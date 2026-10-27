use std::path::Path;

use luft_i18n::t;

use super::{prepare, undo};
use crate::L10N;
use crate::check::places::Place;
use crate::live::source::Source;
use crate::plan::gap::{self, Head};
use crate::plan::layout::{self, Disk, Role, Shortfall, Span, Windows};
use crate::plan::places::{self, Inputs, Target};
use crate::plan::sizes;
use crate::protocol::Stage;
use crate::protocol::answers::Prepared;
use crate::windows::helper::Context;
use crate::windows::helper::drive::bitlocker::BitLocker;
use crate::windows::helper::drive::snapshot;
use crate::windows::helper::drive::storage::{self, Layout, MSFT_Disk, MSFT_Partition, Storage};
use crate::windows::helper::drive::windows_drive::WindowsDrive;
use crate::windows::helper::drive::windows_space;

pub struct Survey<'a> {
    pub storage: &'a Storage,
    pub drive: &'a WindowsDrive,
    pub layout: &'a Layout,
    pub windows: Windows,
}

fn iso_path(source: &Source) -> Option<&Path> {
    match source {
        Source::File { path } => Some(path),
        Source::Download { .. } => None,
    }
}

pub fn places(survey: &Survey, live: u64, source: &Source) -> Result<Vec<Place>, String> {
    let snapshot = snapshot::take()?;
    let protected = BitLocker::open()
        .map(|bitlocker| bitlocker.protected())
        .unwrap_or_default();
    Ok(places::find(&Inputs {
        storage: &snapshot,
        windows_disk: survey.layout.disk.Number,
        windows: survey.windows,
        live,
        protected: &protected,
        iso_disk: iso_path(source).and_then(|iso| snapshot::holding(&snapshot, iso)),
    }))
}

pub fn gap_shortfall(shortfall: Shortfall) -> String {
    t!(
        L10N,
        "helper-gap-shortfall",
        available = shortfall.available >> 30,
        needed = shortfall.needed.div_ceil(1 << 30)
    )
}

pub fn disk_plan(disk: &MSFT_Disk, partitions: &[MSFT_Partition]) -> Disk {
    Disk {
        size: disk.Size,
        partitions: partitions.iter().map(MSFT_Partition::span).collect(),
    }
}

fn beside_windows(
    context: &Context,
    survey: &Survey,
    luft: u64,
    new: &[(Role, u64)],
    source: &Source,
) -> Result<Prepared, String> {
    let Survey {
        storage,
        drive,
        layout,
        windows,
    } = survey;
    if luft < sizes::smallest_luft(layout.esp_size(&[])) {
        return Err(t!(L10N, "helper-room-too-small"));
    }
    let plan = layout::plan(&layout.plan_disk(), windows, luft, new).map_err(prepare::shortfall)?;
    if let Some(size) = plan.windows_size {
        windows_space::shrink(context, storage, &layout.windows, size)?;
    }
    let mut created = Vec::new();
    prepare::build(
        context,
        storage,
        &layout.disk,
        &plan,
        source,
        None,
        &mut created,
    )
    .inspect_err(|_| {
        if let Err(error) = undo::give_back(context, storage, drive, &created) {
            eprintln!("Cleaning up after a failed start didn't work: {error}");
        }
    })?;
    prepare::now_prepared(storage)
}

fn into_gap(
    context: &Context,
    survey: &Survey,
    disk: &MSFT_Disk,
    span: Span,
    new: &[(Role, u64)],
    source: &Source,
) -> Result<Prepared, String> {
    let partitions = survey.storage.partitions_of(disk.Number)?;
    let smallest = sizes::smallest_luft(storage::esp_size(&partitions, &[]));
    let plan = gap::inside(span, Head::Room { smallest }, new).map_err(gap_shortfall)?;
    let mut created = Vec::new();
    prepare::build(
        context,
        survey.storage,
        disk,
        &plan,
        source,
        None,
        &mut created,
    )
    .inspect_err(|_| {
        if let Err(error) = undo::give_back(context, survey.storage, survey.drive, &created) {
            eprintln!("Cleaning up after a failed start didn't work: {error}");
        }
    })?;
    prepare::now_prepared(survey.storage)
}

fn erase(context: &Context, storage: &Storage, number: u32) -> Result<(MSFT_Disk, Span), String> {
    context.progress(Stage::Erasing, 0, 1);
    let disk = storage.erase(&storage.disk(number)?)?;
    context.progress(Stage::Erasing, 1, 1);
    let partitions = storage.partitions_of(disk.Number)?;
    let span = gap::gaps(&disk_plan(&disk, &partitions))
        .into_iter()
        .max_by_key(|gap| gap.size)
        .ok_or_else(|| t!(L10N, "drive-erased-no-room"))?;
    Ok((disk, span))
}

pub fn make(
    context: &Context,
    survey: &Survey,
    luft: u64,
    place: &str,
    new: &[(Role, u64)],
    source: &Source,
) -> Result<Prepared, String> {
    let live = new.iter().map(|(_, size)| sizes::align_up(*size)).sum();
    if !places(survey, live, source)?
        .iter()
        .any(|offered| offered.id == place)
    {
        return Err(t!(L10N, "helper-place-gone"));
    }
    let snapshot = snapshot::take()?;
    match places::target(&snapshot, place).ok_or_else(|| t!(L10N, "helper-place-gone"))? {
        Target::Windows => beside_windows(context, survey, luft, new, source),
        Target::Gap { disk, span } => {
            let disk = survey.storage.disk(disk)?;
            into_gap(context, survey, &disk, span, new, source)
        }
        Target::Whole { disk } => {
            let (disk, span) = erase(context, survey.storage, disk)?;
            into_gap(context, survey, &disk, span, new, source)
        }
    }
}
