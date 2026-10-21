use std::time::{Duration, Instant};

pub struct Settle {
    first: Instant,
    last: Instant,
}

impl Settle {
    pub fn new(now: Instant) -> Self {
        Self {
            first: now,
            last: now,
        }
    }

    pub fn changed(&mut self, now: Instant) {
        self.last = now;
    }

    pub fn due(&self, quiet: Duration, latest: Duration) -> Instant {
        (self.last + quiet).min(self.first + latest)
    }
}
