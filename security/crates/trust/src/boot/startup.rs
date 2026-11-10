use std::path::Path;

use anyhow::Result;

use super::esp::{self, Esp};
use super::files::{self, SECOND_STAGE, SHIM};
use super::{entry, fallback, partition};
use crate::keys::{self, mok};
use crate::system::firmware::efi::{self, SecureBoot};

const BOOT_MENU: &str = "/usr/lib/sushi/efi/SushiBoot.efi";
const FOLDER: &str = "EFI/luft";
const REMOVABLE: &str = "EFI/BOOT";
const REMOVABLE_SHIM: &str = "BOOTX64.EFI";
const CERTIFICATE: &str = "luft.cer";
const SYSTEMD_BOOT: &str = "EFI/systemd";
const BOOTCTL_FOLDERS: [&str; 3] = ["loader/keys", "loader/entries", "EFI/Linux"];
const LOADER: &str = "\\EFI\\luft\\shimx64.efi";
const LABEL: &str = "Luft";
const FALLBACK_LABEL: &str = "Luft without its key";

fn remove_systemd_boot(esp: &Esp) {
    let _ = std::fs::remove_dir_all(esp.file(SYSTEMD_BOOT));
    for folder in BOOTCTL_FOLDERS {
        let _ = std::fs::remove_dir(esp.file(folder));
    }
}

fn needs_fallback() -> bool {
    mok::enrollment() != mok::Enrollment::Enrolled
}

fn place_fallback(esp: &Esp) -> Result<bool> {
    let boot = partition::next_to(esp)?;
    if needs_fallback() {
        let changed = fallback::place(esp, &boot)?;
        if efi::booted_with_uefi() {
            entry::ensure(esp, FALLBACK_LABEL, fallback::LOADER)?;
        }
        Ok(changed)
    } else {
        fallback::remove(esp, &boot);
        if efi::booted_with_uefi() {
            entry::remove(FALLBACK_LABEL)?;
        }
        Ok(false)
    }
}

pub fn place(esp: &Esp) -> Result<bool> {
    let boot_menu = Path::new(BOOT_MENU);
    let mut changed = files::copy_if_changed(
        Path::new(keys::CERTIFICATE),
        &esp.file(&format!("{FOLDER}/{CERTIFICATE}")),
    )?;
    changed |= files::place_shim_after(boot_menu, &esp.file(FOLDER), SHIM)?;
    changed |= files::place_shim_after(boot_menu, &esp.file(REMOVABLE), REMOVABLE_SHIM)?;
    remove_systemd_boot(esp);
    changed |= place_fallback(esp)?;
    if efi::booted_with_uefi() {
        entry::ensure(esp, LABEL, LOADER)?;
        arrange()?;
    }
    Ok(changed)
}

fn waiting_for_key() -> Option<mok::Enrollment> {
    let enrollment = mok::enrollment();
    (efi::secure_boot() == SecureBoot::On && enrollment != mok::Enrollment::Enrolled)
        .then_some(enrollment)
}

fn entries_in_order() -> [&'static str; 2] {
    match waiting_for_key() {
        Some(mok::Enrollment::None) => [FALLBACK_LABEL, LABEL],
        _ => [LABEL, FALLBACK_LABEL],
    }
}

pub fn arrange() -> Result<()> {
    if !efi::booted_with_uefi() {
        return Ok(());
    }
    entry::put_first(&entries_in_order())?;
    if waiting_for_key() == Some(mok::Enrollment::Pending) {
        entry::start_next(FALLBACK_LABEL)?;
    }
    Ok(())
}

pub fn install(esp: Option<&Path>) -> Result<()> {
    let esp = match esp {
        Some(path) => esp::at(path)?,
        None => esp::find()?,
    };
    place(&esp)?;
    if efi::booted_with_uefi() {
        entry::start_next(entries_in_order()[0])?;
        arrange()?;
    }
    Ok(())
}

pub fn installed() -> bool {
    esp::find().is_ok_and(|esp| esp.file(&format!("{FOLDER}/{SECOND_STAGE}")).exists())
}

pub fn started_through_menu() -> bool {
    efi::boot_loader().is_some_and(|loader| loader.starts_with("SushiBoot"))
}

pub fn unavailable_reason() -> Option<&'static str> {
    if !Path::new(BOOT_MENU).exists() || !keys::shipped() {
        return Some("Luft's boot menu isn't installed.");
    }
    if esp::find().is_err() {
        return Some("This computer doesn't start from an EFI system partition.");
    }
    None
}

pub fn follow_up() -> Result<()> {
    if !installed() {
        return Ok(());
    }
    if place(&esp::find()?)? {
        eprintln!("Brought shim and Luft's boot menu on the EFI system partition up to date");
    }
    Ok(())
}
