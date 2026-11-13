use std::fs::{self, File};
use std::io::Write;
use std::path::Path;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use anyhow::{Context, Result, bail};
use luft_variant::Channel;
use serde::{Deserialize, Serialize};

const FILE: &str = "/var/lib/luft-updater/schedule.json";
const DAY: u64 = 24 * 60 * 60;
const EARLY: u64 = 4 * 60 * 60;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Default, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Every {
    #[default]
    Daily,
    Weekly,
    Never,
}

impl Every {
    pub fn named(name: &str) -> Result<Self> {
        Ok(match name {
            "daily" => Self::Daily,
            "weekly" => Self::Weekly,
            "never" => Self::Never,
            _ => bail!("“{name}” isn't a schedule for updates."),
        })
    }

    pub fn name(self) -> &'static str {
        match self {
            Self::Daily => "daily",
            Self::Weekly => "weekly",
            Self::Never => "never",
        }
    }

    fn interval(self) -> Option<u64> {
        match self {
            Self::Daily => Some(DAY),
            Self::Weekly => Some(7 * DAY),
            Self::Never => None,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
pub struct Schedule {
    pub every: Every,
    pub download: bool,
    pub checked: u64,
    /// A channel chosen while it had nothing as new as the running version, which the system
    /// moves to once it does. While it waits for stable it keeps taking nightlies.
    pub waiting: Option<Channel>,
}

impl Default for Schedule {
    fn default() -> Self {
        Self {
            every: Every::Daily,
            download: true,
            checked: 0,
            waiting: None,
        }
    }
}

pub fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::ZERO)
        .as_secs()
}

impl Schedule {
    pub fn load() -> Self {
        fs::read(FILE)
            .ok()
            .and_then(|text| serde_json::from_slice(&text).ok())
            .unwrap_or_default()
    }

    pub fn save(&self) -> Result<()> {
        let file = Path::new(FILE);
        let partial = file.with_extension("new");
        let text = serde_json::to_vec(self)?;
        File::create(&partial)
            .and_then(|mut partial| {
                partial.write_all(&text)?;
                partial.sync_all()
            })
            .and_then(|()| fs::rename(&partial, file))
            .with_context(|| format!("Writing {FILE}"))
    }

    /// Whether a check is due at `now`. The timer comes by every three hours, up to an hour
    /// late, so a check is due once the next visit would come after the interval.
    pub fn due(&self, now: u64) -> bool {
        self.every
            .interval()
            .is_some_and(|interval| now.saturating_sub(self.checked) + EARLY >= interval)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn checks_once_per_interval() {
        let mut schedule = Schedule {
            checked: 10 * DAY,
            ..Schedule::default()
        };
        assert!(!schedule.due(10 * DAY + 6 * 60 * 60));
        assert!(schedule.due(11 * DAY - 3 * 60 * 60));
        schedule.every = Every::Weekly;
        assert!(!schedule.due(12 * DAY));
        assert!(schedule.due(17 * DAY));
        schedule.every = Every::Never;
        assert!(!schedule.due(100 * DAY));
    }
}
