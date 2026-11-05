use crate::protocol::Stage;
use crate::windows::helper::Context;
use crate::windows::helper::drive::storage::{MSFT_Partition, Storage};
use crate::windows::helper::drive::windows_drive::{self, WindowsDrive};
use crate::windows::helper::drive::windows_space;
use crate::windows::helper::drive::{record, state};
use crate::windows::helper::system::start_entries;

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
    windows_space::give_back(storage, drive)?;
    context.progress(Stage::Removing, steps, steps);
    Ok(())
}

pub fn undo(context: &Context) -> Result<(), String> {
    let storage = Storage::open()?;
    let drive = windows_drive::find()?;
    let found = state::find(&storage.all_partitions()?);
    if let Some(number) = found.boot_entry {
        start_entries::remove(&[number])?;
        record::set_boot_entry(None)?;
    }
    give_back(context, &storage, &drive, &found.made)
}
