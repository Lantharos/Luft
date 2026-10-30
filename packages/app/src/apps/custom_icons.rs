use std::collections::HashMap;
use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::SystemTime;

const SEPARATOR: char = '~';
const EXTENSIONS: [&str; 2] = ["png", "svg"];

struct Index {
    modified: Option<SystemTime>,
    icons: HashMap<String, PathBuf>,
}

static INDEX: Mutex<Option<Index>> = Mutex::new(None);

fn data_dir() -> PathBuf {
    dirs::data_dir().unwrap_or_default()
}

fn folder() -> PathBuf {
    data_dir().join("luft").join("app-icons")
}

fn symbolic_path(desktop_id: &str) -> PathBuf {
    data_dir()
        .join("icons/hicolor/symbolic/apps")
        .join(format!("{}-symbolic.svg", base(desktop_id)))
}

fn base(desktop_id: &str) -> &str {
    desktop_id.strip_suffix(".desktop").unwrap_or(desktop_id)
}

fn extension(path: &Path) -> Option<&'static str> {
    let found = path.extension()?.to_str()?.to_ascii_lowercase();
    EXTENSIONS.into_iter().find(|known| *known == found)
}

fn scan(folder: &Path) -> HashMap<String, PathBuf> {
    fs::read_dir(folder)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            extension(&path)?;
            let (app, _) = path.file_stem()?.to_str()?.rsplit_once(SEPARATOR)?;
            Some((format!("{app}.desktop"), path))
        })
        .collect()
}

/// The icon the person chose for an app in place of its own. Overrides are
/// named `APP~VERSION.png` or `.svg`, so a replaced icon gets a new path and
/// nothing that caches images by path keeps showing the old one.
pub fn custom_icon(desktop_id: &str) -> Option<PathBuf> {
    let folder = folder();
    let modified = fs::metadata(&folder).and_then(|meta| meta.modified()).ok();
    let mut index = INDEX
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    if index
        .as_ref()
        .is_none_or(|index| index.modified != modified)
    {
        *index = Some(Index {
            modified,
            icons: scan(&folder),
        });
    }
    index.as_ref()?.icons.get(desktop_id).cloned()
}

pub fn has_custom_symbolic(desktop_id: &str) -> bool {
    symbolic_path(desktop_id).exists()
}

fn remove_custom_icon(desktop_id: &str) -> io::Result<()> {
    for (app, path) in scan(&folder()) {
        if app == desktop_id {
            fs::remove_file(path)?;
        }
    }
    Ok(())
}

pub fn set_custom_icon(desktop_id: &str, source: &Path) -> io::Result<()> {
    let extension = extension(source)
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "Choose a PNG or SVG image"))?;
    let bytes = fs::read(source)?;
    let mut hasher = DefaultHasher::new();
    bytes.hash(&mut hasher);
    let folder = folder();
    fs::create_dir_all(&folder)?;
    remove_custom_icon(desktop_id)?;
    let name = format!(
        "{}{SEPARATOR}{:016x}.{extension}",
        base(desktop_id),
        hasher.finish()
    );
    crate::files::replace(&folder.join(name), &bytes)
}

pub fn set_custom_symbolic(desktop_id: &str, source: &Path) -> io::Result<()> {
    if extension(source) != Some("svg") {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "Choose an SVG image",
        ));
    }
    crate::files::replace(&symbolic_path(desktop_id), &fs::read(source)?)
}

pub fn reset_custom_icons(desktop_id: &str) -> io::Result<()> {
    remove_custom_icon(desktop_id)?;
    match fs::remove_file(symbolic_path(desktop_id)) {
        Err(error) if error.kind() != io::ErrorKind::NotFound => Err(error),
        _ => Ok(()),
    }
}
