use std::sync::Arc;

use anyhow::Result;

use crate::catalog::{Catalog, Entry};
use crate::download::Downloads;
use crate::store::Store;

/// The models of one service: the ones it lists, the ones downloaded and the
/// downloads under way. `changed` runs whenever any of that changes.
pub struct Library<E: 'static> {
    catalog: &'static Catalog<E>,
    pub store: Store,
    pub downloads: Downloads,
    changed: Arc<dyn Fn() + Send + Sync>,
}

impl<E: Sync> Library<E> {
    pub fn open(
        service: &str,
        catalog: &'static Catalog<E>,
        changed: impl Fn() + Send + Sync + 'static,
    ) -> Result<Self> {
        Ok(Self {
            catalog,
            store: Store::for_service(service)?,
            downloads: Downloads::default(),
            changed: Arc::new(changed),
        })
    }

    pub fn changed(&self) {
        (self.changed)();
    }

    /// Starts downloading a model, or picks up where its download stopped,
    /// and says whether a download started.
    pub fn install(&self, entry: &'static Entry<E>) -> Result<bool> {
        self.store.remove_unlisted(self.catalog.models())?;
        let changed = self.changed.clone();
        let started = self.downloads.start(
            entry,
            self.catalog.mirror(),
            self.store.folder(entry),
            self.store.usage(entry),
            move || changed(),
        );
        if started {
            self.changed();
        }
        Ok(started)
    }

    pub fn cancel_install(&self, id: &str) -> bool {
        let cancelled = self.downloads.cancel(id);
        if cancelled {
            self.changed();
        }
        cancelled
    }

    pub fn remove(&self, entry: &Entry<E>) -> Result<()> {
        self.downloads.cancel(&entry.id);
        self.store.remove(entry)?;
        self.changed();
        Ok(())
    }
}
