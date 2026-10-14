use gio::prelude::*;
use luft_app::dbus::service::{failed, get};
use serde::Deserialize;
use serde_json::Value;

use super::TIME;

const ZONES: &str = "/usr/share/zoneinfo/zone.tab";
const LOCALE: &str = "org.gnome.system.locale";
const REGION: &str = "region";

#[derive(Deserialize)]
pub struct Formats {
    region: String,
}

fn country_of(zone: &str) -> Option<String> {
    std::fs::read_to_string(ZONES)
        .ok()?
        .lines()
        .filter(|line| !line.starts_with('#'))
        .find_map(|line| {
            let mut fields = line.split('\t');
            let country = fields.next()?;
            (fields.nth(1)? == zone).then(|| country.to_owned())
        })
}

pub fn unset_country(_: Value) -> Result<Option<String>, String> {
    if !gio::Settings::new(LOCALE).string(REGION).is_empty() {
        return Ok(None);
    }
    let zone: Option<String> = TIME
        .read()?
        .and_then(|properties| get(&properties, "Timezone"));
    Ok(zone.as_deref().and_then(country_of))
}

pub fn set(Formats { region }: Formats) -> Result<(), String> {
    gio::Settings::new(LOCALE)
        .set_string(REGION, &region)
        .map_err(failed)?;
    gio::Settings::sync();
    Ok(())
}
