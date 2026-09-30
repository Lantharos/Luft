use std::path::Path;
use std::time::Instant;

use crate::system::hwmon::{self, Sensor};
use crate::system::procfile::{ProcFile, read_number};

use super::{GpuInfo, GpuSample};

pub struct Intel {
    idle: Option<ProcFile>,
    clock: Option<ProcFile>,
    energy: Option<ProcFile>,
    temperature: Option<Sensor>,
    previous: Option<(Instant, u64, u64)>,
}

impl Intel {
    pub fn open(card: &Path, device: &Path) -> Self {
        let first = |paths: &[&Path]| paths.iter().find_map(|path| ProcFile::open(path).ok());
        let energy = hwmon::device_chip(device)
            .and_then(|chip| ProcFile::open(chip.join("energy1_input")).ok());
        Self {
            idle: first(&[
                &card.join("gt/gt0/rc6_residency_ms"),
                &device.join("tile0/gt0/gtidle/idle_residency_ms"),
            ]),
            clock: first(&[
                &card.join("gt_act_freq_mhz"),
                &device.join("tile0/gt0/freq0/act_freq"),
            ]),
            energy,
            temperature: hwmon::device_sensor(device, &["pkg"]),
            previous: None,
        }
    }

    pub fn describe(card: &Path, device: &Path, info: &mut GpuInfo) {
        info.max_clock = read_number(card.join("gt_max_freq_mhz"))
            .or_else(|| read_number(device.join("tile0/gt0/freq0/max_freq")));
    }

    pub fn sample(&mut self, sample: &mut GpuSample) {
        let now = Instant::now();
        let idle = self.idle.as_mut().and_then(ProcFile::number::<u64>);
        let energy = self.energy.as_mut().and_then(ProcFile::number::<u64>);
        if let Some((then, idle_before, energy_before)) = self.previous {
            let elapsed = now.duration_since(then).as_secs_f64();
            if let Some(idle) = idle.filter(|_| elapsed > 0.0) {
                let resting = idle.saturating_sub(idle_before) as f64 / (elapsed * 1000.0);
                sample.usage = Some(((1.0 - resting) * 100.0).clamp(0.0, 100.0) as f32);
            }
            if let Some(energy) = energy.filter(|_| elapsed > 0.0) {
                sample.power = Some(
                    (energy.saturating_sub(energy_before) as f64 / 1_000_000.0 / elapsed) as f32,
                );
            }
        }
        self.previous = Some((now, idle.unwrap_or(0), energy.unwrap_or(0)));
        sample.clock = self.clock.as_mut().and_then(ProcFile::number);
        sample.temperature = self.temperature.as_mut().and_then(Sensor::celsius);
    }
}
