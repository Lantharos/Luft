use std::sync::Mutex;

use luft_software::task::Cancel;

use crate::cli::Exit;

static RUNNING: Mutex<Option<Cancel>> = Mutex::new(None);

fn running() -> std::sync::MutexGuard<'static, Option<Cancel>> {
    RUNNING
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

pub fn watch() {
    luft_app::spawn(async {
        while tokio::signal::ctrl_c().await.is_ok() {
            let Some(cancel) = running().take() else {
                eprintln!();
                std::process::exit(Exit::Interrupted as i32);
            };
            cancel.cancel();
        }
    });
}

pub struct Interruptible;

pub fn cancels(cancel: Cancel) -> Interruptible {
    *running() = Some(cancel);
    Interruptible
}

impl Drop for Interruptible {
    fn drop(&mut self) {
        running().take();
    }
}
