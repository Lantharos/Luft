use std::fs::{self, File};
use std::io::{Read, Write};
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use super::bundle::{self, Bundle};
use super::library::{self, AppImage};
use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

const PREFIX: &str = "appimage-";
const CHUNK: usize = 1 << 20;
const MAIN_GROUP: &str = "[Desktop Entry]";

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn slug(name: &str) -> String {
    let slug: String = name
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() {
                character.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect();
    let slug = slug
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    if slug.is_empty() { "app".into() } else { slug }
}

pub fn install(source: &Path, task: Task) -> Result<AppImage, String> {
    task.progress(Stage::Preparing, None);
    let bundle = bundle::read(source)?;
    let name = bundle
        .entry
        .get("Name")
        .map(str::to_owned)
        .unwrap_or_else(|| {
            source
                .file_stem()
                .map(|stem| stem.to_string_lossy().into_owned())
                .unwrap_or_default()
        });
    let slug = slug(&name);
    let id = format!("{PREFIX}{slug}");
    let folder = library::folder();
    fs::create_dir_all(&folder).map_err(failed)?;
    let destination = folder.join(format!("{slug}.AppImage"));
    if source != destination {
        place(source, &destination, task)?;
    }
    integrate(&id, &destination, &bundle)?;
    library::find(&id)
}

fn place(source: &Path, destination: &Path, task: Task) -> Result<(), String> {
    let staging = destination.with_extension("AppImage.part");
    if fs::rename(source, &staging).is_err() {
        copy(source, &staging, task)?;
        fs::remove_file(source).map_err(failed)?;
    }
    fs::set_permissions(&staging, fs::Permissions::from_mode(0o755)).map_err(failed)?;
    fs::rename(&staging, destination).map_err(failed)
}

pub fn copy(source: &Path, destination: &Path, task: Task) -> Result<(), String> {
    let mut input = File::open(source).map_err(failed)?;
    let total = input.metadata().map_err(failed)?.len().max(1);
    let mut output = File::create(destination).map_err(failed)?;
    let mut buffer = vec![0u8; CHUNK];
    let mut copied = 0u64;
    loop {
        if task.cancel.is_cancelled() {
            drop(output);
            let _ = fs::remove_file(destination);
            return Err(CANCELLED.into());
        }
        let read = input.read(&mut buffer).map_err(failed)?;
        if read == 0 {
            break;
        }
        output.write_all(&buffer[..read]).map_err(failed)?;
        copied += read as u64;
        task.progress(Stage::Installing, Some(copied as f32 / total as f32));
    }
    output.sync_all().map_err(failed)
}

pub fn integrate(id: &str, executable: &Path, bundle: &Bundle) -> Result<(), String> {
    let icon = match &bundle.icon {
        Some(icon) => {
            remove_icons(id);
            let size = if icon.extension == "svg" {
                "scalable"
            } else {
                "256x256"
            };
            let folder = library::icons().join(size).join("apps");
            fs::create_dir_all(&folder).map_err(failed)?;
            fs::write(folder.join(format!("{id}.{}", icon.extension)), &icon.bytes)
                .map_err(failed)?;
            Some(id.to_owned())
        }
        None => None,
    };
    let applications = library::applications();
    fs::create_dir_all(&applications).map_err(failed)?;
    let entry = desktop_entry(
        &bundle.entry_text,
        executable,
        icon.as_deref(),
        bundle.electron,
    );
    fs::write(applications.join(format!("{id}.desktop")), entry).map_err(failed)?;
    refresh_menus(&applications);
    Ok(())
}

fn exec_line(original: &str, executable: &Path, electron: bool) -> String {
    let mut arguments: Vec<&str> = original.split_whitespace().skip(1).collect();
    if electron && !arguments.contains(&"--no-sandbox") {
        arguments.insert(0, "--no-sandbox");
    }
    let quoted = format!(
        "\"{}\"",
        executable.display().to_string().replace('"', "\\\"")
    );
    std::iter::once("env DESKTOPINTEGRATION=1")
        .chain(std::iter::once(quoted.as_str()))
        .chain(arguments)
        .collect::<Vec<_>>()
        .join(" ")
}

fn desktop_entry(original: &str, executable: &Path, icon: Option<&str>, electron: bool) -> String {
    let mut lines = Vec::new();
    let mut main = false;
    for line in original.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') {
            main = trimmed == MAIN_GROUP;
            lines.push(trimmed.to_owned());
            if main {
                lines.push(format!("TryExec={}", executable.display()));
            }
            continue;
        }
        let key = trimmed
            .split_once('=')
            .map(|(key, _)| key.trim())
            .unwrap_or_default();
        match key {
            "Exec" => lines.push(format!(
                "Exec={}",
                exec_line(
                    trimmed
                        .split_once('=')
                        .map(|(_, value)| value)
                        .unwrap_or_default(),
                    executable,
                    electron
                )
            )),
            "TryExec" => {}
            "Icon" if main => {
                if let Some(icon) = icon {
                    lines.push(format!("Icon={icon}"));
                }
            }
            _ => lines.push(trimmed.to_owned()),
        }
    }
    lines.join("\n") + "\n"
}

fn refresh_menus(applications: &Path) {
    let _ = Command::new("update-desktop-database")
        .arg(applications)
        .status();
}

fn remove_icons(id: &str) {
    let Ok(sizes) = fs::read_dir(library::icons()) else {
        return;
    };
    for size in sizes.flatten() {
        for extension in ["svg", "png"] {
            let _ = fs::remove_file(size.path().join("apps").join(format!("{id}.{extension}")));
        }
    }
}

pub fn remove(id: &str) -> Result<(), String> {
    let app = library::find(id)?;
    fs::remove_file(&app.path).map_err(failed)?;
    fs::remove_file(&app.desktop).map_err(failed)?;
    remove_icons(id);
    if let Some(icon) = app.icon.filter(|icon| owned_icon(icon, &app.path)) {
        let _ = fs::remove_file(icon);
    }
    refresh_menus(&library::applications());
    Ok(())
}

fn owned_icon(icon: &Path, executable: &Path) -> bool {
    let beside: Option<PathBuf> = executable.parent().map(|folder| folder.join(".icons"));
    beside.is_some_and(|folder| icon.starts_with(folder))
}
