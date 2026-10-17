mod rules;
pub mod stat;
pub mod tree;

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{Receiver, RecvTimeoutError};
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};

use crate::contents::{self, Store};
use crate::names::Names;
use tree::Tree;

const ON_POWER: Duration = Duration::from_secs(5 * 60);
const ON_BATTERY: Duration = Duration::from_secs(15 * 60);
const SHORTEST_GAP: Duration = Duration::from_secs(5);
const BETWEEN_SLICES: Duration = Duration::from_secs(1);

pub enum Wake {
    Searching,
    Power,
}

pub type Shared = Arc<RwLock<Arc<Names>>>;

pub struct Indexer {
    pub tree: Tree,
    pub store: Store,
    pub names: Shared,
    pub on_battery: Arc<AtomicBool>,
    pub wake: Receiver<Wake>,
}

impl Indexer {
    fn on_battery(&self) -> bool {
        self.on_battery.load(Ordering::Relaxed)
    }

    fn pass(&mut self, first: bool) -> bool {
        if self.tree.refresh() || first {
            *self.names.write().unwrap() = Arc::new(Names::build(&self.tree));
        }
        if self.on_battery() {
            return false;
        }
        let names = self.names.read().unwrap().clone();
        let on_battery = &self.on_battery;
        contents::update(&mut self.store, &names, || {
            on_battery.load(Ordering::Relaxed)
        })
        .unwrap_or_else(|error| {
            eprintln!("Couldn't index file contents: {error}");
            false
        })
    }

    fn wait(&self, since: Instant, unfinished: bool) -> bool {
        let interval = if unfinished {
            BETWEEN_SLICES
        } else if self.on_battery() {
            ON_BATTERY
        } else {
            ON_POWER
        };
        let deadline = since + interval;
        loop {
            match self
                .wake
                .recv_timeout(deadline.saturating_duration_since(Instant::now()))
            {
                Ok(Wake::Searching) if since.elapsed() < SHORTEST_GAP => continue,
                Ok(_) | Err(RecvTimeoutError::Timeout) => return true,
                Err(RecvTimeoutError::Disconnected) => return false,
            }
        }
    }

    pub fn run(mut self) {
        let mut first = true;
        loop {
            let unfinished = self.pass(first);
            first = false;
            if !self.wait(Instant::now(), unfinished) {
                return;
            }
        }
    }
}
