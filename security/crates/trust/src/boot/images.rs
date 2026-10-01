use std::path::{Path, PathBuf};

use anyhow::{Result, bail};

use super::esp::Esp;
use super::kernels::{self, Kernel};

const FOLDER: &str = "EFI/Linux";
const PREFIX: &str = "luft-";
const SUFFIX: &str = ".efi";
const HEADROOM: u64 = 4 << 20;
pub const KEPT: usize = 3;

pub fn name(version: &str) -> String {
    format!("{PREFIX}{version}{SUFFIX}")
}

pub fn path(esp: &Esp, version: &str) -> PathBuf {
    esp.file(FOLDER).join(name(version))
}

pub fn versions(esp: &Esp) -> Vec<String> {
    let mut versions: Vec<String> = std::fs::read_dir(esp.file(FOLDER))
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| {
            let name = entry.file_name().to_string_lossy().into_owned();
            Some(name.strip_prefix(PREFIX)?.strip_suffix(SUFFIX)?.to_owned())
        })
        .collect();
    versions.sort_by(|a, b| kernels::newest_first(a, b));
    versions
}

pub fn wanted() -> Vec<Kernel> {
    kernels::installed().into_iter().take(KEPT).collect()
}

fn size(path: &Path) -> u64 {
    std::fs::metadata(path).map_or(0, |metadata| metadata.len())
}

pub fn estimate(kernel: &Kernel, initrd: &Path) -> u64 {
    size(&kernel.image) + size(initrd) + HEADROOM
}

fn free(esp: &Esp) -> u64 {
    rustix::fs::statvfs(&esp.path).map_or(0, |space| space.f_bavail * space.f_frsize)
}

pub fn room_for(esp: &Esp, needed: u64) -> bool {
    let present: u64 = versions(esp)
        .iter()
        .map(|version| size(&path(esp, version)))
        .sum();
    free(esp) + present >= needed
}

fn remove_unfinished(esp: &Esp) {
    for entry in std::fs::read_dir(esp.file(FOLDER))
        .into_iter()
        .flatten()
        .flatten()
    {
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.starts_with(PREFIX) && name.ends_with(".partial") {
            let _ = std::fs::remove_file(entry.path());
        }
    }
}

pub fn make_room(esp: &Esp, version: &str, needed: u64) -> Result<()> {
    remove_unfinished(esp);
    while free(esp) < needed {
        let present = versions(esp);
        let newest = present.first();
        let replaces_newest =
            newest.is_none_or(|newest| kernels::newest_first(version, newest).is_le());
        let Some(removable) = present
            .iter()
            .find(|candidate| *candidate == version)
            .or_else(|| {
                present.iter().rev().find(|candidate| {
                    *candidate != version && (replaces_newest || Some(*candidate) != newest)
                })
            })
            .cloned()
        else {
            bail!("The EFI system partition is too full for the signed startup files.");
        };
        std::fs::remove_file(path(esp, &removable))?;
    }
    Ok(())
}

pub fn keep_only(esp: &Esp, kept: &[Kernel]) {
    for version in versions(esp) {
        if !kept.iter().any(|kernel| kernel.version == version) {
            let _ = std::fs::remove_file(path(esp, &version));
        }
    }
}

pub fn remove(esp: &Esp, version: &str) {
    let _ = std::fs::remove_file(path(esp, version));
}
