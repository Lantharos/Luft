use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::time::{Duration, Instant};

use super::identity::{self, Identity};
use super::listeners::Listener;

const SETTLE: Duration = Duration::from_secs(2);

struct Asking {
    uid: u32,
    unit: String,
}

#[derive(Default)]
pub struct Questions {
    asking: BTreeMap<Identity, Asking>,
    settling: HashMap<u64, Instant>,
}

impl Questions {
    pub fn ask(&mut self, listener: &Listener) {
        self.asking
            .entry(listener.identity.clone())
            .or_insert_with(|| Asking {
                uid: listener.uid,
                unit: listener.unit.clone(),
            });
    }

    pub fn listening(&mut self, cookie: u64) {
        self.settling.insert(cookie, Instant::now() + SETTLE);
    }

    pub fn stopped(&mut self, cookie: u64) {
        self.settling.remove(&cookie);
    }

    pub fn deadline(&self) -> Option<Instant> {
        self.settling.values().min().copied()
    }

    pub fn settled(&mut self, now: Instant) -> Vec<u64> {
        let settled: Vec<u64> = self
            .settling
            .iter()
            .filter(|(_, deadline)| **deadline <= now)
            .map(|(cookie, _)| *cookie)
            .collect();
        for cookie in &settled {
            self.settling.remove(cookie);
        }
        settled
    }

    pub fn answered(&mut self, identity: &Identity) {
        self.asking.remove(identity);
    }

    pub fn retain_alive(&mut self) {
        self.asking
            .retain(|_, asking| identity::alive(&asking.unit));
    }

    pub fn waiting(&self) -> BTreeSet<(Identity, u32)> {
        self.asking
            .iter()
            .map(|(identity, asking)| (identity.clone(), asking.uid))
            .collect()
    }
}
