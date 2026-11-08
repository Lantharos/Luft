use std::sync::{Arc, LazyLock, Mutex};
use std::time::{Duration, Instant};

use anyhow::Result;
use luft_models::{Catalog, Downloads, Entry, Store};
use serde::Deserialize;
use tokio::sync::mpsc::UnboundedSender;

use crate::model::Writer;

pub const NAME: &str = "com.lantharos.Language1";
pub const PATH: &str = "/com/lantharos/Language1";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Engine {
    Text,
}

static CATALOG: LazyLock<Catalog<Engine>> =
    LazyLock::new(|| Catalog::parse(include_str!("../data/models.json"), "LUFT_LANGUAGE_MIRROR"));

pub fn model() -> &'static Entry<Engine> {
    &CATALOG.models()[0]
}

pub struct NotInstalled;

struct Loaded {
    writer: Writer,
    used: Instant,
}

pub struct Hub {
    pub store: Store,
    pub downloads: Downloads,
    loaded: Mutex<Option<Loaded>>,
    changes: UnboundedSender<()>,
    idle_since: Mutex<Option<Instant>>,
}

impl Hub {
    pub fn new(store: Store, changes: UnboundedSender<()>) -> Self {
        Self {
            store,
            downloads: Downloads::default(),
            loaded: Mutex::new(None),
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

    /// Runs `write` with the model, loading it first if it isn't yet.
    pub fn with_writer<T>(
        &self,
        write: impl FnOnce(&Writer) -> Result<T>,
    ) -> Result<Result<T, NotInstalled>> {
        if !self.store.installed(model()) {
            return Ok(Err(NotInstalled));
        }
        let mut slot = self.loaded.lock().expect("model lock");
        if slot.is_none() {
            *slot = Some(Loaded {
                writer: Writer::load(&self.store.folder(model()))?,
                used: Instant::now(),
            });
        }
        let loaded = slot.as_mut().expect("the model was just loaded");
        let written = write(&loaded.writer);
        loaded.used = Instant::now();
        Ok(Ok(written?))
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
