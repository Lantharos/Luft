use std::fs::{self, File};
use std::io::{Read, Write};
use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};
use std::process::Command;

use super::bundle::{self, Bundle};
use super::library::{self, AppImage, IconSize};
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

#[derive(Clone, Copy, PartialEq, Eq)]
enum Transfer {
    Move,
    Copy,
}

pub struct Placement {
    pub id: String,
    pub path: PathBuf,
}

pub fn placement(source: &Path, bundle: &Bundle) -> Placement {
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
    let id = bundle
        .desktop_id
        .clone()
        .filter(|id| is_desktop_id(id))
        .unwrap_or_else(|| format!("{PREFIX}{slug}"));
    Placement {
        id,
        path: library::folder().join(format!("{slug}.AppImage")),
    }
}

fn is_desktop_id(id: &str) -> bool {
    !id.is_empty()
        && id
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "._-".contains(character))
}

pub fn install(source: &Path, task: Task) -> Result<AppImage, String> {
    add(source, Transfer::Move, task)
}

pub fn install_copy(source: &Path, task: Task) -> Result<AppImage, String> {
    add(source, Transfer::Copy, task)
}

fn add(source: &Path, transfer: Transfer, task: Task) -> Result<AppImage, String> {
    task.progress(Stage::Preparing, None);
    let bundle = bundle::read(source)?;
    let Placement { id, path } = placement(source, &bundle);
    fs::create_dir_all(library::folder()).map_err(failed)?;
    if source != path {
        place(source, &path, transfer, task)?;
    }
    for earlier in library::list() {
        if earlier.path == path && earlier.id != id {
            fs::remove_file(&earlier.desktop).map_err(failed)?;
            remove_icons(&earlier.id);
        }
    }
    integrate(&id, &path, &bundle)?;
    library::find(&id)
}

fn place(source: &Path, destination: &Path, transfer: Transfer, task: Task) -> Result<(), String> {
    let staging = destination.with_extension("AppImage.part");
    if transfer == Transfer::Copy || fs::rename(source, &staging).is_err() {
        copy(source, &staging, task)?;
    }
    if transfer == Transfer::Move && source.exists() {
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
    remove_icons(id);
    for icon in &bundle.icons {
        let folder = library::icons().join(icon.size.folder()).join("apps");
        fs::create_dir_all(&folder).map_err(failed)?;
        fs::write(folder.join(format!("{id}.{}", icon.extension)), &icon.bytes).map_err(failed)?;
    }
    refresh_icons();
    let applications = library::applications();
    fs::create_dir_all(&applications).map_err(failed)?;
    let icon = (!bundle.icons.is_empty()).then_some(id);
    let entry = desktop_entry(&bundle.entry_text, executable, icon, bundle.electron);
    fs::write(applications.join(format!("{id}.desktop")), entry).map_err(failed)?;
    refresh_menus(&applications);
    Ok(())
}

fn icon_fits(icon: &Path) -> bool {
    let folder = icon
        .parent()
        .and_then(Path::parent)
        .and_then(Path::file_name);
    let size = match icon.extension().and_then(|extension| extension.to_str()) {
        Some("svg") => Some(IconSize::Scalable),
        _ => fs::read(icon)
            .ok()
            .and_then(|bytes| IconSize::of_png(&bytes)),
    };
    size.is_some_and(|size| folder.is_some_and(|folder| *folder == *size.folder()))
}

pub fn repair() {
    for app in library::list() {
        if app.icon.as_deref().is_some_and(icon_fits) {
            continue;
        }
        if let Ok(bundle) = bundle::read(&app.path) {
            let _ = integrate(&app.id, &app.path, &bundle);
        }
    }
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

fn refresh_icons() {
    let _ = Command::new("gtk-update-icon-cache")
        .args(["-q", "-t", "-f"])
        .arg(library::icons())
        .status();
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
    refresh_icons();
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
