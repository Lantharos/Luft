use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

use tokio::sync::watch;
use tokio::time::{MissedTickBehavior, interval};

use crate::events::{Direction, Event, Link, Stage};

const EVERY: Duration = Duration::from_millis(250);
const STALLED_AFTER: Duration = Duration::from_secs(90);

pub struct Transfer {
    pub id: String,
    pub direction: Direction,
    pub device: String,
    pub size: u64,
    pub files: usize,
    pub done: Arc<AtomicU64>,
}

impl Transfer {
    pub fn tell(&self, link: &Link, stage: Stage) {
        link.send(Event::Transfer {
            id: self.id.clone(),
            direction: self.direction,
            device: self.device.clone(),
            stage,
            done: self.done.load(Ordering::Relaxed),
            size: self.size,
            files: self.files,
        });
    }

    pub async fn report_until_stopped_or_stalled(&self, link: &Link, mut stop: watch::Receiver<bool>) -> bool {
        let mut ticks = interval(EVERY);
        ticks.set_missed_tick_behavior(MissedTickBehavior::Delay);
        let mut last = (u64::MAX, Instant::now());
        loop {
            tokio::select! {
                _ = stop.wait_for(|stopped| *stopped) => return true,
                _ = ticks.tick() => {}
            }
            let done = self.done.load(Ordering::Relaxed);
            if done != last.0 {
                last = (done, Instant::now());
                self.tell(link, Stage::Moving);
            } else if last.1.elapsed() > STALLED_AFTER {
                return false;
            }
        }
    }
}
