use std::sync::{Arc, Condvar, LazyLock, Mutex};
use std::time::{Duration, Instant};

use anyhow::Result;
use luft_handwriting::types::Stroke;
use luft_models::{Catalog, Downloads, Entry, Store};
use serde::Deserialize;
use tokio::sync::mpsc::UnboundedSender;

use crate::ink;
use crate::recognizer::Recognizer;

pub const NAME: &str = "com.lantharos.Handwriting1";
pub const PATH: &str = "/com/lantharos/Handwriting1";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Engine {
    Vision,
}

static CATALOG: LazyLock<Catalog<Engine>> =
    LazyLock::new(|| Catalog::parse(include_str!("../data/models.json")));

pub fn model() -> &'static Entry<Engine> {
    &CATALOG.models()[0]
}

pub struct NotInstalled;

/// Whether someone is waiting for the line, or it's read in the background.
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Urgency {
    Waiting,
    Background,
}

struct Loaded {
    recognizer: Recognizer,
    used: Instant,
}

pub struct Hub {
    pub store: Store,
    pub downloads: Downloads,
    loaded: Mutex<Option<Loaded>>,
    waiting: Mutex<usize>,
    nobody_waiting: Condvar,
    changes: UnboundedSender<()>,
    idle_since: Mutex<Option<Instant>>,
}

impl Hub {
    pub fn new(store: Store, changes: UnboundedSender<()>) -> Self {
        Self {
            store,
            downloads: Downloads::default(),
            loaded: Mutex::new(None),
            waiting: Mutex::new(0),
            nobody_waiting: Condvar::new(),
            changes,
            idle_since: Mutex::new(None),
        }
    }

    pub fn changed(&self) {
        let _ = self.changes.send(());
    }

    pub fn install(self: &Arc<Self>) -> Result<bool> {
        self.store.remove_unlisted(CATALOG.models())?;
        let hub = self.clone();
        Ok(self.downloads.start(
            model(),
            CATALOG.mirror(),
            self.store.folder(model()),
            self.store.usage(model()),
            move || hub.changed(),
        ))
    }

    /// Reads a line; a line someone waits for goes ahead of every background
    /// line that hasn't started yet.
    pub fn recognize(
        &self,
        strokes: &[Stroke],
        urgency: Urgency,
    ) -> Result<Result<String, NotInstalled>> {
        let Some(line) = ink::draw(strokes) else {
            return Ok(Ok(String::new()));
        };
        if !self.store.installed(model()) {
            return Ok(Err(NotInstalled));
        }
        let mut slot = match urgency {
            Urgency::Waiting => {
                *self.waiting.lock().expect("waiting lock") += 1;
                let slot = self.loaded.lock().expect("recognizer lock");
                let mut waiting = self.waiting.lock().expect("waiting lock");
                *waiting -= 1;
                if *waiting == 0 {
                    self.nobody_waiting.notify_all();
                }
                slot
            }
            Urgency::Background => {
                drop(
                    self.nobody_waiting
                        .wait_while(self.waiting.lock().expect("waiting lock"), |waiting| {
                            *waiting > 0
                        })
                        .expect("waiting lock"),
                );
                self.loaded.lock().expect("recognizer lock")
            }
        };
        if slot.is_none() {
            *slot = Some(Loaded {
                recognizer: Recognizer::load(&self.store.folder(model()))?,
                used: Instant::now(),
            });
        }
        let loaded = slot.as_mut().expect("the recognizer was just loaded");
        loaded.used = Instant::now();
        Ok(Ok(loaded.recognizer.read(&line)?))
    }

    pub fn expire(&self, after: Duration) {
        let Ok(mut loaded) = self.loaded.try_lock() else {
            return;
        };
        if loaded
            .as_ref()
            .is_some_and(|loaded| loaded.used.elapsed() >= after)
        {
            *loaded = None;
        }
    }

    /// How long nothing has been going on: no model loaded and no download.
    pub fn idle_for(&self) -> Duration {
        let busy = self.downloads.active()
            || self
                .loaded
                .try_lock()
                .map_or(true, |loaded| loaded.is_some());
        let mut idle_since = self.idle_since.lock().expect("idle lock");
        if busy {
            *idle_since = None;
            return Duration::ZERO;
        }
        idle_since.get_or_insert_with(Instant::now).elapsed()
    }
}
