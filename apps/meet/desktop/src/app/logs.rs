use std::fs;
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use luft_meet::FolderKind;
use luft_meet::handoff;
use windows::Win32::Storage::FileSystem::{FindFirstVolumeW, FindNextVolumeW, FindVolumeClose};

use super::belongings::known;

const LOGS: &str = "Luft logs";
const VOLUME_NAME: usize = 50;

fn volumes() -> Vec<PathBuf> {
    let mut found = Vec::new();
    let mut name = [0u16; VOLUME_NAME];
    let Ok(search) = (unsafe { FindFirstVolumeW(&mut name) }) else {
        return found;
    };
    loop {
        let end = name
            .iter()
            .position(|&unit| unit == 0)
            .unwrap_or(name.len());
        found.push(PathBuf::from(String::from_utf16_lossy(&name[..end])));
        if unsafe { FindNextVolumeW(search, &mut name) }.is_err() {
            break;
        }
    }
    let _ = unsafe { FindVolumeClose(search) };
    found
}

fn sessions(volume: &Path) -> Vec<PathBuf> {
    if !volume.join(handoff::FILE).is_file() {
        return Vec::new();
    }
    let Ok(entries) = fs::read_dir(volume.join(LOGS)) else {
        return Vec::new();
    };
    entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.is_file()
                && path.extension().is_some_and(|extension| extension == "zip")
                && !path
                    .file_name()
                    .is_some_and(|name| name.to_string_lossy().starts_with('.'))
        })
        .collect()
}

fn latest_session() -> Option<PathBuf> {
    volumes()
        .iter()
        .flat_map(|volume| sessions(volume))
        .max_by(|a, b| a.file_name().cmp(&b.file_name()))
}

pub fn save() -> Result<Option<String>, String> {
    let Some(session) = latest_session() else {
        return Ok(None);
    };
    let desktop = known(FolderKind::Desktop).ok_or("Meet Luft couldn't find your desktop")?;
    let name = session
        .file_name()
        .expect("a session is a named file")
        .to_string_lossy();
    let saved = desktop.join(format!("{LOGS} {name}"));
    fs::copy(&session, &saved)
        .map_err(|error| format!("Meet Luft couldn't save Try Luft's logs: {error}"))?;
    Ok(Some(saved.to_string_lossy().into_owned()))
}

pub fn show(path: &str) -> Result<(), String> {
    Command::new("explorer")
        .raw_arg(format!("/select,\"{path}\""))
        .spawn()
        .map(drop)
        .map_err(|error| error.to_string())
}
