use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::Duration;

use tokio::sync::Notify;
use tokio::time::timeout;

#[derive(Default)]
pub struct Idle {
    active: AtomicUsize,
    changed: Notify,
}

pub struct Activity<'a>(&'a Idle);

impl Idle {
    pub fn hold(&self) -> Activity<'_> {
        self.active.fetch_add(1, Ordering::SeqCst);
        self.changed.notify_one();
        Activity(self)
    }

    pub async fn wait(&self, limit: Duration) {
        loop {
            let expired = timeout(limit, self.changed.notified()).await.is_err();
            if expired && self.active.load(Ordering::SeqCst) == 0 {
                return;
            }
        }
    }
}

impl Drop for Activity<'_> {
    fn drop(&mut self) {
        self.0.active.fetch_sub(1, Ordering::SeqCst);
        self.0.changed.notify_one();
    }
}
