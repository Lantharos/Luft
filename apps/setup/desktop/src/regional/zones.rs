use serde::Serialize;

const ZONES: &str = "/usr/share/zoneinfo/zone1970.tab";

#[derive(Serialize)]
pub struct Zone {
    id: String,
    city: String,
    code: String,
}

pub fn all() -> Vec<Zone> {
    std::fs::read_to_string(ZONES)
        .unwrap_or_default()
        .lines()
        .filter(|line| !line.starts_with('#'))
        .filter_map(|line| {
            let mut fields = line.split('\t');
            let code = fields.next()?.split(',').next()?.to_owned();
            let id = fields.nth(1)?.to_owned();
            let city = id.rsplit('/').next()?.replace('_', " ");
            Some(Zone { city, code, id })
        })
        .collect()
}
