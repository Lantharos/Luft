mod boot_next;
pub mod firmware;
mod image;
mod linux;

use crate::entries::{Action, BootEntry, WINDOWS};

pub fn start(entry: &BootEntry) -> uefi::Result<()> {
    match &entry.action {
        Action::Linux {
            linux,
            initrd,
            options,
        } => linux::start(entry.volume, linux, initrd.as_deref(), options),
        Action::Efi { path, options } => {
            // Without a firmware entry for Windows, it starts from here.
            if path.eq_ignore_ascii_case(WINDOWS) {
                let _ = boot_next::restart_into(entry.volume, path);
            }
            image::start(image::load(entry.volume, path)?, options)
        }
        Action::FirmwareSetup => firmware::reboot_to_setup(),
    }
}
