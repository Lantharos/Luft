pub mod firmware;
mod image;
mod linux;

use crate::entries::{Action, BootEntry};

pub fn start(entry: &BootEntry) -> uefi::Result<()> {
    match &entry.action {
        Action::Linux {
            linux,
            initrd,
            options,
        } => linux::start(entry.volume, linux, initrd.as_deref(), options),
        Action::Efi { path, options } => image::start(image::load(entry.volume, path)?, options),
        Action::FirmwareSetup => firmware::reboot_to_setup(),
    }
}
