use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use anyhow::Result;
use tokio::sync::mpsc::UnboundedSender;

use crate::dictation::Session;
use crate::engines::Processor;
use crate::models::manifest::{self, Entry};
use crate::models::{Downloads, Store};
use crate::plan::Plan;
use crate::preferences;
use crate::warm::Warm;

pub const NAME: &str = "com.lantharos.Speech1";
pub const PATH: &str = "/com/lantharos/Speech1";

pub enum Event {
    Partial(String),
    Level(f64),
    Quiet,
    Changed,
}

pub struct Hub {
    pub processor: Processor,
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
            processor: Processor::detect(),
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

    /// Starts downloading a model, or picks up where its download stopped.
    pub fn install(self: &Arc<Self>, entry: &'static Entry) -> Result<bool> {
        self.store.remove_unlisted()?;
        let hub = self.clone();
        Ok(self.downloads.start(
            entry,
            self.store.folder(entry),
            self.store.usage(entry),
            move || hub.changed(),
        ))
    }

    /// While dictation is on, downloads the model the chosen language needs
    /// and stops downloading any other. Downloaded models stay until removed.
    pub fn follow(self: &Arc<Self>) {
        if !preferences::read().enabled {
            return;
        }
        let plan = Plan::now(None, self.processor);
        let mut moved = false;
        for entry in manifest::models() {
            if entry.id != plan.model.id {
                moved |= self.downloads.cancel(&entry.id);
            }
        }
        if self.processor.runs(plan.engine) && !self.store.installed(plan.model) {
            match self.install(plan.model) {
                Ok(started) => moved |= started,
                Err(error) => eprintln!("Couldn't download {}: {error:#}", plan.model.id),
            }
        }
        if moved {
            self.changed();
        }
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
