const ZONE_TABLES: [&str; 2] = [
    "/usr/share/zoneinfo/zone1970.tab",
    "/usr/share/zoneinfo/zone.tab",
];

#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Coordinates {
    pub latitude: f64,
    pub longitude: f64,
}

impl Coordinates {
    pub fn known((latitude, longitude): (f64, f64)) -> Option<Self> {
        (latitude.abs() <= 90.0 && longitude.abs() <= 180.0).then_some(Self {
            latitude,
            longitude,
        })
    }
}

pub fn timezone() -> Option<String> {
    if let Ok(zone) = std::env::var("TZ") {
        return Some(zone.trim_start_matches(':').to_owned());
    }
    let target = std::fs::read_link("/etc/localtime").ok()?;
    let target = target.to_str()?;
    Some(target[target.find("zoneinfo/")? + "zoneinfo/".len()..].to_owned())
}

pub fn zone_coordinates(zone: &str) -> Option<Coordinates> {
    ZONE_TABLES.iter().find_map(|table| {
        let text = std::fs::read_to_string(table).ok()?;
        text.lines()
            .map(|line| line.split('\t').collect::<Vec<_>>())
            .find(|columns| columns.get(2) == Some(&zone))
            .and_then(|columns| parse_iso6709(columns[1]))
    })
}

fn parse_iso6709(text: &str) -> Option<Coordinates> {
    let split = text[1..].find(['+', '-'])? + 1;
    Some(Coordinates {
        latitude: degrees(&text[..split], 2)?,
        longitude: degrees(&text[split..], 3)?,
    })
}

fn degrees(text: &str, digits: usize) -> Option<f64> {
    let sign = if text.starts_with('-') { -1.0 } else { 1.0 };
    let body = &text[1..];
    let whole: f64 = body.get(..digits)?.parse().ok()?;
    let minutes: f64 = body.get(digits..digits + 2)?.parse().ok()?;
    let seconds: f64 = body
        .get(digits + 2..)
        .filter(|rest| !rest.is_empty())
        .map_or(Some(0.0), |rest| rest.parse().ok())?;
    Some(sign * (whole + minutes / 60.0 + seconds / 3600.0))
}
