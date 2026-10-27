use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use super::notes::{self, Section};

const VERSION: &str = "org.opencontainers.image.version";
const NOTES: &str = "com.lantharos.release-notes";

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Release {
    pub version: Option<String>,
    pub notes: Option<Vec<Section>>,
    pub released: Option<u64>,
}

#[derive(Deserialize, Default, Debug)]
pub struct Config {
    created: Option<String>,
    #[serde(default)]
    config: Settings,
    #[serde(default)]
    rootfs: Root,
}

#[derive(Deserialize, Default, Debug)]
struct Settings {
    #[serde(rename = "Labels", default)]
    labels: Option<HashMap<String, String>>,
}

#[derive(Deserialize, Default, Debug)]
struct Root {
    #[serde(default)]
    diff_ids: Vec<String>,
}

impl Config {
    fn label(&self, name: &str) -> Option<String> {
        self.config
            .labels
            .as_ref()?
            .get(name)
            .map(|value| value.trim())
            .filter(|value| !value.is_empty())
            .map(str::to_owned)
    }

    pub fn release(&self) -> Release {
        Release {
            version: self.label(VERSION),
            notes: self
                .label(NOTES)
                .and_then(|label| serde_json::from_str(&label).ok())
                .and_then(|sections| notes::merge([sections])),
            released: self.created.as_deref().and_then(epoch),
        }
    }

    pub fn layers(&self) -> &[String] {
        &self.rootfs.diff_ids
    }
}

fn epoch(timestamp: &str) -> Option<u64> {
    let number = |range: std::ops::Range<usize>| timestamp.get(range)?.parse::<i64>().ok();
    let (year, month, day) = (number(0..4)?, number(5..7)?, number(8..10)?);
    let (hour, minute, second) = (number(11..13)?, number(14..16)?, number(17..19)?);
    let year = if month <= 2 { year - 1 } else { year };
    let era = year.div_euclid(400);
    let of_era = year - era * 400;
    let of_year = (153 * ((month + 9) % 12) + 2) / 5 + day - 1;
    let of_era_days = of_era * 365 + of_era / 4 - of_era / 100 + of_year;
    let days = era * 146_097 + of_era_days - 719_468;
    u64::try_from(days * 86_400 + hour * 3_600 + minute * 60 + second).ok()
}

#[cfg(test)]
mod tests {
    use super::epoch;

    #[test]
    fn reads_image_timestamps() {
        assert_eq!(epoch("2026-10-13T20:47:07.865244587Z"), Some(1_791_924_427));
        assert_eq!(epoch("2024-02-29T00:00:00Z"), Some(1_709_164_800));
    }
}
