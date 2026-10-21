use std::path::Path;

use luft_i18n::t;
use windows::Win32::Storage::FileSystem::{GetVolumeNameForVolumeMountPointW, GetVolumePathNameW};
use windows::core::HSTRING;
use wmi::WMIConnection;

use crate::L10N;
use crate::stick::drives::windows::Storage;

const PATH: usize = 1024;

fn query<T: serde::de::DeserializeOwned>(
    wmi: &WMIConnection,
    class: &str,
) -> Result<Vec<T>, String> {
    wmi.raw_query(format!("SELECT * FROM {class}"))
        .map_err(|error| t!(L10N, "drive-list-failed", error = error.to_string()))
}

pub fn take() -> Result<Storage, String> {
    let wmi = WMIConnection::with_namespace_path(r"ROOT\Microsoft\Windows\Storage")
        .map_err(|error| t!(L10N, "drive-list-failed", error = error.to_string()))?;
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
