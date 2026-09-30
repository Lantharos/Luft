use std::fs;
use std::path::{Path, PathBuf};

use super::procfile::{ProcFile, read_text};

const HWMON: &str = "/sys/class/hwmon";
const CPU_CHIPS: [(&str, &[&str]); 5] = [
    ("k10temp", &["Tdie", "Tctl"]),
    ("zenpower", &["Tdie", "Tctl"]),
    ("coretemp", &["Package id 0"]),
    ("cpu_thermal", &[]),
    ("soc_thermal", &[]),
];

pub struct Sensor(ProcFile);

impl Sensor {
    fn open(path: &Path) -> Option<Self> {
        let mut file = ProcFile::open(path).ok()?;
        file.number::<i64>()?;
        Some(Self(file))
    }

    pub fn celsius(&mut self) -> Option<f32> {
        self.0
            .number::<i64>()
            .map(|millidegrees| millidegrees as f32 / 1000.0)
    }
}

struct Chip {
    path: PathBuf,
    name: String,
}

impl Chip {
    fn temperature(&self, labels: &[&str]) -> Option<Sensor> {
        let inputs = temperature_inputs(&self.path);
        labels
            .iter()
            .find_map(|wanted| {
                inputs
                    .iter()
                    .find(|(label, _)| label.as_deref() == Some(*wanted))
            })
            .or_else(|| inputs.first())
            .and_then(|(_, path)| Sensor::open(path))
    }
}

fn chips() -> Vec<Chip> {
    let Ok(entries) = fs::read_dir(HWMON) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            let name = read_text(path.join("name"))?;
            Some(Chip { path, name })
        })
        .collect()
}

fn temperature_inputs(chip: &Path) -> Vec<(Option<String>, PathBuf)> {
    let Ok(entries) = fs::read_dir(chip) else {
        return Vec::new();
    };
    let mut inputs: Vec<(u32, Option<String>, PathBuf)> = entries
        .flatten()
        .filter_map(|entry| {
            let file = entry.file_name().into_string().ok()?;
            let index = file
                .strip_prefix("temp")?
                .strip_suffix("_input")?
                .parse()
                .ok()?;
            let label = read_text(chip.join(format!("temp{index}_label")));
            Some((index, label, entry.path()))
        })
        .collect();
    inputs.sort_by_key(|(index, ..)| *index);
    inputs
        .into_iter()
        .map(|(_, label, path)| (label, path))
        .collect()
}

pub fn cpu_sensor() -> Option<Sensor> {
    let chips = chips();
    CPU_CHIPS.iter().find_map(|(name, labels)| {
        chips
            .iter()
            .find(|chip| chip.name == *name)
            .and_then(|chip| chip.temperature(labels))
    })
}

pub fn device_sensor(device: &Path, labels: &[&str]) -> Option<Sensor> {
    let device = fs::canonicalize(device).ok()?;
    chips()
        .into_iter()
        .find(|chip| fs::canonicalize(chip.path.join("device")).is_ok_and(|path| path == device))
        .and_then(|chip| chip.temperature(labels))
}

pub fn device_chip(device: &Path) -> Option<PathBuf> {
    let directory = fs::read_dir(device.join("hwmon")).ok()?;
    directory.flatten().map(|entry| entry.path()).next()
}
