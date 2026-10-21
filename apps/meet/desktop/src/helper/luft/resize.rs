use luft_i18n::t;
use luft_meet::resize::{Change, Request};

use super::details::{Installed, Measure, Survey, survey};
use super::request;
use crate::L10N;
use crate::boot::entries;
use crate::boot::load_option;
use crate::helper::drive::record::{self, Made};
use crate::helper::drive::windows_drive;
use crate::helper::system::firmware::{self, Nvram};
use crate::plan::resize::Range;
use crate::plan::sizes::align_up;
use crate::protocol::Stage;
use crate::serving::Context;

const LOADER: &str = r"\EFI\luft\shimx64.efi";
const LABEL: &str = "Luft";

fn found() -> Result<Survey, String> {
    survey(Measure::Quickly)?.ok_or_else(|| t!(L10N, "luft-gone"))
}

fn measured() -> Result<Survey, String> {
    survey(Measure::WhatWindowsCanSpare)?.ok_or_else(|| t!(L10N, "luft-gone"))
}

pub fn range() -> Result<Option<Range>, String> {
    let survey = measured()?;
    Ok(survey
        .range()
        .filter(|_| survey.describe().blocked.is_none()))
}

fn forget_what_is_gone(survey: &Survey) -> Result<(), String> {
    let partitions: Vec<String> = survey
        .partitions
        .iter()
        .filter_map(|partition| partition.guid())
        .collect();
    let boot_entry = Made::read().boot_entry;
    let exists = boot_entry
        .is_some_and(|number| entries::entry(&Nvram, number).is_ok_and(|entry| entry.is_some()));
    record::forget_missing(&partitions, exists)
}

pub fn details() -> Result<Option<Installed>, String> {
    let Some(survey) = survey(Measure::Quickly)? else {
        return Ok(None);
    };
    forget_what_is_gone(&survey)?;
    Ok(Some(survey.describe()))
}

pub fn resize(context: &Context, size: u64) -> Result<Installed, String> {
    let quick = found()?;
    let current = quick.luft.root.size;
    let survey = if size > current { measured()? } else { quick };
    let range = survey
        .range()
        .filter(|_| survey.describe().blocked.is_none());
    let (Some(range), Some(gap)) = (range, survey.gap()) else {
        return Err(t!(L10N, "luft-not-resizable"));
    };
    if !range.allows(current, size) {
        return Err(t!(L10N, "luft-size-not-allowed"));
    }
    let change = if size > current {
        let taken = align_up((size - current).saturating_sub(gap));
        if taken > 0 {
            context.progress(Stage::Shrinking, 0, 1);
            survey.storage.resize(
                &survey.layout.windows,
                survey.windows.partition.size - taken,
            )?;
            context.progress(Stage::Shrinking, 1, 1);
        }
        Change::Grow
    } else {
        Change::Shrink {
            bytes: current - size,
        }
    };
    request::write(&Request {
        change,
        partition: survey.luft.partition.clone(),
    })?;
    Ok(found()?.describe())
}

pub fn cancel() -> Result<Installed, String> {
    let survey = found()?;
    let pending = survey.pending();
    request::clear()?;
    if pending == Some(Change::Grow) {
        extend_windows(&survey)?;
    }
    Ok(found()?.describe())
}

pub fn extend_windows(survey: &Survey) -> Result<(), String> {
    let layout = survey.storage.layout(&windows_drive::find()?.volume)?;
    let free = layout.free_after_windows();
    if free > 0 {
        survey
            .storage
            .resize(&layout.windows, layout.windows.Size + free)?;
    }
    Ok(())
}

pub fn give_windows() -> Result<Installed, String> {
    let survey = found()?;
    if survey.pending() == Some(Change::Grow) {
        return Err(t!(L10N, "luft-space-promised"));
    }
    extend_windows(&survey)?;
    Ok(found()?.describe())
}

fn start_entry(survey: &Survey) -> Result<u16, String> {
    let listed = entries::listed(&Nvram)?;
    let existing = listed.iter().find_map(|(number, option)| {
        let decoded = load_option::decode(option)?;
        decoded
            .file
            .is_some_and(|file| file.eq_ignore_ascii_case(LOADER))
            .then_some(*number)
    });
    if let Some(number) = existing {
        return Ok(number);
    }
    let esp = super::esp::holding_luft(&survey.partitions)
        .ok_or_else(|| t!(L10N, "luft-no-start-entry"))?;
    let disk = survey.storage.disk(esp.DiskNumber)?;
    let guid = esp
        .guid()
        .ok_or_else(|| t!(L10N, "drive-guid-unreadable"))?;
    let partition =
        firmware::partition_on_disk(disk.Number, u64::from(disk.LogicalSectorSize), &guid)?;
    entries::add(&Nvram, &partition, LOADER, LABEL)
}

pub fn start() -> Result<(), String> {
    let survey = found()?;
    let number = start_entry(&survey)?;
    entries::boot_next(&Nvram, number)?;
    firmware::restart()
}
