use std::path::Path;
use std::sync::{Condvar, Mutex};
use std::time::{Duration, Instant};

use anyhow::Result;
use luft_speech::types::Engine;

use crate::engines::Recognizer;

/// The loaded model, kept a few minutes after dictating so the next time
/// starts at once, then unloaded to give its memory back.
#[derive(Default)]
pub struct Warm {
    slot: Mutex<Slot>,
    returned: Condvar,
}

#[derive(Default)]
struct Slot {
    loaded: Option<Loaded>,
    lent: bool,
}

pub struct Loaded {
    engine: Engine,
    pub recognizer: Recognizer,
    used: Instant,
}

impl Warm {
    pub fn take(&self, engine: Engine, folder: &Path, files: &[String]) -> Result<Loaded> {
        let mut slot = self.slot.lock().expect("model lock");
        while slot.lent {
            slot = self.returned.wait(slot).expect("model lock");
        }
        slot.lent = true;
        let kept = slot.loaded.take().filter(|loaded| loaded.engine == engine);
        drop(slot);
        let loaded = match kept {
            Some(loaded) => Ok(loaded),
            None => {
                let loaded = Recognizer::load(engine, folder, files).map(|recognizer| Loaded {
                    engine,
                    recognizer,
                    used: Instant::now(),
                });
                release_memory();
                loaded
            }
        };
        if loaded.is_err() {
            self.give_back(None);
        }
        loaded
    }

    pub fn give_back(&self, loaded: Option<Loaded>) {
        let mut slot = self.slot.lock().expect("model lock");
        slot.loaded = loaded.map(|loaded| Loaded {
            used: Instant::now(),
            ..loaded
        });
        slot.lent = false;
        self.returned.notify_all();
        drop(slot);
        release_memory();
    }

    pub fn expire(&self, after: Duration) {
        let mut slot = self.slot.lock().expect("model lock");
        if slot
            .loaded
            .as_ref()
            .is_some_and(|loaded| loaded.used.elapsed() >= after)
        {
            slot.loaded = None;
            drop(slot);
            release_memory();
        }
    }

    pub fn busy(&self) -> bool {
        let slot = self.slot.lock().expect("model lock");
        slot.lent || slot.loaded.is_some()
    }
}

fn release_memory() {
    unsafe { libc::malloc_trim(0) };
}
