use std::ffi::CString;
use std::fs;
use std::mem::MaybeUninit;
use std::os::unix::ffi::OsStrExt;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use crate::locations::drives;

pub(super) fn ensure_space(destination: &Path, required_bytes: u64) -> Result<(), String> {
    if required_bytes == 0 {
        return Ok(());
    }
    let available = available_space(destination)?;
    if available >= required_bytes {
        return Ok(());
    }
    let label = drives::drive_for_path(destination)
        .map(|drive| drive.name)
        .or_else(|| file_name(destination))
        .unwrap_or_else(|| "destination".to_string());
    Err(format!(
        "Not enough space on {label}: need {}, available {}",
        format_bytes(required_bytes),
        format_bytes(available)
    ))
}

pub(super) fn crosses_device(sources: &[(PathBuf, PathBuf)]) -> bool {
    sources.iter().any(|(source, destination)| {
        match (fs::symlink_metadata(source), fs::metadata(destination)) {
            (Ok(source), Ok(destination)) => source.dev() != destination.dev(),
            _ => true,
        }
    })
}

pub(crate) fn path_size(path: &Path) -> u64 {
    walkdir::WalkDir::new(path)
        .into_iter()
        .flatten()
        .filter_map(|entry| entry.metadata().ok())
        .filter(fs::Metadata::is_file)
        .map(|metadata| metadata.len())
        .sum()
}

pub(super) fn path_items(path: &Path) -> usize {
    walkdir::WalkDir::new(path).into_iter().flatten().count()
}

pub(super) fn file_name(path: &Path) -> Option<String> {
    path.file_name()
        .map(|name| name.to_string_lossy().into_owned())
}

fn available_space(path: &Path) -> Result<u64, String> {
    let path = CString::new(path.as_os_str().as_bytes())
        .map_err(|_| "Destination path contains an invalid byte".to_string())?;
    let mut stat = MaybeUninit::<libc::statvfs>::uninit();
    if unsafe { libc::statvfs(path.as_ptr(), stat.as_mut_ptr()) } != 0 {
        return Err("Could not read destination free space".to_string());
    }
    let stat = unsafe { stat.assume_init() };
    Ok(stat.f_bavail * stat.f_frsize)
}

fn format_bytes(bytes: u64) -> String {
    const UNITS: [&str; 5] = ["B", "KB", "MB", "GB", "TB"];
    let mut size = bytes as f64;
    let mut unit = 0;
    while size >= 1024.0 && unit < UNITS.len() - 1 {
        size /= 1024.0;
        unit += 1;
    }
    if unit == 0 {
        format!("{bytes} B")
    } else {
        format!("{size:.1} {}", UNITS[unit])
    }
}
