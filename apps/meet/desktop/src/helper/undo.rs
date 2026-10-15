use super::Context;
use super::drive::storage::{MSFT_Partition, Storage};
use super::drive::windows_drive::{self, WindowsDrive};
use super::drive::{record, state};
use super::system::start_entries;
use crate::protocol::Stage;

pub fn give_back(
    context: &Context,
    storage: &Storage,
    drive: &WindowsDrive,
    partitions: &[MSFT_Partition],
) -> Result<(), String> {
    let steps = partitions.len() as u64 + 1;
    for (index, partition) in partitions.iter().enumerate() {
        context.progress(Stage::Removing, index as u64, steps);
        let partition = storage.refreshed(partition)?;
        storage.delete(&partition)?;
        if let Some(guid) = partition.guid() {
            record::removed_partition(&guid)?;
        }
    }
    let windows = storage.layout(&drive.volume)?.windows;
    let largest = storage.largest_windows(&windows)?;
    if largest > windows.Size {
        storage.resize(&windows, largest)?;
    }
    context.progress(Stage::Removing, steps, steps);
    Ok(())
}

pub fn undo(context: &Context) -> Result<(), String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let layout = storage.layout(&drive.volume)?;
    let found = state::find(&layout);
    if let Some(number) = found.boot_entry {
        start_entries::remove(&[number])?;
        record::set_boot_entry(None)?;
    }
    give_back(context, &storage, &drive, &found.made)
}
