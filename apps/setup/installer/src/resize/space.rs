use anyhow::{Context, Result};
use luft_meet::resize::{SPACE, Space};

use super::{btrfs, disk, variables};

const NOTICEABLE: u64 = 1 << 30;

pub fn report() -> Result<()> {
    let device = disk::root_device()?;
    let disk = disk::holding(&device)?;
    let root = disk
        .holding(&device)
        .context("Luft's partition isn't on its drive")?;
    let space = Space {
        partition: root.uuid.clone(),
        allocated: btrfs::allocated(&root.fs_uuid)?,
    };
    let known = variables::read(SPACE)?.and_then(|bytes| Space::parse(&bytes));
    let unchanged = known.is_some_and(|known| {
        known.partition == space.partition && known.allocated.abs_diff(space.allocated) < NOTICEABLE
    });
    if unchanged {
        return Ok(());
    }
    variables::write(SPACE, &space.to_bytes())
}
