use std::path::Path;

use serde::Serialize;

#[derive(Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Image,
    Video,
    Audio,
    Document,
}

const BROWSER_IMAGES: [&str; 13] = [
    "jpg", "jpeg", "jpe", "jfif", "png", "apng", "gif", "webp", "avif", "svg", "bmp", "ico", "cur",
];
const NATIVE_IMAGES: [&str; 16] = [
    "heic", "heif", "hif", "jxl", "tif", "tiff", "tga", "qoi", "exr", "jp2", "j2k", "pnm", "ppm",
    "pgm", "pbm", "svgz",
];
const VIDEOS: [&str; 9] = [
    "mp4", "m4v", "webm", "mkv", "mov", "ogv", "3gp", "avi", "ts",
];
const AUDIO: [&str; 11] = [
    "mp3", "flac", "ogg", "oga", "opus", "wav", "m4a", "aac", "weba", "mka", "m4b",
];

pub fn extension(path: &Path) -> String {
    path.extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase()
}

pub fn kind(path: &Path) -> Option<Kind> {
    let extension = extension(path);
    let extension = extension.as_str();
    if BROWSER_IMAGES.contains(&extension) || NATIVE_IMAGES.contains(&extension) {
        Some(Kind::Image)
    } else if VIDEOS.contains(&extension) {
        Some(Kind::Video)
    } else if AUDIO.contains(&extension) {
        Some(Kind::Audio)
    } else if extension == "pdf" {
        Some(Kind::Document)
    } else {
        None
    }
}

pub fn needs_native_decoding(path: &Path) -> bool {
    NATIVE_IMAGES.contains(&extension(path).as_str())
}

pub fn patterns() -> Vec<String> {
    BROWSER_IMAGES
        .iter()
        .chain(&NATIVE_IMAGES)
        .chain(&VIDEOS)
        .chain(&AUDIO)
        .chain(&["pdf"])
        .map(|extension| format!("*.{extension}"))
        .collect()
}
