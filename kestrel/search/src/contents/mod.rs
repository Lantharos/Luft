mod extract;
mod snippet;
mod store;

use std::path::Path;
use std::time::{Duration, Instant};

use crate::index::stat::stat;
use crate::names::Names;
use extract::{extract, fits, format};
pub use snippet::snippet;
pub use store::{Store, words};

const BATCH: usize = 32;
const SLICE: Duration = Duration::from_secs(1);

struct Pending {
    path: String,
    format: extract::Format,
    modified: i64,
    size: i64,
}

fn changed_files(names: &Names, store: &Store) -> rusqlite::Result<(Vec<Pending>, Vec<String>)> {
    let mut known = store.known()?;
    let mut pending = Vec::new();
    for index in 0..names.len() {
        if names.is_folder(index) {
            continue;
        }
        let Some(format) = format(names.name(index)) else {
            continue;
        };
        let Ok(path) = names.path(index).into_os_string().into_string() else {
            continue;
        };
        let Some(info) = stat(Path::new(&path)).filter(|info| fits(format, info.size)) else {
            continue;
        };
        if known
            .remove(&path)
            .is_some_and(|known| known.modified == info.modified && known.size == info.size as i64)
        {
            continue;
        }
        pending.push(Pending {
            path,
            format,
            modified: info.modified,
            size: info.size as i64,
        });
    }
    Ok((pending, known.into_keys().collect()))
}

pub fn update(
    store: &mut Store,
    names: &Names,
    paused: impl Fn() -> bool,
) -> rusqlite::Result<bool> {
    let started = Instant::now();
    let (pending, gone) = changed_files(names, store)?;
    let transaction = store.transaction()?;
    for path in &gone {
        store::remove(&transaction, path)?;
    }
    transaction.commit()?;
    for batch in pending.chunks(BATCH) {
        if paused() || started.elapsed() > SLICE {
            return Ok(true);
        }
        let transaction = store.transaction()?;
        for file in batch {
            let text = extract(Path::new(&file.path), file.format);
            store::put(&transaction, &file.path, file.modified, file.size, &text)?;
        }
        transaction.commit()?;
    }
    Ok(false)
}
