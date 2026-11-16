use std::time::{Duration, Instant};

/// How one showing of a surface went: how long it took to appear, what each
/// frame cost to produce and how evenly frames reached the screen.
pub struct Stats {
    opened: Instant,
    first: Option<Duration>,
    frames: Vec<Duration>,
    presented: Vec<Duration>,
}

impl Stats {
    pub fn new() -> Self {
        Self {
            opened: Instant::now(),
            first: None,
            frames: Vec::new(),
            presented: Vec::new(),
        }
    }

    pub fn frame(&mut self, cost: Duration) {
        self.first.get_or_insert_with(|| self.opened.elapsed());
        self.frames.push(cost);
    }

    pub fn presented(&mut self, at: Duration) {
        self.presented.push(at);
    }

    pub fn report(&self) {
        let milliseconds = |duration: Duration| duration.as_secs_f64() * 1000.0;
        let mut costs: Vec<f64> = self.frames.iter().copied().map(milliseconds).collect();
        costs.sort_by(f64::total_cmp);
        let Some(worst) = costs.last() else { return };
        let mut gaps: Vec<f64> = self
            .presented
            .windows(2)
            .map(|pair| milliseconds(pair[1] - pair[0]))
            .collect();
        gaps.sort_by(f64::total_cmp);
        eprintln!(
            "first frame after {:.1} ms, {} frames, cost median {:.2} ms, worst {:.2} ms, shortest gap between frames on screen {:.2} ms",
            self.first.map_or(0.0, milliseconds),
            costs.len(),
            costs[costs.len() / 2],
            worst,
            gaps.first().copied().unwrap_or(0.0),
        );
    }
}

impl Default for Stats {
    fn default() -> Self {
        Self::new()
    }
}
