use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Mutex, MutexGuard};

use luft_software::task::Cancel;

use crate::install::Exit;

static RUNNING: Mutex<Vec<(u64, Cancel)>> = Mutex::new(Vec::new());
static STOPPED: AtomicBool = AtomicBool::new(false);
static NEXT: AtomicU64 = AtomicU64::new(0);

fn running() -> MutexGuard<'static, Vec<(u64, Cancel)>> {
    RUNNING
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

/// Stops what's running at the first Ctrl+C, and what hasn't started yet
/// from starting; quits at once when nothing runs.
pub fn watch() {
    luft_dbus::runtime::spawn(async {
        while tokio::signal::ctrl_c().await.is_ok() {
            STOPPED.store(true, Ordering::SeqCst);
            let stopping = std::mem::take(&mut *running());
            if stopping.is_empty() {
                eprintln!();
                std::process::exit(Exit::Interrupted as i32);
            }
            for (_, cancel) in stopping {
                cancel.cancel();
            }
        }
    });
}

pub fn stopped() -> bool {
    STOPPED.load(Ordering::SeqCst)
}

pub struct Interruptible(u64);

pub fn cancels(cancel: Cancel) -> Interruptible {
    let id = NEXT.fetch_add(1, Ordering::Relaxed);
    running().push((id, cancel));
    Interruptible(id)
}

impl Drop for Interruptible {
    fn drop(&mut self) {
        running().retain(|(id, _)| *id != self.0);
    }
}
