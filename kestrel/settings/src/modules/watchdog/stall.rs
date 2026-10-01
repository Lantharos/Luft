use std::time::Duration;

use tokio::time::Instant;

const RESUME_GRACE: Duration = Duration::from_secs(30);

#[derive(Default)]
pub struct Stall {
    since: Option<Instant>,
    sleeping: bool,
    resumed_at: Option<Instant>,
}

impl Stall {
    pub fn sleeping(&mut self, sleeping: bool) {
        self.sleeping = sleeping;
        self.since = None;
        if !sleeping {
            self.resumed_at = Some(Instant::now());
        }
    }

    pub fn watching(&self) -> bool {
        !self.sleeping
            && self
                .resumed_at
                .is_none_or(|resumed| resumed.elapsed() >= RESUME_GRACE)
    }

    pub fn clear(&mut self) {
        self.since = None;
    }

    pub fn stalled_since(&mut self, at: Instant) -> Duration {
        let since = *self.since.get_or_insert(at);
        self.since = Some(since.min(at));
        since.min(at).elapsed()
    }
}
