use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use super::pe::PeFile;
use crate::system::firmware::efi;

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

fn settle(folder: &Path) -> Result<()> {
    rustix::fs::syncfs(std::fs::File::open(folder)?)?;
    Ok(())
}

pub fn write(path: &Path, contents: &[u8]) -> Result<()> {
    let folder = path.parent().context("A file needs a folder.")?;
    std::fs::create_dir_all(folder)?;
    let partial = path.with_extension("partial");
    std::fs::write(&partial, contents)?;
    std::fs::File::open(&partial)?.sync_all()?;
    std::fs::rename(&partial, path)?;
    settle(folder)
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

pub fn place_shim_after(second_stage: &Path, folder: &Path, shim_name: &str) -> Result<bool> {
    let shim = shim_folder()?;
    let mut changed = copy_if_changed(second_stage, &folder.join(SECOND_STAGE))?;
    changed |= copy_if_changed(&shim.join(MOK_MANAGER), &folder.join(MOK_MANAGER))?;
    changed |= copy_if_changed(&shim.join(SHIM), &folder.join(shim_name))?;
    Ok(changed)
}

pub fn write_folder_once(folder: &Path, files: &[(&str, &[u8])]) -> Result<bool> {
    if folder.is_dir() {
        return Ok(false);
    }
    let partial = folder.with_extension("partial");
    let _ = std::fs::remove_dir_all(&partial);
    std::fs::create_dir_all(&partial)?;
    for (name, contents) in files {
        std::fs::write(partial.join(name), contents)?;
    }
    settle(&partial)?;
    std::fs::rename(&partial, folder)?;
    settle(folder)?;
    Ok(true)
}
