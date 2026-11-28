use std::collections::{HashMap, VecDeque};
use std::time::Duration;

use tokio::time::Instant;

pub const SAMPLE_EVERY: Duration = Duration::from_secs(2);
const WINDOW: Duration = Duration::from_secs(60);
const SHORTEST: Duration = Duration::from_secs(30);
const LEAST_SAMPLES: usize = (SHORTEST.as_secs() / SAMPLE_EVERY.as_secs()) as usize;
const LEAST_GROWTH: u64 = 256 << 20;
const RISING_SHARE: f64 = 0.75;

#[derive(Default)]
pub struct Growth(HashMap<String, VecDeque<(Instant, u64)>>);

impl Growth {
    pub fn record<'a>(&mut self, at: Instant, apps: impl IntoIterator<Item = (&'a str, u64)>) {
        let mut seen = HashMap::with_capacity(self.0.len());
        for (unit, bytes) in apps {
            let mut samples = self.0.remove(unit).unwrap_or_default();
            while samples
                .front()
                .is_some_and(|&(when, _)| at.duration_since(when) > WINDOW)
            {
                samples.pop_front();
            }
            samples.push_back((at, bytes));
            seen.insert(unit.to_owned(), samples);
        }
        self.0 = seen;
    }

    pub fn forget(&mut self) {
        self.0.clear();
    }

    pub fn growing(&self, unit: &str) -> bool {
        let Some(samples) = self.0.get(unit) else {
            return false;
        };
        let (Some(&(first_at, first)), Some(&(last_at, last))) = (samples.front(), samples.back())
        else {
            return false;
        };
        if samples.len() <= LEAST_SAMPLES
            || last_at.duration_since(first_at) < SHORTEST
            || last < first + LEAST_GROWTH
        {
            return false;
        }
        let steps = samples.len() - 1;
        let rising = samples
            .iter()
            .zip(samples.iter().skip(1))
            .filter(|((_, before), (_, after))| after > before)
            .count();
        rising as f64 >= steps as f64 * RISING_SHARE
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const MIB: u64 = 1 << 20;

    fn sampled(values: impl IntoIterator<Item = u64>) -> Growth {
        let mut growth = Growth::default();
        let start = Instant::now();
        for (step, bytes) in values.into_iter().enumerate() {
            growth.record(start + SAMPLE_EVERY * step as u32, [("app.scope", bytes)]);
        }
        growth
    }

    #[test]
    fn a_steady_climb_is_growth() {
        assert!(sampled((0..31).map(|step| 2048 * MIB + step * 20 * MIB)).growing("app.scope"));
    }

    #[test]
    fn a_level_that_loads_and_then_stays_is_not() {
        let load = (0..10).map(|step| 4096 * MIB + step * 400 * MIB);
        let settled = std::iter::repeat_n(8096 * MIB, 21);
        assert!(!sampled(load.chain(settled)).growing("app.scope"));
    }

    #[test]
    fn small_growth_is_not() {
        assert!(!sampled((0..31).map(|step| 2048 * MIB + step * 4 * MIB)).growing("app.scope"));
    }

    #[test]
    fn needs_half_a_minute_to_tell() {
        assert!(!sampled((0..10).map(|step| 2048 * MIB + step * 200 * MIB)).growing("app.scope"));
        assert!(sampled((0..16).map(|step| 2048 * MIB + step * 200 * MIB)).growing("app.scope"));
    }

    #[test]
    fn only_the_last_minute_counts() {
        let early_load = (0..20).map(|step| 1024 * MIB + step * 300 * MIB);
        let settled = std::iter::repeat_n(7000 * MIB, 31);
        assert!(!sampled(early_load.chain(settled)).growing("app.scope"));
    }

    #[test]
    fn forgets_closed_apps() {
        let mut growth = sampled((0..31).map(|step| step * 20 * MIB));
        growth.record(Instant::now() + WINDOW * 2, []);
        assert!(!growth.growing("app.scope"));
    }
}
