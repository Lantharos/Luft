use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Range {
    pub start: f64,
    pub end: f64,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase", tag = "kind")]
pub enum Mark {
    Arrow {
        from: Point,
        to: Point,
        color: String,
        width: f64,
    },
    Line {
        from: Point,
        to: Point,
        color: String,
        width: f64,
    },
    Box {
        area: Rect,
        color: String,
        width: f64,
    },
    Ellipse {
        area: Rect,
        color: String,
        width: f64,
    },
    Highlight {
        area: Rect,
        color: String,
    },
    Text {
        at: Point,
        text: String,
        color: String,
        size: f64,
    },
    Blur {
        area: Rect,
        strength: f64,
    },
    Redact {
        area: Rect,
    },
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Edits {
    pub rotate: u32,
    pub flip_horizontal: bool,
    pub flip_vertical: bool,
    pub crop: Option<Rect>,
    pub brightness: f64,
    pub contrast: f64,
    pub saturation: f64,
    pub marks: Vec<Mark>,
    pub trim: Option<Range>,
}

impl Edits {
    pub fn reorients(&self) -> bool {
        !self.rotate.is_multiple_of(360) || self.flip_horizontal || self.flip_vertical
    }

    pub fn adjusts(&self) -> bool {
        self.brightness != 0.0 || self.contrast != 0.0 || self.saturation != 0.0
    }

    pub fn changes_pixels(&self) -> bool {
        self.reorients() || self.adjusts() || self.crop.is_some() || !self.marks.is_empty()
    }

    pub fn hides_content(&self) -> bool {
        self.crop.is_some() || !self.marks.is_empty()
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum PageSize {
    #[default]
    Fit,
    A4,
    Letter,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Audio {
    #[default]
    Keep,
    Remove,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Options {
    pub quality: u8,
    pub lossless: bool,
    pub target_bytes: Option<u64>,
    pub keep_metadata: bool,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub frame_rate: Option<f64>,
    pub video_codec: Option<String>,
    pub audio: Audio,
    pub audio_bitrate: Option<u32>,
    pub sample_rate: Option<u32>,
    pub channels: Option<u32>,
    pub hardware: bool,
    pub copy_streams: bool,
    pub dpi: u32,
    pub pages: String,
    pub split: bool,
    pub page_size: PageSize,
    pub level: u8,
}

impl Default for Options {
    fn default() -> Self {
        Self {
            quality: 82,
            lossless: false,
            target_bytes: None,
            keep_metadata: true,
            width: None,
            height: None,
            frame_rate: None,
            video_codec: None,
            audio: Audio::Keep,
            audio_bitrate: None,
            sample_rate: None,
            channels: None,
            hardware: true,
            copy_streams: true,
            dpi: 150,
            pages: String::new(),
            split: false,
            page_size: PageSize::Fit,
            level: 6,
        }
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Conflict {
    #[default]
    KeepBoth,
    Replace,
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Job {
    pub inputs: Vec<PathBuf>,
    pub format: String,
    pub temp: PathBuf,
    pub destination: PathBuf,
    pub conflict: Conflict,
    pub keep_times: bool,
    pub options: Options,
    pub edits: Edits,
}
