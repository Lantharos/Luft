mod interfaces;
mod playback;

use std::collections::HashMap;
use std::sync::Arc;

use luft_app::{Events, dbus};
use parking_lot::Mutex;
use zbus::zvariant::Value;

use interfaces::{Player, Root, Shared};
pub use playback::Playback;
use playback::Reported;

const BUS_NAME: &str = "org.mpris.MediaPlayer2.magpie";
const PATH: &str = "/org/mpris/MediaPlayer2";
const PLAYER: &str = "org.mpris.MediaPlayer2.Player";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const SEEK_TOLERANCE: f64 = 1.0;

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

#[derive(Clone)]
pub struct Mpris {
    events: Events,
    state: Shared,
    published: Arc<Mutex<bool>>,
}

impl Mpris {
    pub fn new(events: Events) -> Self {
        Self {
            events,
            state: Arc::new(Mutex::new(Reported::new(Playback::default()))),
            published: Arc::default(),
        }
    }

    pub fn update(&self, playback: Playback) -> Result<(), String> {
        let connection = dbus::session()?;
        let mut published = self.published.lock();
        let previous = std::mem::replace(&mut *self.state.lock(), Reported::new(playback.clone()));
        if !*published {
            let server = connection.object_server();
            server
                .at(
                    PATH,
                    Root {
                        events: self.events.clone(),
                    },
                )
                .map_err(failed)?;
            server
                .at(
                    PATH,
                    Player {
                        events: self.events.clone(),
                        state: self.state.clone(),
                    },
                )
                .map_err(failed)?;
            connection.request_name(BUS_NAME).map_err(failed)?;
            *published = true;
            return Ok(());
        }
        let changed = changes(&previous.playback, &playback);
        if !changed.is_empty() {
            connection
                .emit_signal(
                    None::<&str>,
                    PATH,
                    PROPERTIES,
                    "PropertiesChanged",
                    &(PLAYER, changed, Vec::<&str>::new()),
                )
                .map_err(failed)?;
        }
        let expected = playback::seconds(previous.position());
        if previous.playback.track == playback.track
            && (expected - playback.position).abs() > SEEK_TOLERANCE
        {
            connection
                .emit_signal(
                    None::<&str>,
                    PATH,
                    PLAYER,
                    "Seeked",
                    &(playback::microseconds(playback.position),),
                )
                .map_err(failed)?;
        }
        Ok(())
    }

    pub fn clear(&self) -> Result<(), String> {
        let mut published = self.published.lock();
        if !*published {
            return Ok(());
        }
        let connection = dbus::session()?;
        connection.release_name(BUS_NAME).map_err(failed)?;
        let server = connection.object_server();
        server.remove::<Player, _>(PATH).map_err(failed)?;
        server.remove::<Root, _>(PATH).map_err(failed)?;
        *published = false;
        Ok(())
    }
}

fn changes(previous: &Playback, next: &Playback) -> HashMap<&'static str, Value<'static>> {
    let mut changed: HashMap<&'static str, Value<'static>> = HashMap::new();
    if previous.status != next.status {
        changed.insert("PlaybackStatus", Value::from(next.status.name()));
    }
    let described = |playback: &Playback| {
        (
            playback.track,
            playback.title.clone(),
            playback.artist.clone(),
            playback.album.clone(),
            playback.art.clone(),
            playback.path.clone(),
            playback.length.map(f64::to_bits),
        )
    };
    if described(previous) != described(next) {
        changed.insert("Metadata", Value::from(playback::metadata(next)));
    }
    if previous.rate != next.rate {
        changed.insert("Rate", Value::from(next.rate));
    }
    if previous.volume != next.volume {
        changed.insert("Volume", Value::from(next.volume));
    }
    if previous.shuffle != next.shuffle {
        changed.insert("Shuffle", Value::from(next.shuffle));
    }
    if previous.repeat != next.repeat {
        changed.insert("LoopStatus", Value::from(next.repeat.name()));
    }
    if previous.can_next != next.can_next {
        changed.insert("CanGoNext", Value::from(next.can_next));
    }
    if previous.can_previous != next.can_previous {
        changed.insert("CanGoPrevious", Value::from(next.can_previous));
    }
    if previous.length.is_some() != next.length.is_some() {
        changed.insert("CanSeek", Value::from(next.length.is_some()));
    }
    changed
}
