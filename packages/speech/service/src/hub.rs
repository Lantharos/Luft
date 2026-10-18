use std::sync::Mutex;
use std::time::{Duration, Instant};

use tokio::sync::mpsc::UnboundedSender;

use crate::dictation::Session;
use crate::models::{Downloads, Store};
use crate::warm::Warm;

pub const NAME: &str = "com.lantharos.Speech1";
pub const PATH: &str = "/com/lantharos/Speech1";

pub enum Event {
    Partial(String),
    Level(f64),
    Changed,
}

pub struct Hub {
    pub store: Store,
    pub downloads: Downloads,
    pub warm: Warm,
    pub session: tokio::sync::Mutex<Option<Session>>,
    pub events: UnboundedSender<Event>,
    idle_since: Mutex<Option<Instant>>,
}

impl Hub {
    pub fn new(store: Store, events: UnboundedSender<Event>) -> Self {
        Self {
            store,
            downloads: Downloads::default(),
            warm: Warm::default(),
            session: tokio::sync::Mutex::new(None),
            events,
            idle_since: Mutex::new(None),
        }
    }

    pub fn changed(&self) {
        let _ = self.events.send(Event::Changed);
    }

    /// How long nothing has been going on: no dictation, no download and no
    /// model loaded.
    pub fn idle_for(&self) -> Duration {
        let busy = self.warm.busy()
            || self.downloads.active()
            || self
                .session
                .try_lock()
                .map_or(true, |session| session.is_some());
        let mut idle_since = self.idle_since.lock().expect("idle lock");
        if busy {
            *idle_since = None;
            return Duration::ZERO;
        }
        idle_since.get_or_insert_with(Instant::now).elapsed()
    }
}
