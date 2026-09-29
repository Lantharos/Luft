use std::collections::HashMap;
use std::time::Instant;

use gio::prelude::*;
use serde::{Deserialize, Serialize};
use zbus::zvariant::{ObjectPath, OwnedValue, Value};

const MICROSECONDS: f64 = 1_000_000.0;

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum Status {
    Playing,
    Paused,
    #[default]
    Stopped,
}

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum Repeat {
    #[default]
    None,
    Track,
    Playlist,
}

impl Status {
    pub fn name(self) -> &'static str {
        match self {
            Self::Playing => "Playing",
            Self::Paused => "Paused",
            Self::Stopped => "Stopped",
        }
    }
}

impl Repeat {
    pub fn name(self) -> &'static str {
        match self {
            Self::None => "None",
            Self::Track => "Track",
            Self::Playlist => "Playlist",
        }
    }

    pub fn from_name(name: &str) -> Self {
        match name {
            "Track" => Self::Track,
            "Playlist" => Self::Playlist,
            _ => Self::None,
        }
    }
}

#[derive(Deserialize, Clone, PartialEq, Default)]
#[serde(rename_all = "camelCase")]
pub struct Playback {
    pub track: u32,
    pub status: Status,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub art: Option<String>,
    pub path: Option<String>,
    pub length: Option<f64>,
    pub position: f64,
    pub rate: f64,
    pub volume: f64,
    pub shuffle: bool,
    pub repeat: Repeat,
    pub can_next: bool,
    pub can_previous: bool,
}

pub struct Reported {
    pub playback: Playback,
    at: Instant,
}

impl Reported {
    pub fn new(playback: Playback) -> Self {
        Self {
            playback,
            at: Instant::now(),
        }
    }

    pub fn position(&self) -> i64 {
        let playback = &self.playback;
        let elapsed = if playback.status == Status::Playing {
            self.at.elapsed().as_secs_f64() * playback.rate
        } else {
            0.0
        };
        let position = playback.position + elapsed;
        let position = playback
            .length
            .map_or(position, |length| position.min(length));
        (position * MICROSECONDS) as i64
    }
}

pub fn microseconds(seconds: f64) -> i64 {
    (seconds * MICROSECONDS) as i64
}

pub fn seconds(microseconds: i64) -> f64 {
    microseconds as f64 / MICROSECONDS
}

fn owned(value: Value<'_>) -> Option<OwnedValue> {
    value.try_into_owned().ok()
}

fn file_uri(path: &str) -> String {
    gio::File::for_path(path).uri().to_string()
}

pub fn track_path(track: u32) -> ObjectPath<'static> {
    ObjectPath::try_from(format!("/dev/lantharos/magpie/track/{track}"))
        .expect("track numbers form a valid object path")
}

pub fn metadata(playback: &Playback) -> HashMap<String, OwnedValue> {
    let mut metadata: HashMap<String, OwnedValue> = HashMap::new();
    let mut insert = |key: &str, value: Option<Value<'_>>| {
        if let Some(value) = value.and_then(owned) {
            metadata.insert(key.to_string(), value);
        }
    };
    insert(
        "mpris:trackid",
        Some(Value::from(track_path(playback.track))),
    );
    insert(
        "mpris:length",
        playback
            .length
            .map(|length| Value::from(microseconds(length))),
    );
    insert(
        "mpris:artUrl",
        playback
            .art
            .as_deref()
            .map(|art| Value::from(file_uri(art))),
    );
    insert(
        "xesam:url",
        playback
            .path
            .as_deref()
            .map(|path| Value::from(file_uri(path))),
    );
    insert("xesam:title", playback.title.clone().map(Value::from));
    insert("xesam:album", playback.album.clone().map(Value::from));
    insert(
        "xesam:artist",
        playback
            .artist
            .clone()
            .map(|artist| Value::from(vec![artist])),
    );
    metadata
}
