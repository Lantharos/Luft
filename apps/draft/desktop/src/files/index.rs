use std::path::Path;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use ignore::{WalkBuilder, WalkState};
use parking_lot::Mutex;
use serde::Serialize;

use super::Target;

const LIMIT: usize = 200_000;

#[derive(Serialize)]
pub struct Index {
    files: Vec<String>,
    truncated: bool,
}

pub fn files(Target { path }: Target) -> Result<Index, String> {
    let root = Path::new(&path);
    let files = Arc::new(Mutex::new(Vec::new()));
    let count = Arc::new(AtomicUsize::new(0));
    WalkBuilder::new(root)
        .hidden(false)
        .filter_entry(|entry| entry.file_name() != ".git")
        .build_parallel()
        .run(|| {
            let files = files.clone();
            let count = count.clone();
            Box::new(move |entry| {
                let Ok(entry) = entry else {
                    return WalkState::Continue;
                };
                if !entry.file_type().is_some_and(|kind| kind.is_file()) {
                    return WalkState::Continue;
                }
                if count.fetch_add(1, Ordering::Relaxed) >= LIMIT {
                    return WalkState::Quit;
                }
                if let Ok(relative) = entry.path().strip_prefix(root) {
                    files.lock().push(relative.to_string_lossy().into_owned());
                }
                WalkState::Continue
            })
        });
    let files = std::mem::take(&mut *files.lock());
    Ok(Index {
        truncated: count.load(Ordering::Relaxed) > LIMIT,
        files,
    })
}
