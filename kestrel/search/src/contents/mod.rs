mod extract;
mod snippet;
mod store;

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use crate::index::stat::{Stat, stat};
use crate::index::tree::{Changes, Tree};
use extract::{Format, extract, fits, format};
pub use snippet::snippet;
use store::{Known, Written};
pub use store::{Store, words};

const BATCH: usize = 32;
const SLICE: Duration = Duration::from_secs(1);

pub struct Contents {
    store: Store,
    pending: BTreeMap<String, Format>,
    gone: Vec<PathBuf>,
    stale: bool,
}

impl Contents {
    pub fn new(store: Store) -> Self {
        Self {
            store,
            pending: BTreeMap::new(),
            gone: Vec::new(),
            stale: true,
        }
    }

    pub fn note(&mut self, tree: &Tree, changes: Changes) {
        self.stale |= changes.everything;
        if self.stale {
            return;
        }
        self.gone.extend(changes.gone);
        let pending = changes
            .files
            .into_iter()
            .filter(|&id| tree.is_file(id))
            .filter_map(|id| {
                let format = format(&tree.nodes[id as usize].name)?;
                let path = tree.path(id).into_os_string().into_string().ok()?;
                Some((path, format))
            });
        self.pending.extend(pending);
    }

    pub fn index(&mut self, tree: &Tree, paused: impl Fn() -> bool) -> rusqlite::Result<bool> {
        let indexed = self.slice(tree, paused);
        if indexed.is_err() {
            self.stale = true;
        }
        indexed
    }

    fn slice(&mut self, tree: &Tree, paused: impl Fn() -> bool) -> rusqlite::Result<bool> {
        if self.stale {
            self.reconcile(tree)?;
            self.stale = false;
        }
        if !self.gone.is_empty() {
            let transaction = self.store.transaction()?;
            for path in self.gone.drain(..) {
                store::forget(&transaction, &path)?;
            }
            transaction.commit()?;
        }
        let started = Instant::now();
        while !self.pending.is_empty() {
            if paused() || started.elapsed() > SLICE {
                return Ok(true);
            }
            let transaction = self.store.transaction()?;
            let mut written = Vec::with_capacity(BATCH);
            for (path, format) in (0..BATCH).map_while(|_| self.pending.pop_last()) {
                written.extend(renew(&transaction, &path, format)?);
            }
            store::write(&transaction, &written)?;
            transaction.commit()?;
        }
        Ok(false)
    }

    fn reconcile(&mut self, tree: &Tree) -> rusqlite::Result<()> {
        self.pending.clear();
        self.gone.clear();
        let mut known = self.store.known()?;
        tree.files(|id, path| {
            let Some(format) = format(&tree.nodes[id as usize].name) else {
                return;
            };
            let Some(info) = stat(path).filter(|info| fits(format, info.size)) else {
                return;
            };
            let Some(path) = path.to_str() else { return };
            if unchanged(known.remove(path).as_ref(), &info) {
                return;
            }
            self.pending.insert(path.to_owned(), format);
        });
        let transaction = self.store.transaction()?;
        for path in known.keys() {
            store::remove(&transaction, path)?;
        }
        transaction.commit()
    }
}

fn renew(
    transaction: &rusqlite::Transaction,
    path: &str,
    format: Format,
) -> rusqlite::Result<Option<Written>> {
    let Some(info) = stat(Path::new(path)).filter(|info| fits(format, info.size)) else {
        store::remove(transaction, path)?;
        return Ok(None);
    };
    let known = store::stored(transaction, path)?;
    if unchanged(known.as_ref(), &info) {
        return Ok(None);
    }
    Ok(Some(Written {
        id: store::put(transaction, path, info.modified, info.size as i64)?,
        replaced: known.is_some(),
        text: extract(Path::new(path), format),
    }))
}

fn unchanged(known: Option<&Known>, info: &Stat) -> bool {
    known.is_some_and(|known| known.modified == info.modified && known.size == info.size as i64)
}
