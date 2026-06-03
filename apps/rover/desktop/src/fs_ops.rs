use crate::drives;
use crate::file_actions::{os, run_pkexec};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::io::Read;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

const MAX_THUMBNAIL_BYTES: u64 = 8 * 1024 * 1024;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub is_file: bool,
    pub is_symlink: bool,
    pub is_hidden: bool,
    pub size: u64,
    pub modified: Option<i64>,
    pub created: Option<i64>,
    pub accessed: Option<i64>,
    pub mime_type: Option<String>,
    pub extension: Option<String>,
    pub permissions: u32,
    pub uid: u32,
    pub gid: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DirectoryContents {
    pub path: String,
    pub entries: Vec<FileEntry>,
    pub total_items: usize,
    pub total_size: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserDirs {
    pub home: String,
    pub documents: Option<String>,
    pub downloads: Option<String>,
    pub pictures: Option<String>,
    pub videos: Option<String>,
    pub music: Option<String>,
    pub desktop: Option<String>,
}

fn system_time_to_timestamp(time: std::io::Result<SystemTime>) -> Option<i64> {
    time.ok()
        .and_then(|t| t.duration_since(SystemTime::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64)
}

fn get_mime_type(path: &Path) -> Option<String> {
    mime_guess::from_path(path).first().map(|m| m.to_string())
}

fn detect_image_mime(path: &Path) -> Option<String> {
    let guessed = get_mime_type(path);
    if guessed
        .as_deref()
        .is_some_and(|mime| mime.starts_with("image/"))
    {
        return guessed;
    }
    if guessed
        .as_deref()
        .is_some_and(|mime| mime != "application/octet-stream")
    {
        return None;
    }

    let mut file = fs::File::open(path).ok()?;
    let mut bytes = [0_u8; 512];
    let bytes_read = file.read(&mut bytes).ok()?;
    let bytes = &bytes[..bytes_read];
    let mime = if bytes.starts_with(b"\x89PNG\r\n\x1a\n") {
        "image/png"
    } else if bytes.starts_with(b"\xff\xd8\xff") {
        "image/jpeg"
    } else if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        "image/gif"
    } else if bytes.starts_with(b"BM") {
        "image/bmp"
    } else if bytes.len() >= 12 && bytes.starts_with(b"RIFF") && &bytes[8..12] == b"WEBP" {
        "image/webp"
    } else if String::from_utf8_lossy(&bytes[..bytes.len().min(512)])
        .trim_start()
        .starts_with("<svg")
    {
        "image/svg+xml"
    } else {
        return None;
    };

    Some(mime.to_string())
}

fn file_entry_from_path(path: &Path) -> std::io::Result<FileEntry> {
    let metadata = fs::symlink_metadata(path)?;
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();

    let is_hidden = name.starts_with('.');
    let is_symlink = metadata.is_symlink();

    // For symlinks, get the target's metadata for type determination
    let (is_dir, is_file, size) = if is_symlink {
        match fs::metadata(path) {
            Ok(target_meta) => (
                target_meta.is_dir(),
                target_meta.is_file(),
                target_meta.len(),
            ),
            Err(_) => (false, false, 0), // Broken symlink
        }
    } else {
        (metadata.is_dir(), metadata.is_file(), metadata.len())
    };

    let extension = if is_file {
        path.extension().map(|e| e.to_string_lossy().to_string())
    } else {
        None
    };

    let mime_type = if is_file {
        detect_image_mime(path).or_else(|| get_mime_type(path))
    } else {
        None
    };

    Ok(FileEntry {
        name,
        path: path.to_string_lossy().to_string(),
        is_dir,
        is_file,
        is_symlink,
        is_hidden,
        size,
        modified: system_time_to_timestamp(metadata.modified()),
        created: system_time_to_timestamp(metadata.created()),
        accessed: system_time_to_timestamp(metadata.accessed()),
        mime_type,
        extension,
        permissions: metadata.mode(),
        uid: metadata.uid(),
        gid: metadata.gid(),
    })
}

pub fn list_directory(path: String, show_hidden: bool) -> Result<DirectoryContents, String> {
    let path_buf = PathBuf::from(&path);

    if !path_buf.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    if !path_buf.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let mut entries = Vec::new();
    let mut total_size = 0u64;
    let mount_points: HashSet<PathBuf> = drives::visible_mount_points()
        .unwrap_or_default()
        .into_iter()
        .map(PathBuf::from)
        .collect();

    let read_dir = fs::read_dir(&path_buf).map_err(|e| e.to_string())?;

    for entry in read_dir.flatten() {
        let entry_path = entry.path();
        if mount_points.contains(&entry_path) {
            continue;
        }

        if let Ok(file_entry) = file_entry_from_path(&entry_path) {
            if !show_hidden && file_entry.is_hidden {
                continue;
            }
            total_size += file_entry.size;
            entries.push(file_entry);
        }
    }

    // Sort: directories first, then files, alphabetically
    entries.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    let total_items = entries.len();

    Ok(DirectoryContents {
        path,
        entries,
        total_items,
        total_size,
    })
}

pub fn get_file_info(path: String) -> Result<FileEntry, String> {
    let path_buf = PathBuf::from(&path);
    file_entry_from_path(&path_buf).map_err(|e| e.to_string())
}

pub fn create_file(path: String, name: String) -> Result<FileEntry, String> {
    let file_path = PathBuf::from(&path).join(&name);

    if file_path.exists() {
        return Err(format!("File already exists: {}", file_path.display()));
    }

    match fs::File::create(&file_path) {
        Ok(_) => {}
        Err(error) if error.kind() == std::io::ErrorKind::PermissionDenied => {
            run_pkexec("touch", &[os("--"), file_path.as_os_str().into()])?;
        }
        Err(error) => return Err(error.to_string()),
    }
    file_entry_from_path(&file_path).map_err(|e| e.to_string())
}

pub fn create_directory(path: String, name: String) -> Result<FileEntry, String> {
    let dir_path = PathBuf::from(&path).join(&name);

    if dir_path.exists() {
        return Err(format!("Directory already exists: {}", dir_path.display()));
    }

    match fs::create_dir(&dir_path) {
        Ok(_) => {}
        Err(error) if error.kind() == std::io::ErrorKind::PermissionDenied => {
            run_pkexec("mkdir", &[os("--"), dir_path.as_os_str().into()])?;
        }
        Err(error) => return Err(error.to_string()),
    }
    file_entry_from_path(&dir_path).map_err(|e| e.to_string())
}

pub fn rename_item(path: String, new_name: String) -> Result<FileEntry, String> {
    let old_path = PathBuf::from(&path);
    let parent = old_path.parent().ok_or("Cannot get parent directory")?;
    let new_path = parent.join(&new_name);

    if new_path.exists() {
        return Err(format!("An item with that name already exists"));
    }

    match fs::rename(&old_path, &new_path) {
        Ok(_) => {}
        Err(error) if error.kind() == std::io::ErrorKind::PermissionDenied => {
            run_pkexec(
                "mv",
                &[
                    os("--"),
                    old_path.as_os_str().into(),
                    new_path.as_os_str().into(),
                ],
            )?;
        }
        Err(error) => return Err(error.to_string()),
    }
    file_entry_from_path(&new_path).map_err(|e| e.to_string())
}

pub fn get_home_dir() -> Result<String, String> {
    dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine home directory".to_string())
}

pub fn get_user_dirs() -> Result<UserDirs, String> {
    let home = dirs::home_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "Could not determine home directory".to_string())?;

    Ok(UserDirs {
        home,
        documents: dirs::document_dir().map(|p| p.to_string_lossy().to_string()),
        downloads: dirs::download_dir().map(|p| p.to_string_lossy().to_string()),
        pictures: dirs::picture_dir().map(|p| p.to_string_lossy().to_string()),
        videos: dirs::video_dir().map(|p| p.to_string_lossy().to_string()),
        music: dirs::audio_dir().map(|p| p.to_string_lossy().to_string()),
        desktop: dirs::desktop_dir().map(|p| p.to_string_lossy().to_string()),
    })
}

pub fn read_text_file(path: String, max_bytes: Option<usize>) -> Result<String, String> {
    let path_buf = PathBuf::from(&path);
    let max = max_bytes.unwrap_or(1024 * 1024); // Default 1MB limit

    let content = fs::read(&path_buf).map_err(|e| e.to_string())?;

    if content.len() > max {
        let truncated = &content[..max];
        return Ok(String::from_utf8_lossy(truncated).to_string());
    }

    String::from_utf8(content).map_err(|_| "File is not valid UTF-8 text".to_string())
}

pub fn open_with_default(path: String) -> Result<(), String> {
    open::that(&path).map_err(|e| e.to_string())
}

pub fn get_thumbnail(path: String) -> Result<Option<String>, String> {
    let path_buf = PathBuf::from(&path);
    if !path_buf.is_file() {
        return Ok(None);
    }

    if detect_image_mime(&path_buf).is_none() {
        return Ok(None);
    }

    let metadata = fs::metadata(&path_buf).map_err(|e| e.to_string())?;
    if metadata.len() > MAX_THUMBNAIL_BYTES {
        return Ok(None);
    }

    Ok(Some(path))
}
