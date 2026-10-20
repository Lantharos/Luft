use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use luft_i18n::t;

use super::record::Made;
use crate::L10N;

const LOGS: &str = "Luft logs";

fn sessions(folder: &Path) -> Vec<PathBuf> {
    let Ok(entries) = fs::read_dir(folder.join(LOGS)) else {
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

fn desktop() -> Option<PathBuf> {
    let output = Command::new("xdg-user-dir").arg("DESKTOP").output().ok()?;
    let path = String::from_utf8(output.stdout).ok()?;
    let path = PathBuf::from(path.trim());
    if path.is_dir() {
        return Some(path);
    }
    let home = PathBuf::from(std::env::var_os("HOME")?);
    let desktop = home.join("Desktop");
    Some(if desktop.is_dir() { desktop } else { home })
}

pub fn save() -> Result<Option<String>, String> {
    let Some(folder) = Made::read().folder else {
        return Ok(None);
    };
    let Some(session) = sessions(&folder)
        .into_iter()
        .max_by(|a, b| a.file_name().cmp(&b.file_name()))
    else {
        return Ok(None);
    };
    let desktop = desktop().ok_or_else(|| t!(L10N, "logs-no-desktop"))?;
    let name = session
        .file_name()
        .expect("a session is a named file")
        .to_string_lossy();
    let saved = desktop.join(t!(L10N, "logs-file-name", name = name));
    fs::copy(&session, &saved)
        .map_err(|error| t!(L10N, "logs-not-saved", error = error.to_string()))?;
    Ok(Some(saved.to_string_lossy().into_owned()))
}

pub fn show(path: &str) -> Result<(), String> {
    let shown = Command::new("dbus-send")
        .args([
            "--session",
            "--dest=org.freedesktop.FileManager1",
            "--type=method_call",
            "/org/freedesktop/FileManager1",
            "org.freedesktop.FileManager1.ShowItems",
        ])
        .arg(format!("array:string:file://{path}"))
        .arg("string:")
        .status()
        .is_ok_and(|status| status.success());
    if shown {
        return Ok(());
    }
    let folder = Path::new(path).parent().unwrap_or(Path::new("/"));
    Command::new("xdg-open")
        .arg(folder)
        .spawn()
        .map(drop)
        .map_err(|error| error.to_string())
}
