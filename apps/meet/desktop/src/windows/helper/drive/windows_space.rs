use super::record::{self, Made};
use super::storage::{MSFT_Partition, Storage};
use super::windows_drive::WindowsDrive;
use crate::protocol::Stage;
use crate::windows::helper::Context;

pub fn shrink(
    context: &Context,
    storage: &Storage,
    windows: &MSFT_Partition,
    size: u64,
) -> Result<(), String> {
    record::windows_shrinks_from(windows.Size)?;
    context.progress(Stage::Shrinking, 0, 1);
    storage.resize(windows, size)?;
    context.progress(Stage::Shrinking, 1, 1);
    Ok(())
}

pub fn give_back(storage: &Storage, drive: &WindowsDrive) -> Result<(), String> {
    let Some(before) = Made::read().windows_size else {
        return Ok(());
    };
    let layout = storage.layout(&drive.volume)?;
    let windows = &layout.windows;
    let size = (windows.Size + layout.free_after_windows()).min(before);
    if size > windows.Size {
        storage.resize(windows, size)?;
    }
    record::forget_windows_size()
}
