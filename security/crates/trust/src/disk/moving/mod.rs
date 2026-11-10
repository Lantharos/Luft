mod boot_files;
mod copy;
mod earlier;
mod finish;
mod initrd;
mod prepare;
mod request;

use std::path::Path;

use anyhow::{Result, bail};
use luft_disks::moving::SMALLEST_SYSTEM;
use luft_meet::resize::needed;

use super::layout::parts::{btrfs, halves};
use super::{SystemDisk, encrypting, layout};
use crate::boot::startup;
use crate::errors::Unsupported;
use crate::system::firmware::efi;
use crate::system::host::blocks;
use earlier::Earlier;
use finish::Failure;
use request::{Asked, Stage};

pub use earlier::remove as remove_earlier;
pub use finish::{at_start, confirmed};
pub use initrd::copy_at_start;
pub use prepare::Place;

#[derive(Clone, Copy, Default)]
pub struct Needs {
    pub luft: u64,
    pub copies: u64,
}

#[derive(Default)]
pub struct Status {
    pub stage: Option<&'static str>,
    pub to: String,
    pub failed: Option<Failure>,
    pub refused: Option<String>,
    pub needs: Needs,
    pub earlier: Option<Earlier>,
}

fn retire(device: &Path) {
    if let Err(error) = halves::retire(device) {
        eprintln!("{} couldn't be erased: {error:#}", device.display());
    }
}

fn needs(disk: &SystemDisk) -> Option<Needs> {
    let filesystem = btrfs_uuid(disk)?;
    let allocated = btrfs::allocated(&filesystem).ok()?;
    Some(Needs {
        luft: needed(allocated).max(SMALLEST_SYSTEM),
        copies: btrfs::used(&filesystem).ok()?,
    })
}

fn btrfs_uuid(disk: &SystemDisk) -> Option<String> {
    let name = blocks::kernel_name(&disk.root.source)?;
    blocks::fs_uuid(&name)
}

fn refused(disk: &SystemDisk) -> Option<String> {
    if encrypting::underway() {
        return Some("Luft is being encrypted. Move it once that's done.".to_owned());
    }
    if !efi::booted_with_uefi() || !startup::installed() {
        return Some(
            "Luft only moves on computers it starts on with its own boot menu.".to_owned(),
        );
    }
    if layout::waiting(disk).is_some() || layout::claim().is_err() {
        return Some(
            "Luft waits to change its size. Let that finish or call it off first.".to_owned(),
        );
    }
    if disk.root.fstype != "btrfs" {
        return Some("Luft's partition doesn't hold the file system Luft installs.".to_owned());
    }
    if btrfs_uuid(disk).is_none_or(|uuid| btrfs::devices(&uuid) != 1) {
        return Some("Luft's file system spans more than one partition right now.".to_owned());
    }
    if let Some(earlier) = Earlier::load() {
        return Some(format!(
            "Remove Luft's earlier copy on {} first.",
            earlier.drive
        ));
    }
    None
}

pub fn status(disk: &SystemDisk) -> Status {
    let request = Asked::load();
    Status {
        stage: request.as_ref().map(|request| match request.stage {
            Stage::Waiting => "waiting",
            Stage::Copied => "copied",
            Stage::Failed => "failed",
        }),
        to: request
            .map(|request| request.to.name.clone())
            .unwrap_or_default(),
        failed: Failure::load(),
        refused: refused(disk),
        needs: needs(disk).unwrap_or_default(),
        earlier: Earlier::load(),
    }
}

pub fn request(drive: &str, place: Place) -> Result<()> {
    let disk = SystemDisk::find()?;
    if Asked::load().is_some() {
        bail!(Unsupported(
            "Luft already waits to move. Call that off first.".to_owned()
        ));
    }
    if let Some(reason) = refused(&disk) {
        bail!(Unsupported(reason));
    }
    let needs =
        needs(&disk).ok_or_else(|| Unsupported("Luft couldn't tell how full it is.".to_owned()))?;
    let _working = layout::claim()?;
    Failure::forget();
    prepare::prepare(drive, place, needs)
}

pub fn cancel() -> Result<()> {
    finish::cancel()
}

pub fn forget_failure() {
    Failure::forget();
}
