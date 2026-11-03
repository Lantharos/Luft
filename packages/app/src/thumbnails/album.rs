use std::path::{Path, PathBuf};

const NAMES: [&str; 8] = [
    "cover", "Cover", "folder", "Folder", "front", "Front", "album", "Album",
];
const EXTENSIONS: [&str; 4] = ["jpg", "jpeg", "png", "webp"];

pub(super) fn is_music(mime: &str) -> bool {
    mime.starts_with("audio/")
}

pub(super) fn folder_cover(mime: &str, track: &Path) -> Option<PathBuf> {
    if !is_music(mime) {
        return None;
    }
    let folder = track.parent()?;
    NAMES
        .iter()
        .flat_map(|name| EXTENSIONS.map(|extension| folder.join(format!("{name}.{extension}"))))
        .find(|candidate| candidate.is_file())
}
