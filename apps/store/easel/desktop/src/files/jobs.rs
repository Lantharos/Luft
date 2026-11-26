use std::collections::HashMap;
use std::sync::Arc;
use std::sync::atomic::{AtomicU32, Ordering};

use luft_i18n::t;
use parking_lot::Mutex;

use crate::l10n::L10N;

pub struct Jobs<T> {
    next: Arc<AtomicU32>,
    running: Arc<Mutex<HashMap<u32, Arc<Mutex<T>>>>>,
}

impl<T> Clone for Jobs<T> {
    fn clone(&self) -> Self {
        Self {
            next: self.next.clone(),
            running: self.running.clone(),
        }
    }
}

impl<T> Default for Jobs<T> {
    fn default() -> Self {
        Self {
            next: Arc::new(AtomicU32::new(1)),
            running: Arc::default(),
        }
    }
}

impl<T> Jobs<T> {
    pub fn start(&self, job: T) -> u32 {
        let id = self.next.fetch_add(1, Ordering::Relaxed);
        self.running.lock().insert(id, Arc::new(Mutex::new(job)));
        id
    }

    pub fn get(&self, id: u32) -> Result<Arc<Mutex<T>>, String> {
        self.running
            .lock()
            .get(&id)
            .cloned()
            .ok_or_else(|| t!(L10N, "easel-error-job-gone"))
    }

    pub fn finish(&self, id: u32) -> Result<T, String> {
        let job = self
            .running
            .lock()
            .remove(&id)
            .ok_or_else(|| t!(L10N, "easel-error-job-gone"))?;
        Arc::try_unwrap(job)
            .map(Mutex::into_inner)
            .map_err(|_| t!(L10N, "easel-error-job-busy"))
    }
}
