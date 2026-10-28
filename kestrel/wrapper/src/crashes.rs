use std::collections::VecDeque;
use std::time::{Duration, Instant};

const WINDOW: Duration = Duration::from_secs(60);
const LIMIT: usize = 3;

#[derive(Default)]
pub struct Crashes(VecDeque<Instant>);

impl Crashes {
    pub fn too_many_after(&mut self, crash: Instant) -> bool {
        self.0
            .retain(|earlier| crash.duration_since(*earlier) < WINDOW);
        self.0.push_back(crash);
        self.0.len() >= LIMIT
    }
}
