use std::fs;
use std::path::Path;

use super::SubtitleTrack;
use crate::folder::kinds::extension;

const SUBTITLE_EXTENSIONS: [&str; 2] = ["srt", "vtt"];

pub fn find(video: &Path) -> Vec<SubtitleTrack> {
    let (Some(folder), Some(stem)) = (video.parent(), video.file_stem()) else {
        return Vec::new();
    };
    let stem = stem.to_string_lossy();
    let Ok(entries) = fs::read_dir(folder) else {
        return Vec::new();
    };
    let mut tracks: Vec<SubtitleTrack> = entries
        .flatten()
        .map(|entry| entry.path())
        .filter(|path| SUBTITLE_EXTENSIONS.contains(&extension(path).as_str()))
        .filter_map(|path| {
            let name = path.file_stem()?.to_string_lossy().into_owned();
            let rest = name.strip_prefix(stem.as_ref())?;
            if !rest.is_empty() && !rest.starts_with('.') {
                return None;
            }
            let label = rest.trim_start_matches('.').to_string();
            let language = (2..=3)
                .contains(&label.len())
                .then(|| label.to_lowercase())
                .filter(|code| {
                    code.chars()
                        .all(|character| character.is_ascii_alphabetic())
                });
            Some(SubtitleTrack {
                id: format!("file:{}", path.to_string_lossy()),
                label: (!label.is_empty()).then_some(label),
                language,
                path: Some(path.to_string_lossy().into_owned()),
            })
        })
        .collect();
    tracks.sort_by(|a, b| a.id.cmp(&b.id));
    tracks
}
