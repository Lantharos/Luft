use std::time::Duration;

use futures_util::future::select_all;
use tokio::time::Instant;

use crate::modules::system::memory::own_manager;
use crate::modules::system::memory::pressure::Trigger;

const CALM_EVERY: Duration = Duration::from_secs(30);
const WATCHFUL_EVERY: Duration = Duration::from_secs(3);
const PRESSURE_WINDOW: Duration = Duration::from_secs(2);
const STALLS: [(&str, Duration); 2] = [
    ("cpu", Duration::from_millis(500)),
    ("memory", Duration::from_millis(200)),
];

pub struct Cadence {
    next: Instant,
    watchful: bool,
}

impl Cadence {
    pub fn new() -> Self {
        Self {
            next: Instant::now() + CALM_EVERY,
            watchful: false,
        }
    }

    pub fn next(&self) -> Instant {
        self.next
    }

    pub fn watch_now(&mut self) {
        self.watchful = true;
        self.next = Instant::now();
    }

    pub fn checked(&mut self, settled: bool) {
        self.watchful = !settled;
        let every = if self.watchful {
            WATCHFUL_EVERY
        } else {
            CALM_EVERY
        };
        self.next = Instant::now() + every;
    }
}

pub struct Pressure(Vec<Trigger>);

impl Pressure {
    pub fn on_compositor() -> Self {
        let Ok(manager) = own_manager() else {
            return Self(Vec::new());
        };
        Self(
            STALLS
                .iter()
                .filter_map(|(resource, stalled)| {
                    Trigger::new(
                        &manager.compositor_pressure(resource),
                        *stalled,
                        PRESSURE_WINDOW,
                    )
                    .inspect_err(|error| {
                        eprintln!("Couldn't follow Kestrel's {resource} pressure: {error}")
                    })
                    .ok()
                })
                .collect(),
        )
    }

    pub async fn fired(&mut self) {
        loop {
            if self.0.is_empty() {
                return std::future::pending().await;
            }
            let (index, outcome) = {
                let waits = self.0.iter().enumerate().map(|(index, trigger)| {
                    Box::pin(async move { (index, trigger.fired().await) })
                });
                select_all(waits).await.0
            };
            match outcome {
                Ok(()) => return,
                Err(error) => {
                    eprintln!("Stopped following Kestrel's pressure: {error}");
                    self.0.swap_remove(index);
                }
            }
        }
    }
}
