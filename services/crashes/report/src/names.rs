//! The names a report must never carry: those of the people with an
//! account here and the computer's own.

use std::path::Path;

use crate::scrub::Scrubber;

const PASSWD: &str = "/etc/passwd";
const HOSTNAME: &str = "/proc/sys/kernel/hostname";
const MACHINE_INFO: &str = "/etc/machine-info";
const PRETTY_HOSTNAME: &str = "PRETTY_HOSTNAME=";
pub const PEOPLE: std::ops::RangeInclusive<u32> = 1000..=60000;
const EVERYONES_NAMES: [&str; 3] = ["luft", "localhost", "fedora"];

fn people() -> Vec<String> {
    std::fs::read_to_string(PASSWD)
        .unwrap_or_default()
        .lines()
        .filter_map(|line| {
            let fields: Vec<&str> = line.split(':').collect();
            let uid: u32 = fields.get(2)?.parse().ok()?;
            PEOPLE.contains(&uid).then(|| {
                let real = fields
                    .get(4)
                    .map_or("", |gecos| gecos.split(',').next().unwrap_or(""));
                [fields[0].to_owned(), real.to_owned()]
            })
        })
        .flatten()
        .collect()
}

fn computer() -> Vec<String> {
    let hostname = std::fs::read_to_string(HOSTNAME).unwrap_or_default();
    let pretty = std::fs::read_to_string(Path::new(MACHINE_INFO))
        .unwrap_or_default()
        .lines()
        .find_map(|line| {
            line.strip_prefix(PRETTY_HOSTNAME)
                .map(|name| name.trim_matches('"').to_owned())
        })
        .unwrap_or_default();
    vec![hostname.trim().to_owned(), pretty]
}

impl Scrubber {
    /// Hides the names of the people with an account here and the
    /// computer's own, wherever they show up.
    pub fn for_this_computer() -> Self {
        Self::hiding(
            people()
                .into_iter()
                .chain(computer())
                .filter(|name| !EVERYONES_NAMES.contains(&name.to_lowercase().as_str())),
        )
    }
}
