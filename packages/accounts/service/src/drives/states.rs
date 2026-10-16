use std::collections::BTreeMap;
use std::fs;
use std::path::Path;

use anyhow::Result;
use luft_accounts::types::FileState;

use super::{covers, filters, locate};
use crate::hub::Hub;

pub fn states(hub: &Hub, folder: &Path) -> Result<BTreeMap<String, FileState>> {
    let located = locate(hub, folder)?;
    let record = located.record;
    let live = hub.drives.get(&record.id);
    let kept = hub.paths.kept(&record.id);
    let mut states = BTreeMap::new();
    for entry in fs::read_dir(folder)?.flatten() {
        let name = entry.file_name().to_string_lossy().into_owned();
        let relative = if located.relative.is_empty() {
            name.clone()
        } else {
            format!("{}/{name}", located.relative)
        };
        let uploading = live.uploads.iter().any(|upload| covers(&relative, upload));
        let state = if uploading {
            FileState::Syncing
        } else if filters::keeps(&record.kept, &record.skipped, &relative) {
            if kept.join(&relative).exists() {
                FileState::Local
            } else {
                FileState::Syncing
            }
        } else {
            FileState::Online
        };
        states.insert(name, state);
    }
    Ok(states)
}
