use std::sync::Mutex;
use std::time::{Duration, Instant};

use anyhow::Result;

struct Kept<T> {
    model: T,
    used: Instant,
}

/// A loaded model, kept for a while after it was last used so the next
/// request starts at once, then dropped to give its memory back.
pub struct Warm<T> {
    kept: Mutex<Option<Kept<T>>>,
}

impl<T> Default for Warm<T> {
    fn default() -> Self {
        Self {
            kept: Mutex::new(None),
        }
    }
}

impl<T> Warm<T> {
    /// Runs `work` with the model, one caller at a time, loading it first
    /// when it isn't kept.
    pub fn with<R>(
        &self,
        load: impl FnOnce() -> Result<T>,
        work: impl FnOnce(&mut T) -> Result<R>,
    ) -> Result<R> {
        let mut kept = self.kept.lock().expect("model lock");
        let model = match kept.take() {
            Some(kept) => kept.model,
            None => load()?,
        };
        let kept = kept.insert(Kept {
            model,
            used: Instant::now(),
        });
        let done = work(&mut kept.model);
        kept.used = Instant::now();
        done
    }

    /// Drops the model once it has gone unused for `after`, and says whether
    /// it did.
    pub fn expire(&self, after: Duration) -> bool {
        let Ok(mut kept) = self.kept.try_lock() else {
            return false;
        };
        let expired = kept
            .as_ref()
            .is_some_and(|kept| kept.used.elapsed() >= after);
        if expired {
            *kept = None;
        }
        expired
    }

    pub fn loaded(&self) -> bool {
        self.kept.try_lock().map_or(true, |kept| kept.is_some())
    }
}
