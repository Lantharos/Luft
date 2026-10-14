use std::path::{Path, PathBuf};

use serde::Serialize;

use super::elf;
use crate::desktop::DesktopEntry;

const ICON_FOLDERS: [u32; 13] = [16, 22, 24, 32, 36, 48, 64, 72, 96, 128, 192, 256, 512];
const SCALABLE: &str = "scalable";

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub enum IconSize {
    Pixels(u32),
    Scalable,
}

impl IconSize {
    pub fn of_png(bytes: &[u8]) -> Option<Self> {
        let dimension = |range: std::ops::Range<usize>| {
            Some(u32::from_be_bytes(bytes.get(range)?.try_into().ok()?))
        };
        Some(Self::Pixels(dimension(16..20)?.max(dimension(20..24)?)))
    }

    pub fn folder(self) -> String {
        match self {
            Self::Scalable => SCALABLE.to_owned(),
            Self::Pixels(pixels) => {
                let size = ICON_FOLDERS
                    .iter()
                    .rev()
                    .find(|size| **size <= pixels)
                    .unwrap_or(&ICON_FOLDERS[0]);
                format!("{size}x{size}")
            }
        }
    }
}

fn icon_folders() -> impl Iterator<Item = String> {
    std::iter::once(SCALABLE.to_owned()).chain(
        ICON_FOLDERS
            .iter()
            .rev()
            .map(|size| format!("{size}x{size}")),
    )
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AppImage {
    pub id: String,
    pub name: String,
    pub summary: Option<String>,
    pub version: Option<String>,
    pub path: PathBuf,
    pub icon: Option<PathBuf>,
    pub desktop: PathBuf,
    pub size: u64,
    pub updatable: bool,
}

pub fn folder() -> PathBuf {
    dirs::home_dir().unwrap_or_default().join("Applications")
}

pub fn applications() -> PathBuf {
    dirs::data_dir().unwrap_or_default().join("applications")
}

pub fn icons() -> PathBuf {
    dirs::data_dir().unwrap_or_default().join("icons/hicolor")
}

pub fn icon_path(name: &str) -> Option<PathBuf> {
    let name = Path::new(name);
    if name.is_absolute() {
        return name.exists().then(|| name.to_path_buf());
    }
    let base = icons();
    icon_folders().find_map(|size| {
        ["svg", "png"]
            .iter()
            .map(|extension| {
                base.join(&size)
                    .join("apps")
                    .join(format!("{}.{extension}", name.display()))
            })
            .find(|path| path.exists())
    })
}

fn is_appimage_path(path: &Path) -> bool {
    path.extension()
        .and_then(|extension| extension.to_str())
        .is_some_and(|extension| extension.eq_ignore_ascii_case("appimage"))
}

fn executable(entry: &DesktopEntry) -> Option<PathBuf> {
    if let Some(path) = entry
        .get("TryExec")
        .map(PathBuf::from)
        .filter(|path| is_appimage_path(path))
    {
        return Some(path);
    }
    entry
        .get("Exec")?
        .split_whitespace()
        .map(|token| token.trim_matches('"'))
        .map(PathBuf::from)
        .find(|path| path.is_absolute() && is_appimage_path(path))
}

fn read(desktop: &Path) -> Option<AppImage> {
    let entry = DesktopEntry::read(desktop)?;
    let path = executable(&entry).filter(|path| path.exists())?;
    Some(AppImage {
        id: desktop.file_stem()?.to_string_lossy().into_owned(),
        name: entry.get("Name").unwrap_or("AppImage").to_owned(),
        summary: entry.get("Comment").map(str::to_owned),
        version: entry.get("X-AppImage-Version").map(str::to_owned),
        icon: entry.get("Icon").and_then(icon_path),
        size: path.metadata().map(|metadata| metadata.len()).unwrap_or(0),
        updatable: elf::section(&path, ".upd_info").is_some(),
        desktop: desktop.to_path_buf(),
        path,
    })
}

pub fn list() -> Vec<AppImage> {
    let Ok(entries) = std::fs::read_dir(applications()) else {
        return Vec::new();
    };
    let mut apps: Vec<AppImage> = entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| {
            path.extension()
                .is_some_and(|extension| extension == "desktop")
        })
        .filter_map(|path| read(&path))
        .collect();
    apps.sort_by_cached_key(|app| app.name.to_lowercase());
    apps
}

pub fn find(id: &str) -> Result<AppImage, String> {
    read(&applications().join(format!("{id}.desktop")))
        .ok_or_else(|| "That AppImage isn't installed any more.".into())
}
