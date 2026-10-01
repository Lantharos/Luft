use std::sync::{LazyLock, Mutex, MutexGuard};

use luft_app::Events;
use luft_software::progress::Progress;
use luft_software::task::{Cancel, Task};
use serde::Serialize;

pub const CHANGED: &str = "updates.activity";

#[derive(Serialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Kind {
    Download,
    Firmware,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    pub running: Option<Kind>,
    pub target: Option<String>,
    pub progress: Option<Progress>,
    pub error: Option<String>,
}

struct Slot {
    activity: Activity,
    cancel: Cancel,
}

static SLOT: LazyLock<Mutex<Slot>> = LazyLock::new(|| {
    Mutex::new(Slot {
        activity: Activity::default(),
        cancel: Cancel::default(),
    })
});

fn slot() -> MutexGuard<'static, Slot> {
    SLOT.lock().unwrap_or_else(|poisoned| poisoned.into_inner())
}

pub fn current() -> Activity {
    slot().activity.clone()
}

pub fn cancel() {
    let cancel = slot().cancel.clone();
    cancel.cancel();
}

pub fn start(
    events: &Events,
    kind: Kind,
    target: Option<String>,
    work: impl FnOnce(Task) -> Result<(), String> + Send + 'static,
) -> Result<(), String> {
    let cancel = {
        let mut slot = slot();
        if slot.activity.running.is_some() {
            return Err("Something is already being downloaded.".into());
        }
        slot.cancel = Cancel::default();
        slot.activity = Activity {
            running: Some(kind),
            target,
            ..Activity::default()
        };
        slot.cancel.clone()
    };
    events.emit(CHANGED, current());
    let events = events.clone();
    std::thread::spawn(move || {
        let report = |progress: Progress| {
            slot().activity.progress = Some(progress);
            events.emit(CHANGED, current());
        };
        let result = work(Task {
            report: &report,
            cancel: &cancel,
        });
        {
            let mut slot = slot();
            slot.activity.running = None;
            slot.activity.progress = None;
            if let Err(error) = result
                && !cancel.is_cancelled()
            {
                slot.activity.error = Some(error);
            }
        }
        events.emit(CHANGED, current());
    });
    Ok(())
}
