use std::time::{Duration, Instant};

const INTERVAL: Duration = Duration::from_millis(50);
const FLOOR_DB: f32 = -60.0;

/// Turns the loudness of recent audio into a level from 0 to 1, reported a
/// few times a second.
pub struct Meter {
    report: Box<dyn Fn(f64) + Send>,
    squares: f64,
    samples: usize,
    last: Instant,
}

impl Meter {
    pub fn new(report: impl Fn(f64) + Send + 'static) -> Self {
        Self {
            report: Box::new(report),
            squares: 0.0,
            samples: 0,
            last: Instant::now(),
        }
    }

    pub fn measure(&mut self, samples: &[f32]) {
        self.squares += samples
            .iter()
            .map(|sample| f64::from(*sample).powi(2))
            .sum::<f64>();
        self.samples += samples.len();
        if self.last.elapsed() < INTERVAL || self.samples == 0 {
            return;
        }
        (self.report)(level(self.squares / self.samples as f64));
        self.squares = 0.0;
        self.samples = 0;
        self.last = Instant::now();
    }
}

fn level(mean_square: f64) -> f64 {
    let decibels = 10.0 * mean_square.max(1e-12).log10();
    ((decibels - f64::from(FLOOR_DB)) / -f64::from(FLOOR_DB)).clamp(0.0, 1.0)
}

#[cfg(test)]
mod tests {
    use super::level;

    #[test]
    fn silence_is_zero_and_full_scale_is_one() {
        assert_eq!(level(0.0), 0.0);
        assert_eq!(level(1.0), 1.0);
    }

    #[test]
    fn speech_sits_in_between() {
        let speech = level(0.05f64.powi(2));
        assert!(speech > 0.4 && speech < 0.6, "{speech}");
    }
}
