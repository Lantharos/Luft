use std::fs;
use std::path::PathBuf;

use serde::Serialize;

use super::procfile::{read_number, read_text};

const POWER_SUPPLY: &str = "/sys/class/power_supply";

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BatteryInfo {
    pub id: String,
    name: String,
    model: Option<String>,
    manufacturer: Option<String>,
    technology: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BatterySample {
    id: String,
    charge: f32,
    state: String,
    power: Option<f32>,
    energy: Option<f32>,
    energy_full: Option<f32>,
    energy_design: Option<f32>,
    voltage: Option<f32>,
    cycles: Option<u32>,
    seconds_left: Option<f64>,
    plugged_in: bool,
}

struct Battery {
    info: BatteryInfo,
    path: PathBuf,
}

pub struct Batteries {
    batteries: Vec<Battery>,
    adapters: Vec<PathBuf>,
}

impl Batteries {
    pub fn new() -> Self {
        let mut batteries = Vec::new();
        let mut adapters = Vec::new();
        if let Ok(entries) = fs::read_dir(POWER_SUPPLY) {
            for entry in entries.flatten() {
                let path = entry.path();
                match read_text(path.join("type")).as_deref() {
                    Some("Battery")
                        if read_text(path.join("scope")).as_deref() != Some("Device") =>
                    {
                        batteries.push(Battery::open(path))
                    }
                    Some("Mains" | "USB") => adapters.push(path),
                    _ => {}
                }
            }
        }
        batteries.sort_by(|a, b| a.info.name.cmp(&b.info.name));
        Self {
            batteries,
            adapters,
        }
    }

    pub fn infos(&self) -> Vec<BatteryInfo> {
        self.batteries
            .iter()
            .map(|battery| battery.info.clone())
            .collect()
    }

    pub fn sample(&self) -> Vec<BatterySample> {
        let plugged_in = self
            .adapters
            .iter()
            .any(|adapter| read_number::<u8>(adapter.join("online")) == Some(1));
        self.batteries
            .iter()
            .map(|battery| battery.sample(plugged_in))
            .collect()
    }
}

impl Battery {
    fn open(path: PathBuf) -> Self {
        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned();
        Self {
            info: BatteryInfo {
                id: format!("battery:{name}"),
                name,
                model: read_text(path.join("model_name")),
                manufacturer: read_text(path.join("manufacturer")),
                technology: read_text(path.join("technology"))
                    .filter(|technology| technology != "Unknown"),
            },
            path,
        }
    }

    fn sample(&self, plugged_in: bool) -> BatterySample {
        let micro =
            |file: &str| read_number::<f64>(self.path.join(file)).map(|value| value / 1_000_000.0);
        let voltage = micro("voltage_now");
        let energy_of =
            |energy: &str, charge: &str| micro(energy).or_else(|| Some(micro(charge)? * voltage?));
        let energy = energy_of("energy_now", "charge_now");
        let energy_full = energy_of("energy_full", "charge_full");
        let energy_design = energy_of("energy_full_design", "charge_full_design");
        let power = micro("power_now")
            .or_else(|| Some(micro("current_now")? * voltage?))
            .map(f64::abs)
            .filter(|power| *power > 0.0);
        let state = read_text(self.path.join("status")).unwrap_or_else(|| "Unknown".to_owned());
        let charge = read_number::<f32>(self.path.join("capacity"))
            .or_else(|| Some((energy? / energy_full? * 100.0) as f32))
            .unwrap_or(0.0);
        let seconds_left = power.and_then(|power| {
            let hours = match state.as_str() {
                "Discharging" => energy? / power,
                "Charging" => (energy_full? - energy?) / power,
                _ => return None,
            };
            Some(hours * 3600.0)
        });
        BatterySample {
            id: self.info.id.clone(),
            charge,
            state,
            power: power.map(|value| value as f32),
            energy: energy.map(|value| value as f32),
            energy_full: energy_full.map(|value| value as f32),
            energy_design: energy_design.map(|value| value as f32),
            voltage: voltage.map(|value| value as f32),
            cycles: read_number::<u32>(self.path.join("cycle_count")).filter(|cycles| *cycles > 0),
            seconds_left,
            plugged_in,
        }
    }
}
