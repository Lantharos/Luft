use std::collections::{BTreeMap, HashMap};

use futures_util::StreamExt;
use zbus::{OwnedVariant, Proxy};

type Reported = (u32, Vec<HashMap<String, OwnedVariant>>);

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

fn number(entry: &HashMap<String, OwnedVariant>, key: &str) -> Option<i32> {
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

pub async fn set(
    proxy: &Proxy<'_>,
    connector: &str,
    (serial, value): (u32, i32),
) -> Result<(), String> {
    proxy
        .call_method("SetBacklight", &(serial, connector, value))
        .await
        .map(|_| ())
        .map_err(|error| error.to_string())
}

pub async fn read(proxy: &Proxy<'_>) -> Panels {
    proxy
        .get_property::<Reported>(PROPERTY)
        .await
        .map(Panels::from_reported)
        .unwrap_or_default()
}

pub async fn watch(proxy: Proxy<'static>, mut changed: impl FnMut(Panels)) {
    let mut changes = proxy.receive_property_changed::<Reported>(PROPERTY).await;
    while let Some(change) = changes.next().await {
        if let Ok(reported) = change.get().await {
            changed(Panels::from_reported(reported));
        }
    }
}
