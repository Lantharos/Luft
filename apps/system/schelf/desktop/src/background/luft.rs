use std::fs;
use std::path::PathBuf;

use schelf_core::store;
use schelf_core::store::install::download;
use schelf_core::store::listing::luft::Luft;
use serde::{Deserialize, Serialize};

use super::quietly;

/// The versions of Luft on the computer that apps were last updated for: the
/// running one, and the one waiting for the next restart.
#[derive(Serialize, Deserialize, PartialEq, Eq, Default)]
pub struct Versions {
    running: Option<String>,
    staged: Option<String>,
}

fn record() -> PathBuf {
    dirs::state_dir()
        .unwrap_or_default()
        .join("luft/apps-updated-for")
}

impl Versions {
    pub fn now() -> Self {
        Self {
            running: Luft::Running.digest().map(str::to_owned),
            staged: Luft::Staged.digest().map(str::to_owned),
        }
    }

    pub fn last() -> Self {
        fs::read(record())
            .ok()
            .and_then(|bytes| serde_json::from_slice(&bytes).ok())
            .unwrap_or_default()
    }

    pub fn save(&self) -> Result<(), String> {
        let record = record();
        if let Some(folder) = record.parent() {
            fs::create_dir_all(folder).map_err(|error| error.to_string())?;
        }
        let text = serde_json::to_vec(self).map_err(|error| error.to_string())?;
        fs::write(record, text).map_err(|error| error.to_string())
    }

    /// Forgets what was downloaded ahead once no version waits for it.
    pub fn settle(&self) {
        if self.staged.is_none() {
            download::forget_ahead();
        }
    }
}

/// Downloads the releases of Luft's own apps that go with the version of Luft
/// waiting for the next restart, so they install the moment it starts.
pub fn download_ahead(failures: &mut Vec<String>) {
    let ahead = match store::updates::ahead() {
        Ok(ahead) => ahead,
        Err(error) => return failures.push(error),
    };
    for update in ahead.into_iter().filter(|update| !update.widens) {
        match quietly(|task| store::install::download_ahead(&update.id, &update.consent, task)) {
            Ok(()) => eprintln!(
                "Downloaded {} {} for the next restart",
                update.name, update.to
            ),
            Err(error) => failures.push(format!("{}: {error}", update.name)),
        }
    }
}
