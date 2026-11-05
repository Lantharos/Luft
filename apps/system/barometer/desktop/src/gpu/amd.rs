use std::fs;
use std::path::Path;

use crate::system::hwmon::{self, Sensor};
use crate::system::procfile::{ProcFile, read_number};

use super::{GpuInfo, GpuSample};

pub struct Amd {
    busy: Option<ProcFile>,
    memory_used: Option<ProcFile>,
    memory_total: Option<u64>,
    temperature: Option<Sensor>,
    power: Option<ProcFile>,
    clock: Option<ProcFile>,
    memory_clock: Option<ProcFile>,
}

impl Amd {
    pub fn open(device: &Path) -> Self {
        let chip = hwmon::device_chip(device);
        let chip_file = |names: &[&str]| {
            let chip = chip.as_ref()?;
            names
                .iter()
                .find_map(|name| ProcFile::open(chip.join(name)).ok())
        };
        Self {
            busy: ProcFile::open(device.join("gpu_busy_percent")).ok(),
            memory_used: ProcFile::open(device.join("mem_info_vram_used")).ok(),
            memory_total: read_number(device.join("mem_info_vram_total")),
            temperature: hwmon::device_sensor(device, &["edge"]),
            power: chip_file(&["power1_average", "power1_input"]),
            clock: chip_file(&["freq1_input"]),
            memory_clock: chip_file(&["freq2_input"]),
        }
    }

    pub fn describe(&self, device: &Path, info: &mut GpuInfo) {
        info.memory_total = self.memory_total.filter(|total| *total > 0);
        let chip = hwmon::device_chip(device);
        info.power_cap = chip
            .and_then(|chip| read_number::<f64>(chip.join("power1_cap")))
            .map(|microwatts| (microwatts / 1_000_000.0) as f32);
        info.max_clock = highest_level(&device.join("pp_dpm_sclk"));
        info.max_memory_clock = highest_level(&device.join("pp_dpm_mclk"));
    }

    pub fn sample(&mut self, sample: &mut GpuSample) {
        sample.usage = self.busy.as_mut().and_then(ProcFile::number::<f32>);
        sample.memory_used = self.memory_used.as_mut().and_then(ProcFile::number);
        sample.memory_total = self.memory_total.filter(|total| *total > 0);
        sample.temperature = self.temperature.as_mut().and_then(Sensor::celsius);
        sample.power = self
            .power
            .as_mut()
            .and_then(ProcFile::number::<f64>)
            .map(|microwatts| (microwatts / 1_000_000.0) as f32);
        let megahertz = |file: &mut Option<ProcFile>| {
            file.as_mut()
                .and_then(ProcFile::number::<u64>)
                .map(|hertz| (hertz / 1_000_000) as u32)
        };
        sample.clock = megahertz(&mut self.clock);
        sample.memory_clock = megahertz(&mut self.memory_clock);
    }
}

fn highest_level(path: &Path) -> Option<u32> {
    let text = fs::read_to_string(path).ok()?;
    text.lines()
        .filter_map(|line| {
            let value = line.split_once(':')?.1.trim();
            let digits = value.trim_end_matches(|c: char| !c.is_ascii_digit());
            digits.parse().ok()
        })
        .max()
}
