use specta::Type;
use std::collections::{BTreeMap, HashMap};

use serde::{Deserialize, Serialize};

use super::notes::{self, Section};

const VERSION: &str = "org.opencontainers.image.version";
const NOTES: &str = "com.lantharos.release-notes";
const NVIDIA_DRIVER: &str = "com.lantharos.nvidia-driver";
const STORE_RELEASES: &str = "com.lantharos.store-releases";

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq, Type)]
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

    pub fn nvidia_driver(&self) -> Option<String> {
        self.label(NVIDIA_DRIVER)
    }

    /// The schelf.store releases of Luft's own apps and extensions that were out when the image
    /// was built, by id, from its `id=version id=version` label.
    pub fn store_releases(&self) -> BTreeMap<String, String> {
        self.label(STORE_RELEASES)
            .unwrap_or_default()
            .split_whitespace()
            .filter_map(|pair| pair.split_once('='))
            .map(|(id, version)| (id.to_owned(), version.to_owned()))
            .collect()
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
    use super::{Config, epoch};

    #[test]
    fn reads_store_releases() {
        let config: Config = serde_json::from_str(
            r#"{"config": {"Labels": {"com.lantharos.store-releases": "com.lantharos.mailman=1.0.4 com.lantharos.draft=0.3.1"}}}"#,
        )
        .expect("config");
        let releases = config.store_releases();
        assert_eq!(
            releases.get("com.lantharos.mailman").map(String::as_str),
            Some("1.0.4")
        );
        assert_eq!(
            releases.get("com.lantharos.draft").map(String::as_str),
            Some("0.3.1")
        );
    }

    #[test]
    fn reads_image_timestamps() {
        assert_eq!(epoch("2026-10-13T20:47:07.865244587Z"), Some(1_791_924_427));
        assert_eq!(epoch("2024-02-29T00:00:00Z"), Some(1_709_164_800));
    }
}
