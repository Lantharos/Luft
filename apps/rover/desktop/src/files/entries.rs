use std::collections::HashSet;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::SystemTime;

use gio::prelude::*;
use luft_app::launch;
use parking_lot::Mutex;
use rustc_hash::FxHashMap;
use serde::Serialize;

use super::privileged::{is_permission_error, os, run_pkexec};
use crate::files::text::quoted;
use crate::history::{History, Step};
use crate::locations::drives;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub is_file: bool,
    pub is_hidden: bool,
    pub size: u64,
    pub modified: Option<i64>,
    pub mime_type: Option<String>,
    pub extension: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DirectoryContents {
    pub path: String,
    pub entries: Vec<FileEntry>,
}

#[derive(Debug, Clone, Serialize)]
pub struct UserDirs {
    pub home: String,
    pub documents: Option<String>,
    pub downloads: Option<String>,
    pub pictures: Option<String>,
    pub videos: Option<String>,
    pub music: Option<String>,
    pub desktop: Option<String>,
}

pub fn list_directory(path: String, show_hidden: bool) -> Result<DirectoryContents, String> {
    let directory = PathBuf::from(&path);
    if !directory.is_dir() {
        return Err(if directory.exists() {
            format!("Path is not a directory: {path}")
        } else {
            format!("Path does not exist: {path}")
        });
    }

    let mount_points: HashSet<PathBuf> = drives::visible_mount_points()
        .into_iter()
        .map(PathBuf::from)
        .collect();

    let entries = fs::read_dir(&directory)
        .map_err(|error| error.to_string())?
        .flatten()
        .filter(|entry| show_hidden || !entry.file_name().as_encoded_bytes().starts_with(b"."))
        .map(|entry| entry.path())
        .filter(|entry_path| !mount_points.contains(entry_path))
        .filter_map(|entry_path| file_entry(&entry_path).ok())
        .collect();

    Ok(DirectoryContents { path, entries })
}

pub fn get_file_info(path: String) -> Result<FileEntry, String> {
    file_entry(Path::new(&path)).map_err(|error| error.to_string())
}

pub fn create_file(path: String, name: String, history: &History) -> Result<FileEntry, String> {
    let file_path = PathBuf::from(path).join(name);
    match fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&file_path)
    {
        Ok(_) => {}
        Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
            return Err(format!("File already exists: {}", file_path.display()));
        }
        Err(error) if is_permission_error(&error) => {
            run_pkexec("touch", &[os("--"), file_path.as_os_str().into()])?;
        }
        Err(error) => return Err(error.to_string()),
    }
    record_created(&file_path, history);
    file_entry(&file_path).map_err(|error| error.to_string())
}

pub fn create_directory(
    path: String,
    name: String,
    history: &History,
) -> Result<FileEntry, String> {
    let dir_path = PathBuf::from(path).join(name);
    match fs::create_dir(&dir_path) {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
            return Err(format!("Folder already exists: {}", dir_path.display()));
        }
        Err(error) if is_permission_error(&error) => {
            run_pkexec("mkdir", &[os("--"), dir_path.as_os_str().into()])?;
        }
        Err(error) => return Err(error.to_string()),
    }
    record_created(&dir_path, history);
    file_entry(&dir_path).map_err(|error| error.to_string())
}

pub fn rename_item(path: String, new_name: String, history: &History) -> Result<FileEntry, String> {
    let old_path = PathBuf::from(path);
    let parent = old_path.parent().ok_or("Cannot rename the root folder")?;
    let new_path = parent.join(new_name);

    match super::rename_no_replace(&old_path, &new_path) {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
            return Err("An item with that name already exists".to_string());
        }
        Err(error) if is_permission_error(&error) => {
            run_pkexec(
                "mv",
                &[
                    os("--no-clobber"),
                    os("--"),
                    old_path.as_os_str().into(),
                    new_path.as_os_str().into(),
                ],
            )?;
        }
        Err(error) => return Err(error.to_string()),
    }
    history.record(
        format!("Renamed {} to {}", quoted(&old_path), quoted(&new_path)),
        format!(
            "Renamed {} back to {}",
            quoted(&new_path),
            quoted(&old_path)
        ),
        vec![Step::Moved {
            from: old_path,
            to: new_path.clone(),
        }],
        false,
    );
    file_entry(&new_path).map_err(|error| error.to_string())
}

fn record_created(path: &Path, history: &History) {
    history.record(
        format!("Created {}", quoted(path)),
        format!("Moved {} to the trash", quoted(path)),
        vec![Step::Created(path.to_path_buf())],
        false,
    );
}

pub fn user_dirs() -> Result<UserDirs, String> {
    let display = |path: PathBuf| path.to_string_lossy().into_owned();
    Ok(UserDirs {
        home: dirs::home_dir()
            .map(display)
            .ok_or("Could not determine home directory")?,
        documents: dirs::document_dir().map(display),
        downloads: dirs::download_dir().map(display),
        pictures: dirs::picture_dir().map(display),
        videos: dirs::video_dir().map(display),
        music: dirs::audio_dir().map(display),
        desktop: dirs::desktop_dir().map(display),
    })
}

pub fn open_with_default(path: &str, token: Option<&str>) -> Result<(), String> {
    launch::open(&gio::File::for_path(path).uri(), token).map_err(|error| error.to_string())
}

pub(crate) fn file_entry(path: &Path) -> std::io::Result<FileEntry> {
    let metadata = fs::symlink_metadata(path)?;
    let target = if metadata.is_symlink() {
        fs::metadata(path).ok()
    } else {
        Some(metadata.clone())
    };
    let is_dir = target.as_ref().is_some_and(fs::Metadata::is_dir);
    let is_file = target.as_ref().is_some_and(fs::Metadata::is_file);
    let name = path
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
        .unwrap_or_default();
    let mime_type = is_file.then(|| mime_type(path, &name)).flatten();

    Ok(FileEntry {
        is_hidden: name.starts_with('.'),
        name,
        path: path.to_string_lossy().into_owned(),
        is_dir,
        is_file,
        size: target.as_ref().map_or(0, fs::Metadata::len),
        modified: metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(SystemTime::UNIX_EPOCH).ok())
            .map(|duration| duration.as_secs() as i64),
        mime_type,
        extension: is_file
            .then(|| {
                path.extension()
                    .map(|ext| ext.to_string_lossy().into_owned())
            })
            .flatten(),
    })
}

const SUFFIX_TYPES: [(&str, &str); 2] = [("mdx", "text/markdown"), ("otf", "font/otf")];

static SUFFIX_MIME_TYPES: Mutex<Option<FxHashMap<String, Option<Arc<str>>>>> = Mutex::new(None);

fn mime_type(path: &Path, name: &str) -> Option<String> {
    let suffix = name
        .char_indices()
        .skip(1)
        .find(|&(_, character)| character == '.')
        .map(|(dot, _)| &name[dot + 1..]);
    match suffix.and_then(suffix_mime_type) {
        Some(mime) => Some(mime.to_string()),
        None => sniffed_mime_type(path).map(str::to_owned),
    }
}

fn suffix_mime_type(suffix: &str) -> Option<Arc<str>> {
    let mut known = SUFFIX_MIME_TYPES.lock();
    let known = known.get_or_insert_with(FxHashMap::default);
    if let Some(mime) = known.get(suffix) {
        return mime.clone();
    }
    let mime = guessed_mime_type(suffix);
    known.insert(suffix.to_owned(), mime.clone());
    mime
}

fn guessed_mime_type(suffix: &str) -> Option<Arc<str>> {
    if let Some((_, mime)) = SUFFIX_TYPES
        .iter()
        .find(|(known, _)| known.eq_ignore_ascii_case(suffix))
    {
        return Some(Arc::from(*mime));
    }
    let (content_type, _) = gio::content_type_guess(Some(format!("file.{suffix}")), None);
    if gio::content_type_is_unknown(&content_type) {
        return None;
    }
    gio::content_type_get_mime_type(&content_type).map(|mime| Arc::from(mime.as_str()))
}

fn sniffed_mime_type(path: &Path) -> Option<&'static str> {
    let mut bytes = [0_u8; 512];
    let read = fs::File::open(path).ok()?.read(&mut bytes).ok()?;
    let bytes = &bytes[..read];
    if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        Some("image/png")
    } else if bytes.starts_with(b"\xff\xd8\xff") {
        Some("image/jpeg")
    } else if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        Some("image/gif")
    } else if bytes.starts_with(b"BM") {
        Some("image/bmp")
    } else if bytes.starts_with(&[0, 0, 1, 0]) {
        Some("image/vnd.microsoft.icon")
    } else if bytes.len() >= 12 && bytes.starts_with(b"RIFF") && &bytes[8..12] == b"WEBP" {
        Some("image/webp")
    } else if bytes.starts_with(b"\x7fELF") {
        Some("application/x-executable")
    } else if bytes.contains(&0) {
        None
    } else {
        let text = std::str::from_utf8(bytes).ok()?;
        Some(if text.trim_start().starts_with("<svg") {
            "image/svg+xml"
        } else {
            "text/plain"
        })
    }
}
