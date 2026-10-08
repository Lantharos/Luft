use std::collections::{BTreeMap, HashMap};

use zbus::blocking::Proxy;
use zbus::zvariant::OwnedValue;

type Reported = (u32, Vec<HashMap<String, OwnedValue>>);

const PROPERTY: &str = "Backlight";

struct Light {
    min: i32,
    max: i32,
    value: i32,
}

#[derive(Default)]
pub struct Panels {
    serial: u32,
    lights: BTreeMap<String, Light>,
}

fn number(entry: &HashMap<String, OwnedValue>, key: &str) -> Option<i32> {
    entry.get(key)?.downcast_ref::<i32>().ok()
}

impl Light {
    fn level(&self) -> f64 {
        f64::from(self.value - self.min) / f64::from(self.max - self.min)
    }
}

impl Panels {
    fn from_reported((serial, entries): Reported) -> Self {
        let lights = entries
            .iter()
            .filter_map(|entry| {
                let connector = entry.get("connector")?.downcast_ref::<String>().ok()?;
                let light = Light {
                    min: number(entry, "min")?,
                    max: number(entry, "max")?,
                    value: number(entry, "value")?,
                };
                (light.max > light.min).then_some((connector, light))
            })
            .collect();
        Self { serial, lights }
    }

    pub fn levels(&self) -> impl Iterator<Item = (&String, f64)> {
        self.lights
            .iter()
            .map(|(connector, light)| (connector, light.level()))
    }

    pub fn target(&self, connector: &str, level: f64) -> Option<(u32, i32)> {
        let light = self.lights.get(connector)?;
        let span = f64::from(light.max - light.min);
        Some((
            self.serial,
            light.min + (level.clamp(0.0, 1.0) * span).round() as i32,
        ))
    }
}

pub fn set(proxy: &Proxy, connector: &str, (serial, value): (u32, i32)) -> Result<(), String> {
    proxy
        .call_method("SetBacklight", &(serial, connector, value))
        .map(|_| ())
        .map_err(|error| error.to_string())
}

pub fn read(proxy: &Proxy) -> Panels {
    proxy
        .get_property::<Reported>(PROPERTY)
        .map(Panels::from_reported)
        .unwrap_or_default()
}

pub fn watch(proxy: &Proxy, mut changed: impl FnMut(Panels)) {
    for change in proxy.receive_property_changed::<Reported>(PROPERTY) {
        if let Ok(reported) = change.get() {
            changed(Panels::from_reported(reported));
        }
    }
}
