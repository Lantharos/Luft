use std::path::Path;

use windows::Win32::Storage::FileSystem::{GetVolumeNameForVolumeMountPointW, GetVolumePathNameW};
use windows::core::HSTRING;
use wmi::WMIConnection;

use super::disk;
use crate::stick::GONE;
use crate::stick::drives::Stick;
use crate::stick::drives::windows::{Disk, Storage};
use crate::stick::table::Slot;
use crate::stick::ventoy;

const PATH: usize = 1024;

fn query<T: serde::de::DeserializeOwned>(
    wmi: &WMIConnection,
    class: &str,
) -> Result<Vec<T>, String> {
    wmi.raw_query(format!("SELECT * FROM {class}"))
        .map_err(|error| format!("The drives couldn't be listed: {error}"))
}

pub fn storage() -> Result<Storage, String> {
    let wmi = WMIConnection::with_namespace_path(r"ROOT\Microsoft\Windows\Storage")
        .map_err(|error| format!("The drives couldn't be listed: {error}"))?;
    Ok(Storage {
        disks: query(&wmi, "MSFT_Disk")?,
        partitions: query(&wmi, "MSFT_Partition")?,
        volumes: query(&wmi, "MSFT_Volume")?,
    })
}

fn text(units: &[u16]) -> String {
    let end = units
        .iter()
        .position(|unit| *unit == 0)
        .unwrap_or(units.len());
    String::from_utf16_lossy(&units[..end])
}

fn volume_of(file: &Path) -> Option<String> {
    let mut mount = [0u16; PATH];
    unsafe { GetVolumePathNameW(&HSTRING::from(file), &mut mount) }.ok()?;
    let mut volume = [0u16; PATH];
    unsafe { GetVolumeNameForVolumeMountPointW(&HSTRING::from(text(&mount)), &mut volume) }.ok()?;
    Some(text(&volume))
}

pub fn holding(storage: &Storage, file: &Path) -> Option<u32> {
    let volume = volume_of(file)?;
    storage
        .partitions
        .iter()
        .find(|partition| {
            partition
                .volume_path()
                .is_some_and(|path| path.eq_ignore_ascii_case(&volume))
        })
        .map(|partition| partition.DiskNumber)
}

pub fn ventoy_data(disk: &Disk) -> Option<Slot> {
    let mut device = disk::open_read(disk.Number).ok()?;
    ventoy::data_partition(&mut device, disk.LogicalSectorSize.max(512) as u64)
        .ok()
        .flatten()
}

pub fn sticks(iso: Option<&Path>) -> Result<Vec<Stick>, String> {
    let storage = storage()?;
    let holding = iso.and_then(|iso| holding(&storage, iso));
    Ok(storage
        .sticks(holding)
        .into_iter()
        .map(|disk| storage.describe(disk, ventoy_data(disk).is_some()))
        .collect())
}

pub fn find(id: &str, iso: Option<&Path>) -> Result<(Storage, Disk), String> {
    let storage = storage()?;
    let holding = iso.and_then(|iso| holding(&storage, iso));
    let disk = storage
        .sticks(holding)
        .into_iter()
        .find(|disk| disk.id() == id)
        .cloned()
        .ok_or(GONE)?;
    Ok((storage, disk))
}
