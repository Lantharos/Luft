use std::fs::File;
use std::io::BufReader;
use std::path::Path;

use matroska_demuxer::{Frame, MatroskaFile, TrackEntry, TrackType};

use super::{Cue, Streams, SubtitleTrack};

const LINGERING_CUE: f64 = 4.0;
const ASS_TEXT_FIELD: usize = 8;

type Matroska = MatroskaFile<BufReader<File>>;

fn open(path: &Path) -> Result<Matroska, String> {
    let file = File::open(path).map_err(|error| error.to_string())?;
    MatroskaFile::open(BufReader::new(file)).map_err(|error| error.to_string())
}

fn codec_name(codec: &str) -> &'static str {
    match codec {
        "V_MPEG4/ISO/AVC" => "H.264",
        "V_MPEGH/ISO/HEVC" => "HEVC",
        "V_AV1" => "AV1",
        "V_VP9" => "VP9",
        "V_VP8" => "VP8",
        "V_MPEG2" => "MPEG-2",
        "V_THEORA" => "Theora",
        "A_AAC" => "AAC",
        "A_AC3" => "Dolby Digital",
        "A_EAC3" => "Dolby Digital Plus",
        "A_TRUEHD" => "Dolby TrueHD",
        "A_OPUS" => "Opus",
        "A_VORBIS" => "Vorbis",
        "A_FLAC" => "FLAC",
        "A_MPEG/L3" => "MP3",
        codec if codec.starts_with("V_MPEG4") => "MPEG-4 Part 2",
        codec if codec.starts_with("A_DTS") => "DTS",
        codec if codec.starts_with("A_PCM") => "PCM",
        _ => "an uncommon format",
    }
}

fn is_text(codec: &str) -> bool {
    matches!(
        codec,
        "S_TEXT/UTF8"
            | "S_TEXT/ASCII"
            | "S_TEXT/WEBVTT"
            | "S_TEXT/ASS"
            | "S_TEXT/SSA"
            | "S_ASS"
            | "S_SSA"
    )
}

fn first_codec(tracks: &[TrackEntry], kind: TrackType) -> Option<&'static str> {
    tracks
        .iter()
        .find(|track| track.track_type() == kind)
        .map(|track| codec_name(track.codec_id()))
}

pub fn streams(path: &Path) -> Option<Streams> {
    let file = open(path).ok()?;
    let tracks = file.tracks();
    let subtitles = tracks
        .iter()
        .filter(|track| track.track_type() == TrackType::Subtitle && is_text(track.codec_id()))
        .map(|track| SubtitleTrack {
            id: format!("mkv:{}", track.track_number()),
            label: track.name().map(str::to_string),
            language: track
                .language_bcp47()
                .or(track.language())
                .filter(|language| *language != "und")
                .map(str::to_string),
            path: None,
        })
        .collect();
    Some(Streams {
        video: first_codec(tracks, TrackType::Video),
        audio: first_codec(tracks, TrackType::Audio),
        subtitles,
    })
}

fn ass_text(line: &str) -> String {
    let text = line
        .splitn(ASS_TEXT_FIELD + 1, ',')
        .nth(ASS_TEXT_FIELD)
        .unwrap_or(line);
    let mut plain = String::with_capacity(text.len());
    let mut in_override = false;
    for character in text.chars() {
        match character {
            '{' => in_override = true,
            '}' => in_override = false,
            _ if !in_override => plain.push(character),
            _ => {}
        }
    }
    plain
        .replace("\\N", "\n")
        .replace("\\n", "\n")
        .replace("\\h", " ")
}

pub fn cues(path: &Path, track: u64) -> Result<Vec<Cue>, String> {
    let mut file = open(path)?;
    let codec = file
        .tracks()
        .iter()
        .find(|entry| entry.track_number().get() == track)
        .map(|entry| entry.codec_id().to_string())
        .ok_or("Unknown track")?;
    let ass = codec.contains("ASS") || codec.contains("SSA");
    let seconds = file.info().timestamp_scale().get() as f64 / 1e9;
    let mut frame = Frame::default();
    let mut cues: Vec<Cue> = Vec::new();
    while file
        .next_frame(&mut frame)
        .map_err(|error| error.to_string())?
    {
        if frame.track != track {
            continue;
        }
        let raw = String::from_utf8_lossy(&frame.data);
        let text = if ass {
            ass_text(&raw)
        } else {
            raw.into_owned()
        };
        let start = frame.timestamp as f64 * seconds;
        let end = frame.duration.map_or(start + LINGERING_CUE, |duration| {
            start + duration as f64 * seconds
        });
        cues.push(Cue {
            start,
            end,
            text: text.trim().to_string(),
        });
    }
    cues.sort_by(|a, b| a.start.total_cmp(&b.start));
    Ok(cues)
}
