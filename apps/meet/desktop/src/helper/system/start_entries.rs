use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::Stdio;

use super::firmware::Nvram;
use super::programs;
use crate::boot::entries;
use crate::boot::load_option::{self, Decoded, Partition};
use crate::check::facts::StartEntry;
use crate::helper::drive::storage::MSFT_Partition;

const NO_WINDOW: u32 = 0x0800_0000;
const WINDOWS_LOADER: &str = r"\EFI\Microsoft\Boot\bootmgfw.efi";
const LOADER: &str = r"\EFI\BOOT\BOOTX64.EFI";

pub fn add(partition: &Partition) -> Result<u16, String> {
    entries::add(&Nvram, partition, LOADER)
}

pub fn ensure(partition: &Partition, number: u16) -> Result<u16, String> {
    entries::ensure(&Nvram, partition, LOADER, number)
}

pub fn remove(numbers: &[u16]) -> Result<(), String> {
    entries::remove(&Nvram, numbers)
}

fn partition_of<'a>(
    entry: &Decoded,
    partitions: &'a [MSFT_Partition],
) -> Option<Option<&'a MSFT_Partition>> {
    let guid = entry.partition?;
    Some(partitions.iter().find(|partition| {
        partition
            .guid()
            .and_then(|text| load_option::guid_bytes(&text))
            == Some(guid)
    }))
}

fn file_is_gone(volume: &Path, file: &str) -> bool {
    std::fs::read_dir(volume).is_ok() && !volume.join(file.trim_start_matches('\\')).exists()
}

fn leads_nowhere(entry: &Decoded, partitions: &[MSFT_Partition]) -> bool {
    if entry
        .file
        .as_deref()
        .is_some_and(|file| file.eq_ignore_ascii_case(WINDOWS_LOADER))
    {
        return false;
    }
    match partition_of(entry, partitions) {
        None => false,
        Some(None) => true,
        Some(Some(partition)) => match (partition.volume_path(), entry.file.as_deref()) {
            (Some(volume), Some(file)) => file_is_gone(&volume, file),
            _ => false,
        },
    }
}

pub fn tidy(entries: &[StartEntry]) -> Result<(), String> {
    for object in entries
        .iter()
        .filter_map(|entry| entry.windows_object.as_deref())
    {
        let forgotten = programs::windows("bcdedit")
            .args(["/delete", object])
            .stdout(Stdio::null())
            .creation_flags(NO_WINDOW)
            .status()
            .map_err(|error| error.to_string())?;
        if !forgotten.success() {
            return Err(format!("Windows kept the start entry {object}"));
        }
    }
    let numbers: Vec<u16> = entries.iter().map(|entry| entry.number).collect();
    remove(&numbers)
}

pub fn stale(partitions: &[MSFT_Partition], kept: Option<u16>) -> Vec<StartEntry> {
    let Ok(listed) = entries::listed(&Nvram) else {
        return Vec::new();
    };
    listed
        .into_iter()
        .filter(|(number, _)| Some(*number) != kept)
        .filter_map(|(number, option)| Some((number, load_option::decode(&option)?)))
        .filter(|(_, entry)| leads_nowhere(entry, partitions))
        .map(|(number, entry)| StartEntry {
            number,
            name: entry.description,
            windows_object: entry.windows_object,
        })
        .collect()
}
