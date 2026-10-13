use std::collections::HashMap;

use serde::{Deserialize, Serialize};

const ZONES: &str = "/usr/share/zoneinfo/zone1970.tab";
const COUNTRIES: &str = "/usr/share/iso-codes/json/iso_3166-1.json";

#[derive(Serialize)]
pub struct Zone {
    id: String,
    city: String,
    country: String,
    code: String,
}

#[derive(Deserialize)]
struct Countries {
    #[serde(rename = "3166-1")]
    entries: Vec<Country>,
}

#[derive(Deserialize)]
struct Country {
    alpha_2: String,
    name: String,
    common_name: Option<String>,
}

fn countries() -> HashMap<String, String> {
    std::fs::read_to_string(COUNTRIES)
        .ok()
        .and_then(|text| serde_json::from_str::<Countries>(&text).ok())
        .map(|countries| {
            countries
                .entries
                .into_iter()
                .map(|country| (country.alpha_2, country.common_name.unwrap_or(country.name)))
                .collect()
        })
        .unwrap_or_default()
}

pub fn all() -> Vec<Zone> {
    let names = countries();
    let mut zones: Vec<Zone> = std::fs::read_to_string(ZONES)
        .unwrap_or_default()
        .lines()
        .filter(|line| !line.starts_with('#'))
        .filter_map(|line| {
            let mut fields = line.split('\t');
            let code = fields.next()?.split(',').next()?.to_owned();
            let id = fields.nth(1)?.to_owned();
            let city = id.rsplit('/').next()?.replace('_', " ");
            Some(Zone {
                country: names.get(&code).cloned().unwrap_or_else(|| code.clone()),
                city,
                code,
                id,
            })
        })
        .collect();
    zones.sort_by(|a, b| (&a.country, &a.city).cmp(&(&b.country, &b.city)));
    zones
}
