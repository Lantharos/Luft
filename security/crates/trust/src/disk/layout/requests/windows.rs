use anyhow::{Context, Result, bail};
use luft_meet::resize::{Request, SPACE, STARTUP_TYPE, Space, VARIABLE};

use super::super::journal::Journal;
use super::super::parts::{btrfs, drive, halves};
use super::super::plan::{self, Layout};
use crate::system::firmware::efi;
use crate::system::secrets::secret::Secret;

const NOTICEABLE: u64 = 1 << 30;

pub fn report() -> Result<()> {
    let device = drive::system_partition()?;
    let disk = drive::holding(&device)?;
    let root = disk
        .holding(&device)
        .context("Luft's partition isn't on its drive")?;
    let space = Space {
        partition: root.uuid.clone(),
        allocated: btrfs::allocated(&root.fs_uuid)?,
    };
    let known = efi::luft_variable(SPACE).and_then(|bytes| Space::parse(&bytes));
    let unchanged = known.is_some_and(|known| {
        known.partition == space.partition && known.allocated.abs_diff(space.allocated) < NOTICEABLE
    });
    if unchanged {
        return Ok(());
    }
    efi::set_luft_variable(SPACE, Some(&space.to_bytes()))
        .context("The firmware didn't keep how full Luft is")
}

fn layout(request: &Request) -> Result<(String, Layout)> {
    let device = drive::system_partition()?;
    let disk = drive::holding(&device)?;
    let root = disk
        .holding(&device)
        .context("Luft's partition isn't on its drive")?;
    if root.uuid != request.partition {
        bail!("The request is for another Luft");
    }
    if root.filesystem != "btrfs" {
        bail!("Luft's partition doesn't hold btrfs");
    }
    if root.luks_uuid.is_some() {
        halves::system_key(&Secret::default()).context(
            "Luft's drive only opens with a passphrase, which Luft can't type for itself",
        )?;
    }
    if btrfs::devices(&root.fs_uuid) != 1 {
        bail!("Luft's file system already spans more than one partition");
    }
    let startup = disk
        .before(root.span.offset)
        .filter(|part| part.kind == STARTUP_TYPE)
        .map(|part| (part.span, part.uuid.clone()));
    let block = startup
        .as_ref()
        .map_or(root.span.offset, |(span, _)| span.offset);
    let layout = Layout {
        root: root.span,
        root_uuid: root.uuid.clone(),
        luks_uuid: root.luks_uuid.clone(),
        free_before: disk.free_before(block),
        free_after: disk.free_after(root.span.end()),
        allocated: btrfs::allocated(&root.fs_uuid)?,
        startup,
    };
    Ok((disk.id.clone(), layout))
}

pub fn plan() -> Result<Option<Journal>> {
    let Some(bytes) = efi::luft_variable(VARIABLE) else {
        return Ok(None);
    };
    let request = Request::parse(&bytes)
        .map_err(anyhow::Error::msg)
        .context("Luft's resize request isn't readable")?;
    let (drive, layout) = layout(&request)?;
    Ok(Some(Journal::new(
        drive,
        plan::plan(&layout, request.change)?,
    )))
}

pub fn forget() -> Result<()> {
    efi::set_luft_variable(VARIABLE, None).context("Luft's resize request couldn't be cleared")
}
