use std::f32::consts::PI;
use std::sync::LazyLock;

use super::opus;
use crate::audio::RATE;

const STEP: usize = opus::RATE / RATE;
const TAPS: usize = 96;

static FILTER: LazyLock<[f32; TAPS]> = LazyLock::new(|| {
    let cutoff = 7_200.0 / opus::RATE as f32;
    let middle = (TAPS - 1) as f32 / 2.0;
    let mut taps = [0.0; TAPS];
    for (index, tap) in taps.iter_mut().enumerate() {
        let x = index as f32 - middle;
        let sinc = if x == 0.0 {
            2.0 * cutoff
        } else {
            (2.0 * PI * cutoff * x).sin() / (PI * x)
        };
        let phase = 2.0 * PI * index as f32 / (TAPS - 1) as f32;
        *tap = sinc * (0.42 - 0.5 * phase.cos() + 0.08 * (2.0 * phase).cos());
    }
    let sum: f32 = taps.iter().sum();
    taps.map(|tap| tap / sum)
});

pub fn downsample(samples: &[f32]) -> Vec<f32> {
    let filter = &*FILTER;
    (0..samples.len() / STEP)
        .map(|index| {
            let centre = index * STEP;
            filter
                .iter()
                .enumerate()
                .map(|(tap, weight)| {
                    let at = (centre + tap).checked_sub(TAPS / 2);
                    at.and_then(|at| samples.get(at))
                        .map_or(0.0, |sample| sample * weight)
                })
                .sum()
        })
        .collect()
}
