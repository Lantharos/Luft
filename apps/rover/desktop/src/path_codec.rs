use std::collections::HashMap;

use serde_json::Value;

use crate::settings::Settings;

pub fn normalize_path(path: impl Into<String>) -> String {
    let path = path.into();
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return String::new();
    }

    let candidate = trimmed
        .strip_prefix("file://localhost")
        .or_else(|| trimmed.strip_prefix("file://"))
        .unwrap_or(trimmed);

    let decoded = percent_decode(candidate).unwrap_or_else(|| candidate.to_string());
    if decoded.starts_with('/') {
        decoded
    } else {
        trimmed.to_string()
    }
}

pub fn normalize_json_paths(value: &mut Value) {
    match value {
        Value::Array(items) => {
            for item in items {
                normalize_json_paths(item);
            }
        }
        Value::Object(object) => {
            for (key, value) in object {
                match value {
                    Value::String(path) if is_single_path_key(key) => {
                        *path = normalize_path(std::mem::take(path));
                    }
                    Value::Array(paths) if is_path_list_key(key) => {
                        for path in paths {
                            if let Value::String(path) = path {
                                *path = normalize_path(std::mem::take(path));
                            } else {
                                normalize_json_paths(path);
                            }
                        }
                    }
                    _ => normalize_json_paths(value),
                }
            }
        }
        _ => {}
    }
}

pub fn normalize_settings(settings: &mut Settings) {
    let mut folder_view_modes = HashMap::with_capacity(settings.folder_view_modes.len());
    for (path, mode) in settings.folder_view_modes.drain() {
        folder_view_modes.insert(normalize_path(path), mode);
    }
    settings.folder_view_modes = folder_view_modes;

    for favorite in &mut settings.favorites {
        favorite.path = normalize_path(std::mem::take(&mut favorite.path));
    }
    for folder in &mut settings.pinned_folders {
        folder.path = normalize_path(std::mem::take(&mut folder.path));
    }
    for path in &mut settings.recent_paths {
        *path = normalize_path(std::mem::take(path));
    }
}

fn is_single_path_key(key: &str) -> bool {
    matches!(
        key,
        "path"
            | "mountPoint"
            | "mount_point"
            | "destination"
            | "root"
            | "filePath"
            | "file_path"
            | "trashPath"
            | "trash_path"
            | "originalPath"
            | "original_path"
    )
}

fn is_path_list_key(key: &str) -> bool {
    matches!(
        key,
        "paths" | "sources" | "files" | "recentPaths" | "recent_paths"
    )
}

fn percent_decode(input: &str) -> Option<String> {
    let bytes = input.as_bytes();
    if !bytes.contains(&b'%') {
        return None;
    }

    let mut output = Vec::with_capacity(bytes.len());
    let mut changed = false;
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' && index + 2 < bytes.len() {
            if let (Some(high), Some(low)) =
                (hex_value(bytes[index + 1]), hex_value(bytes[index + 2]))
            {
                output.push((high << 4) | low);
                index += 3;
                changed = true;
                continue;
            }
        }
        output.push(bytes[index]);
        index += 1;
    }

    changed.then(|| String::from_utf8(output).ok()).flatten()
}

fn hex_value(byte: u8) -> Option<u8> {
    match byte {
        b'0'..=b'9' => Some(byte - b'0'),
        b'a'..=b'f' => Some(byte - b'a' + 10),
        b'A'..=b'F' => Some(byte - b'A' + 10),
        _ => None,
    }
}
