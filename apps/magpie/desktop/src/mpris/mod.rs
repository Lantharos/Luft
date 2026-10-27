mod interfaces;
mod playback;

use std::collections::HashMap;
use std::sync::Arc;

use luft_app::Events;
use luft_app::dbus::{self, failed};
use parking_lot::Mutex;
use tokio::sync::Mutex as AsyncMutex;
use zbus::Variant;

pub use interfaces::MediaAction;
use interfaces::{Player, Root, Shared};
pub use playback::Playback;
use playback::Reported;

const BUS_NAME: &str = "org.mpris.MediaPlayer2.magpie";
const PATH: &str = "/org/mpris/MediaPlayer2";
const PLAYER: &str = "org.mpris.MediaPlayer2.Player";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const SEEK_TOLERANCE: f64 = 1.0;

#[derive(Clone)]
pub struct Mpris {
    events: Events,
    state: Shared,
    published: Arc<AsyncMutex<bool>>,
}

impl Mpris {
    pub fn new(events: Events) -> Self {
        Self {
            events,
            state: Arc::new(Mutex::new(Reported::new(Playback::default()))),
            published: Arc::default(),
        }
    }

    pub async fn update(&self, playback: Playback) -> Result<(), String> {
        let connection = dbus::session().await?;
        let mut published = self.published.lock().await;
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
                .await
                .map_err(failed)?;
            server
                .at(
                    PATH,
                    Player {
                        events: self.events.clone(),
                        state: self.state.clone(),
                    },
                )
                .await
                .map_err(failed)?;
            connection.request_name(BUS_NAME).await.map_err(failed)?;
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
                .await
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
                .await
                .map_err(failed)?;
        }
        Ok(())
    }

    pub async fn clear(&self) -> Result<(), String> {
        let mut published = self.published.lock().await;
        if !*published {
            return Ok(());
        }
        let connection = dbus::session().await?;
        connection.release_name(BUS_NAME).await.map_err(failed)?;
        let server = connection.object_server();
        server.remove::<Player, _>(PATH).await.map_err(failed)?;
        server.remove::<Root, _>(PATH).await.map_err(failed)?;
        *published = false;
        Ok(())
    }
}

fn changes(previous: &Playback, next: &Playback) -> HashMap<&'static str, Variant<'static>> {
    let mut changed: HashMap<&'static str, Variant<'static>> = HashMap::new();
    if previous.status != next.status {
        changed.insert("PlaybackStatus", Variant::from(next.status.name()));
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
        changed.insert("Metadata", Variant::from(playback::metadata(next)));
    }
    if previous.rate != next.rate {
        changed.insert("Rate", Variant::from(next.rate));
    }
    if previous.volume != next.volume {
        changed.insert("Volume", Variant::from(next.volume));
    }
    if previous.shuffle != next.shuffle {
        changed.insert("Shuffle", Variant::from(next.shuffle));
    }
    if previous.repeat != next.repeat {
        changed.insert("LoopStatus", Variant::from(next.repeat.name()));
    }
    if previous.can_next != next.can_next {
        changed.insert("CanGoNext", Variant::from(next.can_next));
    }
    if previous.can_previous != next.can_previous {
        changed.insert("CanGoPrevious", Variant::from(next.can_previous));
    }
    if previous.length.is_some() != next.length.is_some() {
        changed.insert("CanSeek", Variant::from(next.length.is_some()));
    }
    changed
}
