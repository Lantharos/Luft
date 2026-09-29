mod external;
mod matroska;
mod mp4;

use std::path::Path;

use serde::Serialize;

use crate::folder::kinds::extension;

#[derive(Serialize, Default)]
pub struct VideoInfo {
    video: Option<&'static str>,
    audio: Option<&'static str>,
    subtitles: Vec<SubtitleTrack>,
}

#[derive(Serialize)]
pub struct SubtitleTrack {
    id: String,
    label: Option<String>,
    language: Option<String>,
    path: Option<String>,
}

#[derive(Serialize)]
pub struct Cue {
    start: f64,
    end: f64,
    text: String,
}

struct Streams {
    video: Option<&'static str>,
    audio: Option<&'static str>,
    subtitles: Vec<SubtitleTrack>,
}

pub fn info(path: &Path) -> VideoInfo {
    let streams = match extension(path).as_str() {
        "mkv" | "webm" => matroska::streams(path),
        _ => mp4::streams(path),
    };
    let mut info = streams
        .map(|streams| VideoInfo {
            video: streams.video,
            audio: streams.audio,
            subtitles: streams.subtitles,
        })
        .unwrap_or_default();
    info.subtitles.splice(0..0, external::find(path));
    info
}

pub fn cues(path: &Path, id: &str) -> Result<Vec<Cue>, String> {
    match id.split_once(':') {
        Some(("mkv", track)) => matroska::cues(path, track.parse().map_err(|_| "Unknown track")?),
        Some(("mp4", track)) => mp4::cues(path, track.parse().map_err(|_| "Unknown track")?),
        _ => Err("Unknown track".into()),
    }
}
