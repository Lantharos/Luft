use std::path::{Path, PathBuf};

use anyhow::Result;

use super::esp::{self, Esp};
use super::files::{self, MOK_MANAGER, SECOND_STAGE, SHIM};
use super::{entry, fallback};
use crate::keys::{self, mok};
use crate::system::efi;

const BOOT_MENU: &str = "/usr/lib/sushi/efi/SushiBoot.efi";
const FOLDER: &str = "EFI/luft";
const REMOVABLE: &str = "EFI/BOOT";
const REMOVABLE_SHIM: &str = "BOOTX64.EFI";
const CERTIFICATE: &str = "luft.cer";
const LOADER_CONF: &str = "loader/loader.conf";
const SYSTEMD_BOOT: &str = "EFI/systemd";
const LOADER: &str = "\\EFI\\luft\\shimx64.efi";
const LABEL: &str = "Luft";
const FALLBACK_LABEL: &str = "Luft without its key";

fn placements() -> Result<Vec<(PathBuf, String)>> {
    let shim = files::shim_folder()?;
    let place = |source: PathBuf, folder: &str, name: &str| (source, format!("{folder}/{name}"));
    Ok(vec![
        place(shim.join(SHIM), FOLDER, SHIM),
        place(shim.join(MOK_MANAGER), FOLDER, MOK_MANAGER),
        place(PathBuf::from(BOOT_MENU), FOLDER, SECOND_STAGE),
        place(PathBuf::from(keys::CERTIFICATE), FOLDER, CERTIFICATE),
        place(shim.join(SHIM), REMOVABLE, REMOVABLE_SHIM),
        place(shim.join(MOK_MANAGER), REMOVABLE, MOK_MANAGER),
        place(PathBuf::from(BOOT_MENU), REMOVABLE, SECOND_STAGE),
    ])
}

fn hide_menu(esp: &Esp) -> Result<()> {
    let path = esp.file(LOADER_CONF);
    let existing = std::fs::read_to_string(&path).unwrap_or_default();
    let mut lines: Vec<&str> = existing
        .lines()
        .filter(|line| !line.trim_start().starts_with('#'))
        .collect();
    if lines
        .iter()
        .any(|line| line.trim_start().starts_with("timeout"))
    {
        return Ok(());
    }
    lines.push("timeout 0");
    files::write(&path, (lines.join("\n") + "\n").as_bytes())
}

fn needs_fallback() -> bool {
    mok::enrollment() != mok::Enrollment::Enrolled
}

fn place_fallback(esp: &Esp) -> Result<bool> {
    if needs_fallback() {
        let changed = fallback::place(esp)?;
        if efi::booted_with_uefi() {
            entry::ensure(esp, FALLBACK_LABEL, fallback::LOADER)?;
        }
        Ok(changed)
    } else {
        fallback::remove(esp);
        if efi::booted_with_uefi() {
            entry::remove(FALLBACK_LABEL)?;
        }
        Ok(false)
    }
}

pub fn place(esp: &Esp) -> Result<bool> {
    let mut changed = false;
    for (source, target) in placements()? {
        changed |= files::copy_if_changed(&source, &esp.file(&target))?;
    }
    let _ = std::fs::remove_dir_all(esp.file(SYSTEMD_BOOT));
    hide_menu(esp)?;
    changed |= place_fallback(esp)?;
    rustix::fs::sync();
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
