use std::collections::HashMap;
use std::sync::Arc;

use luft_app::Events;
use parking_lot::Mutex;
use serde::Serialize;
use zbus::interface;
use zbus::zvariant::{ObjectPath, OwnedValue};

use super::playback::{self, Repeat, Reported};
use crate::app::events::MEDIA_ACTION;

const MIMES: [&str; 8] = [
    "audio/mpeg",
    "audio/flac",
    "audio/ogg",
    "audio/opus",
    "audio/wav",
    "audio/mp4",
    "video/mp4",
    "video/webm",
];

#[derive(Serialize)]
#[serde(tag = "action", content = "value", rename_all = "camelCase")]
pub enum Action {
    Play,
    Pause,
    Toggle,
    Stop,
    Next,
    Previous,
    Seek(f64),
    Position(f64),
    Raise,
    Shuffle(bool),
    Repeat(Repeat),
    Volume(f64),
    Rate(f64),
}

pub type Shared = Arc<Mutex<Reported>>;

pub struct Root {
    pub events: Events,
}

#[interface(name = "org.mpris.MediaPlayer2")]
impl Root {
    fn raise(&self) {
        self.events.emit(MEDIA_ACTION, Action::Raise);
    }

    fn quit(&self) {}

    #[zbus(property)]
    fn can_quit(&self) -> bool {
        false
    }

    #[zbus(property)]
    fn can_raise(&self) -> bool {
        true
    }

    #[zbus(property)]
    fn has_track_list(&self) -> bool {
        false
    }

    #[zbus(property)]
    fn identity(&self) -> &str {
        "Magpie"
    }

    #[zbus(property)]
    fn desktop_entry(&self) -> &str {
        "com.lantharos.magpie"
    }

    #[zbus(property)]
    fn supported_uri_schemes(&self) -> Vec<&str> {
        vec!["file"]
    }

    #[zbus(property)]
    fn supported_mime_types(&self) -> Vec<&str> {
        MIMES.to_vec()
    }
}

pub struct Player {
    pub events: Events,
    pub state: Shared,
}

impl Player {
    fn send(&self, action: Action) {
        self.events.emit(MEDIA_ACTION, action);
    }
}

#[interface(name = "org.mpris.MediaPlayer2.Player")]
impl Player {
    fn next(&self) {
        self.send(Action::Next);
    }

    fn previous(&self) {
        self.send(Action::Previous);
    }

    fn pause(&self) {
        self.send(Action::Pause);
    }

    fn play_pause(&self) {
        self.send(Action::Toggle);
    }

    fn stop(&self) {
        self.send(Action::Stop);
    }

    fn play(&self) {
        self.send(Action::Play);
    }

    fn seek(&self, offset: i64) {
        self.send(Action::Seek(playback::seconds(offset)));
    }

    fn set_position(&self, track: ObjectPath<'_>, position: i64) {
        if track == playback::track_path(self.state.lock().playback.track) {
            self.send(Action::Position(playback::seconds(position)));
        }
    }

    fn open_uri(&self, _uri: &str) {}

    #[zbus(property)]
    fn playback_status(&self) -> &'static str {
        self.state.lock().playback.status.name()
    }

    #[zbus(property)]
    fn loop_status(&self) -> &'static str {
        self.state.lock().playback.repeat.name()
    }

    #[zbus(property)]
    fn set_loop_status(&self, value: String) {
        self.send(Action::Repeat(Repeat::from_name(&value)));
    }

    #[zbus(property)]
    fn rate(&self) -> f64 {
        self.state.lock().playback.rate
    }

    #[zbus(property)]
    fn set_rate(&self, rate: f64) {
        self.send(Action::Rate(rate));
    }

    #[zbus(property)]
    fn shuffle(&self) -> bool {
        self.state.lock().playback.shuffle
    }

    #[zbus(property)]
    fn set_shuffle(&self, shuffle: bool) {
        self.send(Action::Shuffle(shuffle));
    }

    #[zbus(property)]
    fn metadata(&self) -> HashMap<String, OwnedValue> {
        playback::metadata(&self.state.lock().playback)
    }

    #[zbus(property)]
    fn volume(&self) -> f64 {
        self.state.lock().playback.volume
    }

    #[zbus(property)]
    fn set_volume(&self, volume: f64) {
        self.send(Action::Volume(volume.clamp(0.0, 1.0)));
    }

    #[zbus(property(emits_changed_signal = "false"))]
    fn position(&self) -> i64 {
        self.state.lock().position()
    }

    #[zbus(property)]
    fn minimum_rate(&self) -> f64 {
        0.25
    }

    #[zbus(property)]
    fn maximum_rate(&self) -> f64 {
        2.0
    }

    #[zbus(property)]
    fn can_go_next(&self) -> bool {
        self.state.lock().playback.can_next
    }

    #[zbus(property)]
    fn can_go_previous(&self) -> bool {
        self.state.lock().playback.can_previous
    }

    #[zbus(property)]
    fn can_play(&self) -> bool {
        true
    }

    #[zbus(property)]
    fn can_pause(&self) -> bool {
        true
    }

    #[zbus(property)]
    fn can_seek(&self) -> bool {
        self.state.lock().playback.length.is_some()
    }

    #[zbus(property)]
    fn can_control(&self) -> bool {
        true
    }
}
