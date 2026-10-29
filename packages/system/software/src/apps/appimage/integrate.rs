use std::fs::{self, File};
use std::io::{Read, Write};
use std::os::unix::fs::{PermissionsExt, symlink};
use std::path::{Path, PathBuf};
use std::process::Command;

use super::bundle::{self, Bundle};
use super::declaration::Declaration;
use super::library::{self, AppImage, IconSize};
use crate::apps::chromium;
use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

const GENERATED_NAMESPACE: &str = "org.appimage";
const MAX_APP_ID: usize = 255;
const LUFT_NAMESPACE: &str = "com.lantharos.";
const CHUNK: usize = 1 << 20;
const MAIN_GROUP: &str = "[Desktop Entry]";
pub const SANDBOX: &str = "--sandbox";
pub const FILES: &str = "@@";
pub const URIS: &str = "@@u";
pub const CHROMIUM: &str = "X-Luft-Chromium";

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
    Link,
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
    let path = library::folder().join(format!("{slug}.AppImage"));
    let stem = source
        .file_stem()
        .map(|stem| stem.to_string_lossy().into_owned());
    let id = [bundle.desktop_id.clone(), stem]
        .into_iter()
        .flatten()
        .find(|id| is_app_id(id) && library::desktop_id_free(id, &path))
        .unwrap_or_else(|| generated_id(&slug));
    Placement { id, path }
}

fn is_app_id(id: &str) -> bool {
    let Some((domain, rest)) = id.split_once('.') else {
        return false;
    };
    id.len() <= MAX_APP_ID
        && !id.starts_with(LUFT_NAMESPACE)
        && !domain.is_empty()
        && domain
            .chars()
            .all(|character| character.is_ascii_lowercase())
        && rest.split('.').all(is_id_element)
}

fn is_id_element(element: &str) -> bool {
    element
        .chars()
        .next()
        .is_some_and(|first| !first.is_ascii_digit())
        && element
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || "_-".contains(character))
}

fn generated_id(slug: &str) -> String {
    let element: String = slug
        .replace('-', "_")
        .chars()
        .take(MAX_APP_ID - GENERATED_NAMESPACE.len() - 2)
        .collect();
    let element = if element.starts_with(|first: char| first.is_ascii_digit()) {
        format!("_{element}")
    } else {
        element
    };
    format!("{GENERATED_NAMESPACE}.{element}")
}

/// An AppImage just installed, with what it declares about its sandbox.
pub struct Installed {
    pub app: AppImage,
    pub declaration: Option<Declaration>,
}

pub fn install(source: &Path, task: Task) -> Result<Installed, String> {
    add(source, Transfer::Move, task)
}

pub fn install_link(source: &Path, task: Task) -> Result<Installed, String> {
    add(source, Transfer::Link, task)
}

fn add(source: &Path, transfer: Transfer, task: Task) -> Result<Installed, String> {
    task.progress(Stage::Preparing, None);
    let bundle = bundle::read(source)?;
    let Placement { id, path } = placement(source, &bundle);
    claim(&id, &path)?;
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
    Ok(Installed {
        app: library::find(&id)?,
        declaration: bundle.declaration,
    })
}

fn place(source: &Path, destination: &Path, transfer: Transfer, task: Task) -> Result<(), String> {
    let staging = destination.with_extension("AppImage.part");
    match transfer {
        Transfer::Link => symlink(source, &staging).map_err(failed)?,
        Transfer::Move => {
            if fs::rename(source, &staging).is_err() {
                copy(source, &staging, task)?;
                fs::remove_file(source).map_err(failed)?;
            }
            fs::set_permissions(&staging, fs::Permissions::from_mode(0o755)).map_err(failed)?;
        }
    }
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

fn claim(id: &str, executable: &Path) -> Result<(), String> {
    library::owns_entry(id, executable)
        .then_some(())
        .ok_or_else(|| "Another app already uses this name in the app menu.".into())
}

pub fn integrate(id: &str, executable: &Path, bundle: &Bundle) -> Result<(), String> {
    claim(id, executable)?;
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
    let entry = desktop_entry(id, bundle, executable, icon);
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
        if app.launcher.as_deref() == Some(launcher().as_path())
            && app.icon.as_deref().is_some_and(icon_fits)
        {
            continue;
        }
        if let Ok(bundle) = bundle::read(&app.path) {
            let _ = integrate(&app.id, &app.path, &bundle);
        }
    }
}

fn forwarded(argument: &str) -> String {
    match argument {
        "%f" | "%F" => format!("{FILES} {argument} {FILES}"),
        "%u" | "%U" => format!("{URIS} {argument} {FILES}"),
        _ => argument.to_owned(),
    }
}

/// Schelf itself, which starts AppImages in their sandbox.
pub fn launcher() -> PathBuf {
    std::env::current_exe().unwrap_or_default()
}

fn quoted(path: &Path) -> String {
    format!("\"{}\"", path.display().to_string().replace('"', "\\\""))
}

fn exec_line(original: &str, id: &str, bundle: &Bundle) -> String {
    let mut arguments: Vec<String> = original
        .split_whitespace()
        .skip(1)
        .map(str::to_owned)
        .collect();
    if bundle.chromium {
        chromium::enable_finger_scrolling(&mut arguments);
    }
    [quoted(&launcher()), SANDBOX.to_owned(), id.to_owned()]
        .into_iter()
        .chain(arguments.iter().map(|argument| forwarded(argument)))
        .collect::<Vec<_>>()
        .join(" ")
}

fn desktop_entry(id: &str, bundle: &Bundle, executable: &Path, icon: Option<&str>) -> String {
    let mut lines = Vec::new();
    let mut main = false;
    for line in bundle.entry_text.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('[') {
            main = trimmed == MAIN_GROUP;
            lines.push(trimmed.to_owned());
            if main {
                lines.push(format!("TryExec={}", executable.display()));
                if bundle.electron || bundle.chromium {
                    lines.push(format!("{CHROMIUM}=true"));
                }
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
                    id,
                    bundle
                )
            )),
            "TryExec" | CHROMIUM => {}
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
