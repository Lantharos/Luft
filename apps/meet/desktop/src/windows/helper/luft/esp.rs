use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use crate::windows::helper::drive::storage::{ESP_TYPE, MSFT_Partition};

const LUFT: &str = r"EFI\luft";
const FALLBACK: &str = r"EFI\luft-start";
const SHIM: &str = "shimx64.efi";
const REMOVABLE: &str = r"EFI\Boot";
const REMOVABLE_SHIM: &str = "BOOTX64.EFI";
const REMOVABLE_EXTRAS: [&str; 2] = ["mmx64.efi", "grubx64.efi"];
const WINDOWS_LOADER: &str = r"EFI\Microsoft\Boot\bootmgfw.efi";
const ENTRIES: &str = r"loader\entries";
const LOADER: &str = "loader";
const UKIS: &str = r"EFI\Linux";
const LUFT_ONLY: [&str; 5] = ["luft", "luft-start", "linux", "boot", "systemd"];

fn esps(partitions: &[MSFT_Partition]) -> impl Iterator<Item = (&MSFT_Partition, PathBuf)> {
    partitions
        .iter()
        .filter(|partition| partition.is_type(ESP_TYPE))
        .filter_map(|partition| Some((partition, partition.volume_path()?)))
}

pub fn holding_luft(partitions: &[MSFT_Partition]) -> Option<&MSFT_Partition> {
    esps(partitions)
        .find(|(_, root)| root.join(LUFT).join(SHIM).is_file())
        .map(|(partition, _)| partition)
}

fn absent(result: io::Result<()>) -> Result<(), String> {
    match result {
        Err(error) if error.kind() != io::ErrorKind::NotFound => Err(error.to_string()),
        _ => Ok(()),
    }
}

fn holds_luft(root: &Path) -> bool {
    root.join(LUFT).is_dir() || root.join(FALLBACK).is_dir()
}

fn only_luft(root: &Path) -> bool {
    fs::read_dir(root.join("EFI")).is_ok_and(|folders| {
        folders.flatten().all(|folder| {
            LUFT_ONLY.contains(
                &folder
                    .file_name()
                    .to_string_lossy()
                    .to_ascii_lowercase()
                    .as_str(),
            )
        })
    })
}

fn restore_removable(root: &Path) -> Result<(), String> {
    let Ok(shim) = fs::read(root.join(LUFT).join(SHIM)) else {
        return Ok(());
    };
    let removable = root.join(REMOVABLE);
    if fs::read(removable.join(REMOVABLE_SHIM)).ok() != Some(shim) {
        return Ok(());
    }
    let windows = root.join(WINDOWS_LOADER);
    if windows.is_file() {
        fs::copy(&windows, removable.join(REMOVABLE_SHIM)).map_err(|error| error.to_string())?;
    } else {
        absent(fs::remove_file(removable.join(REMOVABLE_SHIM)))?;
    }
    for extra in REMOVABLE_EXTRAS {
        absent(fs::remove_file(removable.join(extra)))?;
    }
    Ok(())
}

fn loader_files(entry: &str) -> impl Iterator<Item = &str> {
    entry.lines().filter_map(|line| {
        let (key, value) = line.trim().split_once(char::is_whitespace)?;
        matches!(key, "uki" | "efi" | "linux" | "initrd").then(|| value.trim())
    })
}

fn remove_entries(root: &Path) -> Result<(), String> {
    for entry in fs::read_dir(root.join(ENTRIES))
        .into_iter()
        .flatten()
        .flatten()
    {
        let Ok(text) = fs::read_to_string(entry.path()) else {
            continue;
        };
        if !text.to_ascii_lowercase().contains("luft") {
            continue;
        }
        for file in loader_files(&text) {
            let relative = file.trim_start_matches(['/', '\\']).replace('/', r"\");
            absent(fs::remove_file(root.join(relative)))?;
        }
        absent(fs::remove_file(entry.path()))?;
    }
    for folder in [ENTRIES, UKIS] {
        let _ = fs::remove_dir(root.join(folder));
    }
    if !root.join(ENTRIES).exists() {
        absent(fs::remove_dir_all(root.join(LOADER)))?;
    }
    Ok(())
}

fn clean(root: &Path) -> Result<(), String> {
    restore_removable(root)?;
    remove_entries(root)?;
    for folder in [LUFT, FALLBACK] {
        absent(fs::remove_dir_all(root.join(folder)))?;
    }
    Ok(())
}

pub struct Cleaned<'a> {
    pub emptied: Vec<&'a MSFT_Partition>,
}

pub fn clean_all(partitions: &[MSFT_Partition], windows_disk: u32) -> Result<Cleaned<'_>, String> {
    let mut emptied = Vec::new();
    for (partition, root) in esps(partitions) {
        if !holds_luft(&root) {
            continue;
        }
        if partition.DiskNumber != windows_disk && !partition.IsSystem && only_luft(&root) {
            emptied.push(partition);
        } else {
            clean(&root)?;
        }
    }
    Ok(Cleaned { emptied })
}
