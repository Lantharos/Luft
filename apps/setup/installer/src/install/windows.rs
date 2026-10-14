use std::path::Path;

use anyhow::Result;
use luft_windows::bluetooth::{Pairing, bluez};
use luft_windows::change::{self, Change};
use serde::Deserialize;

use super::configure::deployment::Deployment;
use crate::survey::Survey;

const UNTOUCHABLE: [&str; 3] = ["bitlocker", "hibernated", "dirty"];

#[derive(Deserialize, Default, Clone, Copy)]
#[serde(rename_all = "camelCase", default)]
pub struct Choices {
    pub fast_startup_off: bool,
    pub universal_clock: bool,
    pub bluetooth: bool,
}

pub struct Windows {
    device: String,
    changes: Vec<Change>,
    pairings: Vec<Pairing>,
}

impl Windows {
    pub fn chosen(survey: &Survey, drive: &str, choices: Choices) -> Option<Self> {
        let windows = survey
            .drives
            .iter()
            .find(|candidate| candidate.block == drive)?
            .windows
            .as_ref()
            .filter(|windows| {
                !windows
                    .blocked
                    .is_some_and(|why| UNTOUCHABLE.contains(&why))
            })?;
        let changes = [
            (
                choices.fast_startup_off && windows.fast_startup,
                Change::FastStartupOff,
            ),
            (
                choices.universal_clock && !windows.universal_clock,
                Change::UniversalClock,
            ),
        ]
        .into_iter()
        .filter_map(|(wanted, change)| wanted.then_some(change))
        .collect();
        let pairings = if choices.bluetooth {
            windows.bluetooth.clone()
        } else {
            Vec::new()
        };
        Some(Self {
            device: windows.device.clone(),
            changes,
            pairings,
        })
    }

    pub fn change(&self) {
        if self.changes.is_empty() {
            return;
        }
        if let Err(error) = change::apply(Path::new(&self.device), &self.changes) {
            eprintln!("Windows' settings weren't changed: {error:#}");
        }
    }

    pub fn bring_bluetooth(&self, deployment: &Deployment) -> Result<()> {
        if self.pairings.is_empty() {
            return Ok(());
        }
        let storage = deployment.var(bluez::STORAGE.trim_start_matches("/var/"));
        bluez::import(&storage, &self.pairings)?;
        deployment.relabel(&[storage])
    }
}
