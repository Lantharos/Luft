use std::fs::File;
use std::io::Read;
use std::sync::Mutex;
use std::sync::atomic::{AtomicUsize, Ordering};

use sha2::{Digest, Sha256};

const CHUNK: usize = 1024 * 1024;

/// The SHA-256 of a file, in lowercase hex, and its size.
pub fn digest(path: &str) -> std::io::Result<(String, u64)> {
    let mut file = File::open(path)?;
    let mut hash = Sha256::new();
    let mut buffer = vec![0u8; CHUNK];
    let mut size = 0u64;
    loop {
        let read = file.read(&mut buffer)?;
        if read == 0 {
            break;
        }
        hash.update(&buffer[..read]);
        size += read as u64;
    }
    let hex = hash
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect();
    Ok((hex, size))
}

/// Runs `work` on every item, `limit` at a time, keeping the order of the
/// results and stopping at the first error.
pub fn map_limit<T: Sync, R: Send, E: Send>(
    items: &[T],
    limit: usize,
    work: impl Fn(&T) -> Result<R, E> + Sync,
) -> Result<Vec<R>, E> {
    let next = AtomicUsize::new(0);
    let results: Mutex<Vec<Option<Result<R, E>>>> =
        Mutex::new((0..items.len()).map(|_| None).collect());
    let failed = std::sync::atomic::AtomicBool::new(false);
    std::thread::scope(|scope| {
        for _ in 0..limit.min(items.len()) {
            scope.spawn(|| {
                loop {
                    let index = next.fetch_add(1, Ordering::Relaxed);
                    if index >= items.len() || failed.load(Ordering::Relaxed) {
                        break;
                    }
                    let result = work(&items[index]);
                    if result.is_err() {
                        failed.store(true, Ordering::Relaxed);
                    }
                    results
                        .lock()
                        .unwrap_or_else(|poisoned| poisoned.into_inner())[index] = Some(result);
                }
            });
        }
    });
    results
        .into_inner()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .into_iter()
        .flatten()
        .collect()
}
