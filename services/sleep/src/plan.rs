use std::time::Duration;

use crate::battery::Reading;

pub const LOWEST_LEVEL: f64 = 5.0;
const MINUTE: Duration = Duration::from_secs(60);
const HOUR: Duration = Duration::from_secs(60 * 60);
const FIRST_CHECK: Duration = HOUR;
const PLUGGED_IN_CHECK: Duration = Duration::from_secs(2 * 60 * 60);
const SOONEST_CHECK: Duration = Duration::from_secs(10 * 60);
const LATEST_CHECK: Duration = Duration::from_secs(6 * 60 * 60);

#[derive(Debug, PartialEq)]
pub enum Step {
    SleepFor(Duration),
    PowerOff,
}

pub struct Plan {
    limit: Duration,
    on_battery_since: Duration,
    last: Option<(Duration, f64)>,
}

impl Plan {
    pub fn start(limit: Duration, now: Duration, reading: Reading) -> (Self, Duration) {
        let mut plan = Self {
            limit,
            on_battery_since: now,
            last: None,
        };
        let first = match plan.next(now, reading) {
            Step::SleepFor(wait) => wait,
            Step::PowerOff => SOONEST_CHECK,
        };
        (plan, first)
    }

    pub fn woke(&mut self, now: Duration, reading: Reading) -> Step {
        self.next(now, reading)
    }

    fn next(&mut self, now: Duration, reading: Reading) -> Step {
        if !reading.on_battery {
            self.on_battery_since = now;
            self.last = None;
            return Step::SleepFor(PLUGGED_IN_CHECK);
        }
        let asleep = now.saturating_sub(self.on_battery_since);
        if reading.level <= LOWEST_LEVEL || asleep >= self.limit {
            return Step::PowerOff;
        }
        let until_low = self.until_low(now, reading.level);
        self.last = Some((now, reading.level));
        Step::SleepFor(until_low.min(self.limit - asleep).max(MINUTE))
    }

    fn until_low(&self, now: Duration, level: f64) -> Duration {
        let Some((then, before)) = self.last else {
            return FIRST_CHECK;
        };
        let elapsed = now.saturating_sub(then).as_secs_f64();
        if before <= level || elapsed == 0.0 {
            return LATEST_CHECK;
        }
        let per_second = (before - level) / elapsed;
        let left = Duration::from_secs(((level - LOWEST_LEVEL) / per_second).round() as u64);
        (left / 2).clamp(SOONEST_CHECK, LATEST_CHECK)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const DAY: Duration = Duration::from_secs(24 * 60 * 60);

    fn battery(level: f64) -> Reading {
        Reading {
            on_battery: true,
            level,
        }
    }

    fn plugged_in(level: f64) -> Reading {
        Reading {
            on_battery: false,
            level,
        }
    }

    #[test]
    fn checks_sooner_as_the_battery_drains_faster() {
        let (mut plan, first) = Plan::start(DAY, Duration::ZERO, battery(80.0));
        assert_eq!(first, FIRST_CHECK);
        assert_eq!(plan.woke(HOUR, battery(79.0)), Step::SleepFor(LATEST_CHECK));
        assert_eq!(
            plan.woke(HOUR * 7, battery(49.0)),
            Step::SleepFor(HOUR * 22 / 5)
        );
        assert_eq!(
            plan.woke(HOUR * 9, battery(9.0)),
            Step::SleepFor(SOONEST_CHECK)
        );
        assert_eq!(
            plan.woke(HOUR * 9 + SOONEST_CHECK, battery(5.0)),
            Step::PowerOff
        );
    }

    #[test]
    fn powers_off_after_the_chosen_time_on_battery() {
        let (mut plan, _) = Plan::start(DAY, Duration::ZERO, battery(90.0));
        assert_eq!(
            plan.woke(HOUR * 20, battery(88.0)),
            Step::SleepFor(HOUR * 4)
        );
        assert_eq!(plan.woke(DAY, battery(87.0)), Step::PowerOff);
    }

    #[test]
    fn stays_asleep_while_plugged_in() {
        let (mut plan, first) = Plan::start(DAY, Duration::ZERO, plugged_in(3.0));
        assert_eq!(first, PLUGGED_IN_CHECK);
        assert_eq!(
            plan.woke(DAY * 3, plugged_in(100.0)),
            Step::SleepFor(PLUGGED_IN_CHECK)
        );
        assert_eq!(
            plan.woke(DAY * 3 + HOUR, battery(100.0)),
            Step::SleepFor(FIRST_CHECK)
        );
        assert_eq!(
            plan.woke(DAY * 3 + HOUR * 3, battery(97.0)),
            Step::SleepFor(LATEST_CHECK)
        );
    }

    #[test]
    fn checks_soon_when_sleeping_on_an_almost_empty_battery() {
        let (mut plan, first) = Plan::start(DAY, Duration::ZERO, battery(4.0));
        assert_eq!(first, SOONEST_CHECK);
        assert_eq!(plan.woke(SOONEST_CHECK, battery(4.0)), Step::PowerOff);
    }
}
