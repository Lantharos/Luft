use std::path::Path;

use anyhow::Result;

use super::esp::{self, Esp};
use super::files::{self, SECOND_STAGE, SHIM};
use super::{entry, fallback, partition};
use crate::keys::{self, mok};
use crate::system::firmware::efi;

const BOOT_MENU: &str = "/usr/lib/sushi/efi/SushiBoot.efi";
const FOLDER: &str = "EFI/luft";
const REMOVABLE: &str = "EFI/BOOT";
const REMOVABLE_SHIM: &str = "BOOTX64.EFI";
const CERTIFICATE: &str = "luft.cer";
const LOADER_CONF: &str = "loader/loader.conf";
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

const MENU_NOTE: &str = "# SushiBoot shows its menu by itself when it finds another system, such as Windows. \
timeout 0 hides it, and a number of seconds always shows it.";

// Luft used to hide the menu everywhere with `timeout 0`. The first time
// round, that line goes and the note explains what timeout does now; after
// that the file is left as it is, so a timeout set by hand stays.
fn menu_conf(existing: &str) -> Option<String> {
    if existing.lines().any(|line| line.trim() == MENU_NOTE) {
        return None;
    }
    let kept = existing
        .lines()
        .filter(|line| line.split_whitespace().collect::<Vec<_>>() != ["timeout", "0"]);
    Some(
        std::iter::once(MENU_NOTE)
            .chain(kept)
            .map(|line| format!("{line}\n"))
            .collect(),
    )
}

fn show_menu(esp: &Esp) -> Result<()> {
    let path = esp.file(LOADER_CONF);
    match menu_conf(&std::fs::read_to_string(&path).unwrap_or_default()) {
        Some(contents) => files::write(&path, contents.as_bytes()),
        None => Ok(()),
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
    show_menu(esp)?;
    changed |= place_fallback(esp)?;
    if efi::booted_with_uefi() {
        entry::ensure(esp, LABEL, LOADER)?;
        entry::put_first(&[LABEL, FALLBACK_LABEL])?;
    }
    Ok(changed)
}

pub fn install(esp: Option<&Path>) -> Result<()> {
    let esp = match esp {
        Some(path) => esp::at(path)?,
        None => esp::find()?,
    };
    place(&esp).map(drop)
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

#[cfg(test)]
mod tests {
    use super::{MENU_NOTE, menu_conf};

    #[test]
    fn drops_the_timeout_that_hid_the_menu() {
        assert_eq!(menu_conf("timeout 0\n").unwrap(), format!("{MENU_NOTE}\n"));
        assert_eq!(menu_conf("").unwrap(), format!("{MENU_NOTE}\n"));
    }

    #[test]
    fn keeps_the_rest() {
        assert_eq!(
            menu_conf("# mine\ndefault luft-*\ntimeout  0\n").unwrap(),
            format!("{MENU_NOTE}\n# mine\ndefault luft-*\n")
        );
        assert_eq!(
            menu_conf("timeout 3\n").unwrap(),
            format!("{MENU_NOTE}\ntimeout 3\n")
        );
    }

    #[test]
    fn leaves_the_file_alone_once_noted() {
        assert_eq!(menu_conf(&format!("{MENU_NOTE}\ntimeout 0\n")), None);
    }
}
