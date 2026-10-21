use luft_i18n::t;

use super::details::{Measure, survey};
use super::{esp, request};
use crate::L10N;
use crate::boot::entries;
use crate::boot::load_option;
use crate::check::facts::StartEntry;
use crate::protocol::Stage;
use crate::serving::Context;
use crate::windows::helper::setup::undo;
use crate::windows::helper::system::firmware::Nvram;
use crate::windows::helper::system::start_entries;

const LOADERS: [&str; 2] = [r"\EFI\luft\", r"\EFI\luft-start\"];

fn starts_luft(file: &str) -> bool {
    let file = file.to_ascii_lowercase();
    LOADERS
        .iter()
        .any(|loader| file.starts_with(&loader.to_ascii_lowercase()))
}

fn start_entries() -> Result<Vec<StartEntry>, String> {
    Ok(entries::listed(&Nvram)?
        .into_iter()
        .filter_map(|(number, option)| Some((number, load_option::decode(&option)?)))
        .filter(|(_, decoded)| decoded.file.as_deref().is_some_and(starts_luft))
        .map(|(number, decoded)| StartEntry {
            number,
            name: decoded.description,
            windows_object: decoded.windows_object,
        })
        .collect())
}

pub fn remove(context: &Context) -> Result<(), String> {
    let survey = survey(Measure::Quickly)?.ok_or_else(|| t!(L10N, "luft-gone"))?;
    request::clear()?;
    start_entries::tidy(&start_entries()?)?;
    let cleaned = esp::clean_all(&survey.partitions, survey.layout.disk.Number)?;
    let partitions: Vec<_> = cleaned
        .emptied
        .into_iter()
        .chain(survey.luft.partitions(&survey.partitions))
        .collect();
    let steps = partitions.len() as u64;
    for (index, partition) in partitions.into_iter().enumerate() {
        context.progress(Stage::Removing, index as u64, steps);
        survey
            .storage
            .delete(&survey.storage.refreshed(partition)?)?;
    }
    undo::undo(context)?;
    if survey.gap().is_some() {
        super::resize::extend_windows(&survey)?;
    }
    Ok(())
}
