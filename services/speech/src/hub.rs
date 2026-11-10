use std::sync::Mutex;
use std::time::Duration;

use anyhow::Result;
use luft_models::Library;
use luft_speech::types::Engine;
use tokio::sync::mpsc::UnboundedSender;
use tokio::sync::oneshot;
use zbus::names::UniqueName;

use crate::dictation::Session;
use crate::engines::Processor;
use crate::models::manifest::{self, CATALOG};
use crate::plan::Plan;
use crate::preferences;
use crate::warm::Warm;

pub const NAME: &str = "com.lantharos.Speech1";
pub const PATH: &str = "/com/lantharos/Speech1";
const WARM_FOR: Duration = Duration::from_secs(180);

pub enum Event {
    Partial(String),
    Typed(String),
    Sent(oneshot::Sender<()>),
    Level(f64),
    Quiet,
    Changed,
}

pub struct Hub {
    pub processor: Processor,
    pub models: Library<Engine>,
    pub warm: Warm,
    pub session: tokio::sync::Mutex<Option<Session>>,
    pub listener: Mutex<Option<UniqueName<'static>>>,
    pub events: UnboundedSender<Event>,
}

impl Hub {
    pub fn new(events: UnboundedSender<Event>) -> Result<Self> {
        let changes = events.clone();
        Ok(Self {
            processor: Processor::detect(),
            models: Library::open("luft-speech", &CATALOG, move || {
                let _ = changes.send(Event::Changed);
            })?,
            warm: Warm::default(),
            session: tokio::sync::Mutex::new(None),
            listener: Mutex::new(None),
            events,
        })
    }

    pub fn follow_settings(&self) {
        if !preferences::read().enabled {
            return;
        }
        let plan = Plan::now(None, self.processor);
        for entry in manifest::models() {
            if entry.id != plan.model.id {
                self.models.cancel_install(&entry.id);
            }
        }
        if self.processor.runs(plan.engine)
            && !self.models.store.installed(plan.model)
            && let Err(error) = self.models.install(plan.model)
        {
            eprintln!("Couldn't download {}: {error:#}", plan.model.id);
        }
    }

    pub fn busy(&self) -> bool {
        self.warm.expire(WARM_FOR);
        self.warm.busy()
            || self.models.downloads.active()
            || self
                .session
                .try_lock()
                .map_or(true, |session| session.is_some())
    }
}
