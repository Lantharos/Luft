use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};

use super::firmware;
use crate::boot::load_option::{self, Decoded, Partition};
use crate::check::facts::StartEntry;
use crate::helper::drive::storage::MSFT_Partition;

const NO_WINDOW: u32 = 0x0800_0000;
const WINDOWS_LOADER: &str = r"\EFI\Microsoft\Boot\bootmgfw.efi";

pub fn add(partition: &Partition) -> Result<u16, String> {
    let listed = firmware::listed()?;
    let number = match listed
        .iter()
        .find(|(_, option)| load_option::points_at(option, &partition.guid))
    {
        Some((number, _)) => *number,
        None => firmware::free_number()?,
    };
    firmware::set_entry(number, &load_option::encode(partition))?;
    firmware::set_order(&load_option::appended(&firmware::order()?, number))?;
    Ok(number)
}

pub fn ensure(partition: &Partition, number: u16) -> Result<u16, String> {
    let wanted = load_option::encode(partition);
    match firmware::entry(number)? {
        Some(option) if option == wanted => {}
        Some(option) if load_option::points_at(&option, &partition.guid) => {
            firmware::set_entry(number, &wanted)?
        }
        _ => return add(partition),
    }
    let order = firmware::order()?;
    if !load_option::numbers(&order).any(|listed| listed == number) {
        firmware::set_order(&load_option::appended(&order, number))?;
    }
    Ok(number)
}

pub fn remove(numbers: &[u16]) -> Result<(), String> {
    for number in numbers {
        if firmware::entry(*number)?.is_some() {
            firmware::set_entry(*number, &[])?;
        }
    }
    firmware::set_order(&load_option::without(&firmware::order()?, numbers))
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
        let forgotten = Command::new("bcdedit")
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
    let Ok(entries) = firmware::listed() else {
        return Vec::new();
    };
    entries
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
