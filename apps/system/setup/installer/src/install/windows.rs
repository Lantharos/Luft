use std::path::Path;

use anyhow::Result;
use luft_installer_contract::{WindowsBlock, WindowsChoices};
use luft_windows::bluetooth::{Pairing, bluez};
use luft_windows::change::{self, Change};

use super::configure::deployment::Deployment;
use crate::survey::Survey;

pub struct Windows {
    device: String,
    changes: Vec<Change>,
    pairings: Vec<Pairing>,
}

impl Windows {
    pub fn chosen(survey: &Survey, drive: &str, choices: WindowsChoices) -> Option<Self> {
        let windows = survey
            .found
            .drives
            .iter()
            .find(|candidate| candidate.block == drive)?
            .windows
            .as_ref()
            .filter(|windows| {
                !matches!(
                    windows.blocked,
                    Some(WindowsBlock::Bitlocker | WindowsBlock::Hibernated | WindowsBlock::Dirty)
                )
            })?;
        let details = survey.windows.get(drive)?;
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
            details.bluetooth.clone()
        } else {
            Vec::new()
        };
        Some(Self {
            device: details.device.clone(),
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
