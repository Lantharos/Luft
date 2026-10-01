use std::time::Duration;

use super::threads;
use crate::system::kmsg::{self, KernelLog};

const STALL_LIMIT: Duration = Duration::from_secs(15);
const BLOCKED_LIMIT: Duration = Duration::from_secs(10);
const LOOK_BEFORE_STALL: Duration = Duration::from_secs(60);
const RESUME_GRACE: Duration = Duration::from_secs(30);
const QUOTED_FAILURES: usize = 6;

pub struct Judge {
    log: KernelLog,
    blocked_since: Option<Duration>,
    resumed_at: Option<Duration>,
}

pub struct Hang {
    pub stalled: Duration,
    pub evidence: Vec<String>,
    pub kernel_messages: Vec<String>,
}

impl Judge {
    pub fn new(log: KernelLog) -> Self {
        Self {
            log,
            blocked_since: None,
            resumed_at: None,
        }
    }

    pub fn resumed(&mut self) {
        self.resumed_at = Some(kmsg::now());
        self.blocked_since = None;
    }

    fn recently_resumed(&self, now: Duration) -> bool {
        self.resumed_at
            .is_some_and(|resumed| now.saturating_sub(resumed) < RESUME_GRACE)
    }

    pub fn consider(&mut self, stalled: Duration, compositor: u32) -> Option<Hang> {
        let now = kmsg::now();
        if stalled < STALL_LIMIT || self.recently_resumed(now) || threads::is_debugged(compositor) {
            self.blocked_since = None;
            return None;
        }

        let blocked = threads::blocked_in_gpu_driver(compositor);
        if blocked.is_empty() {
            self.blocked_since = None;
        } else {
            self.blocked_since.get_or_insert(now);
        }
        let blocked_long = self
            .blocked_since
            .is_some_and(|since| now.saturating_sub(since) >= BLOCKED_LIMIT);
        let stall_began = now.saturating_sub(stalled);
        let failures = self
            .log
            .failures_since(stall_began.saturating_sub(LOOK_BEFORE_STALL));
        if failures.is_empty() && !blocked_long {
            return None;
        }

        let evidence = std::iter::once(format!(
            "Kestrel stopped responding for {} seconds",
            stalled.as_secs()
        ))
        .chain(blocked)
        .chain(
            failures
                .iter()
                .take(QUOTED_FAILURES)
                .map(|line| format!("The kernel reported: {}", line.text)),
        )
        .collect();
        Some(Hang {
            stalled,
            evidence,
            kernel_messages: self.log.lines().iter().map(kmsg::Line::format).collect(),
        })
    }
}
