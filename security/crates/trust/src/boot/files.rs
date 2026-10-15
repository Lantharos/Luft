use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::pe::PeFile;
use crate::system::efi;

pub const SHIM: &str = "shimx64.efi";
pub const MOK_MANAGER: &str = "mmx64.efi";
pub const SECOND_STAGE: &str = "grubx64.efi";
const SHIM_VERSIONS: &str = "/usr/lib/efi/shim";
const GRUB_VERSIONS: &str = "/usr/lib/efi/grub2";
const FEDORA_FOLDER: &str = "EFI/fedora";
const BUILT_IN_KEYS: &str = ".vendor_cert";
const DER_SEQUENCE: u8 = 0x30;

fn installed(versions: &str, file: &str, what: &str) -> Result<PathBuf> {
    std::fs::read_dir(versions)
        .with_context(|| format!("{what} isn't installed."))?
        .flatten()
        .map(|version| version.path().join(FEDORA_FOLDER))
        .find(|folder| folder.join(file).exists())
        .with_context(|| format!("{what} isn't installed."))
}

pub fn shim_folder() -> Result<PathBuf> {
    installed(SHIM_VERSIONS, SHIM, "Fedora's shim")
}

fn u32_at(data: &[u8], at: usize) -> Option<usize> {
    Some(u32::from_le_bytes(data.get(at..at + 4)?.try_into().ok()?) as usize)
}

pub fn shim_certificates() -> Vec<Vec<u8>> {
    let Some(section) = shim_folder()
        .and_then(|folder| PeFile::open(&folder.join(SHIM))?.section(BUILT_IN_KEYS))
        .ok()
    else {
        return Vec::new();
    };
    let (Some(size), Some(offset)) = (u32_at(&section, 0), u32_at(&section, 8)) else {
        return Vec::new();
    };
    match section.get(offset..offset + size) {
        Some(der) if der.first() == Some(&DER_SEQUENCE) => vec![der.to_vec()],
        Some(lists) => efi::certificates_in(lists),
        None => Vec::new(),
    }
}

pub fn grub() -> Result<PathBuf> {
    installed(GRUB_VERSIONS, SECOND_STAGE, "Fedora's GRUB").map(|folder| folder.join(SECOND_STAGE))
}

pub fn write(path: &Path, contents: &[u8]) -> Result<()> {
    if let Some(folder) = path.parent() {
        std::fs::create_dir_all(folder)?;
    }
    let partial = path.with_extension("partial");
    std::fs::write(&partial, contents)?;
    std::fs::File::open(&partial)?.sync_all()?;
    std::fs::rename(&partial, path)?;
    Ok(())
}

pub fn write_if_changed(path: &Path, contents: &[u8]) -> Result<bool> {
    if std::fs::read(path).is_ok_and(|current| current == contents) {
        return Ok(false);
    }
    write(path, contents)?;
    Ok(true)
}

pub fn copy_if_changed(source: &Path, target: &Path) -> Result<bool> {
    let contents =
        std::fs::read(source).with_context(|| format!("{} is missing.", source.display()))?;
    write_if_changed(target, &contents)
}
