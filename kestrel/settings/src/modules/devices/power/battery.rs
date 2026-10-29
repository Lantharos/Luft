use std::time::Duration;

use tokio::time::Instant;

const LOW_PERCENTAGE: f64 = 15.0;
const CRITICAL_PERCENTAGE: f64 = 7.0;
const EMPTY_PERCENTAGE: f64 = 4.0;
const LOW_SECONDS: i64 = 25 * 60;
const CRITICAL_SECONDS: i64 = 10 * 60;
const SHORTEST_ESTIMATE: i64 = 60;
const LONGEST_ESTIMATE: i64 = 24 * 60 * 60;
const ESTIMATE_SETTLES_AFTER: Duration = Duration::from_secs(60);

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub enum Charge {
    Fine,
    Low,
    Critical,
    Empty,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Ending {
    Hibernate,
    Suspend,
    PowerOff,
}

#[derive(Clone, Copy, Default)]
pub struct Reading {
    pub percentage: f64,
    pub time_to_empty: i64,
}

pub struct Discharge {
    started: Instant,
    pub ups: bool,
    pub warned: Charge,
    pub warning: u32,
    pub saver_reached: bool,
    pub saver_declined: bool,
    pub saver_notice: u32,
    pub saver_told: bool,
    pub ending: Option<Ending>,
    pub ran_out: bool,
}

impl Discharge {
    pub fn new(ups: bool) -> Self {
        Self {
            started: Instant::now(),
            ups,
            warned: Charge::Fine,
            warning: 0,
            saver_reached: false,
            saver_declined: false,
            saver_notice: 0,
            saver_told: false,
            ending: None,
            ran_out: false,
        }
    }

    pub fn seconds_left(&self, reading: Reading) -> Option<i64> {
        let settled = self.started.elapsed() >= ESTIMATE_SETTLES_AFTER;
        let plausible = (SHORTEST_ESTIMATE..=LONGEST_ESTIMATE).contains(&reading.time_to_empty);
        (settled && plausible).then_some(reading.time_to_empty)
    }

    pub fn charge(&self, reading: Reading) -> Charge {
        let seconds_left = self.seconds_left(reading).unwrap_or(i64::MAX);
        if reading.percentage <= EMPTY_PERCENTAGE {
            Charge::Empty
        } else if reading.percentage <= CRITICAL_PERCENTAGE || seconds_left <= CRITICAL_SECONDS {
            Charge::Critical
        } else if reading.percentage <= LOW_PERCENTAGE || seconds_left <= LOW_SECONDS {
            Charge::Low
        } else {
            Charge::Fine
        }
    }

    pub fn ending(&self, can_hibernate: bool) -> Ending {
        match (can_hibernate, self.ups) {
            (true, _) => Ending::Hibernate,
            (false, false) => Ending::Suspend,
            (false, true) => Ending::PowerOff,
        }
    }

    pub fn fallback(&self) -> Ending {
        self.ending(false)
    }
}
