mod attach;
mod conflicts;
mod filters;
mod keep;
mod links;
mod states;
mod upkeep;
mod watch;

use std::collections::{HashMap, HashSet};
use std::path::{Component, Path, PathBuf};
use std::sync::{Arc, Mutex, MutexGuard};
use std::time::Instant;

use anyhow::{Context, Result};
use luft_accounts::types::{Drive, DriveState, Provider, Usage};

pub use attach::{attach, detach, rename};
pub use keep::{free, keep, reach_cloud, report, sync};
pub use links::{share_link, web_address};
pub use states::states;
pub use upkeep::run as upkeep;
pub use watch::{Watcher, follow_changes};

use crate::hub::Hub;
use crate::store::Record;

#[derive(Clone)]
pub struct Live {
    pub state: DriveState,
    pub problem: Option<String>,
    pub mounted: Option<PathBuf>,
    pub fallback: bool,
    pub usage: Option<Usage>,
    pub uploads: HashSet<String>,
    pub syncing: bool,
    pub dirty: Option<Instant>,
}

impl Live {
    pub fn can_sync(&self) -> bool {
        self.state == DriveState::Ready && !self.fallback
    }
}

impl Default for Live {
    fn default() -> Self {
        Self {
            state: DriveState::Connecting,
            problem: None,
            mounted: None,
            fallback: false,
            usage: None,
            uploads: HashSet::new(),
            syncing: false,
            dirty: None,
        }
    }
}

pub struct Drives {
    pub watcher: Watcher,
    pub changed: tokio::sync::Notify,
    live: Mutex<HashMap<String, Live>>,
    locks: Mutex<HashMap<String, Arc<tokio::sync::Mutex<()>>>>,
}

impl Drives {
    pub fn new(watcher: Watcher) -> Self {
        Self {
            watcher,
            changed: tokio::sync::Notify::new(),
            live: Mutex::default(),
            locks: Mutex::default(),
        }
    }

    pub fn live(&self) -> MutexGuard<'_, HashMap<String, Live>> {
        self.live.lock().expect("drive state is never poisoned")
    }

    pub fn update<T>(&self, account: &str, change: impl FnOnce(&mut Live) -> T) -> T {
        change(self.live().entry(account.to_owned()).or_default())
    }

    pub fn get(&self, account: &str) -> Live {
        self.live().get(account).cloned().unwrap_or_default()
    }

    pub fn forget(&self, account: &str) {
        self.live().remove(account);
        self.locks.lock().expect("never poisoned").remove(account);
    }

    pub fn lock(&self, account: &str) -> Arc<tokio::sync::Mutex<()>> {
        self.locks
            .lock()
            .expect("never poisoned")
            .entry(account.to_owned())
            .or_default()
            .clone()
    }
}

pub fn remote(account: &str) -> String {
    format!("{account}:")
}

pub fn union_name(account: &str) -> String {
    format!("{account}-files")
}

pub fn union(account: &str) -> String {
    format!("{}:", union_name(account))
}

pub fn reports_usage(provider: Provider) -> bool {
    provider != Provider::Icloud
}

pub fn offers_links(provider: Provider) -> bool {
    matches!(
        provider,
        Provider::Onedrive | Provider::Dropbox | Provider::Nextcloud
    )
}

pub fn snapshot(hub: &Hub) -> Vec<Drive> {
    let records = hub.records().all().to_vec();
    let pause = hub.conditions().pause;
    records
        .into_iter()
        .map(|record| {
            let live = hub.drives.get(&record.id);
            Drive {
                path: hub
                    .paths
                    .cloud
                    .join(&record.name)
                    .to_string_lossy()
                    .into_owned(),
                state: if record.sign_in_again.is_some() {
                    DriveState::SignInAgain
                } else {
                    live.state
                },
                problem: record.sign_in_again.clone().or(live.problem),
                paused: pause,
                syncing: live.uploads.len() as u32 + u32::from(live.syncing),
                usage: live.usage,
                kept: record.kept.clone(),
                conflicts: record.conflicts.clone(),
                share_links: offers_links(record.provider),
                web: offers_links(record.provider),
                account: record.id,
                provider: record.provider,
                name: record.name,
            }
        })
        .collect()
}

pub struct Located {
    pub record: Record,
    pub relative: String,
}

pub fn locate(hub: &Hub, path: &Path) -> Result<Located> {
    let (name, relative) = split(&hub.paths.cloud, path).context("That isn't in a cloud drive")?;
    let record = hub
        .records()
        .all()
        .iter()
        .find(|record| record.name == name)
        .cloned()
        .context("That cloud drive isn't here anymore")?;
    Ok(Located { record, relative })
}

fn split(cloud: &Path, path: &Path) -> Option<(String, String)> {
    let mut names = Vec::new();
    for part in path.strip_prefix(cloud).ok()?.components() {
        let Component::Normal(name) = part else {
            return None;
        };
        names.push(name.to_string_lossy());
    }
    let (drive, inside) = names.split_first()?;
    Some((drive.to_string(), inside.join("/")))
}

pub fn covers(parent: &str, path: &str) -> bool {
    parent.is_empty()
        || path == parent
        || path
            .strip_prefix(parent)
            .is_some_and(|rest| rest.starts_with('/'))
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use super::{covers, split};

    #[test]
    fn paths_stay_inside_their_drive() {
        let cloud = Path::new("/home/ada/Cloud");
        let split = |path: &str| split(cloud, Path::new(path));
        assert_eq!(
            split("/home/ada/Cloud/Dropbox/Docs/a.txt"),
            Some(("Dropbox".to_owned(), "Docs/a.txt".to_owned()))
        );
        assert_eq!(
            split("/home/ada/Cloud/Dropbox/"),
            Some(("Dropbox".to_owned(), String::new()))
        );
        assert_eq!(split("/home/ada/Cloud/Dropbox/../../Documents"), None);
        assert_eq!(split("/home/ada/Cloud/Dropbox/Docs/.."), None);
        assert_eq!(split("/home/ada/Cloud"), None);
        assert_eq!(split("/home/ada/Documents"), None);
    }

    #[test]
    fn folders_cover_what_is_inside_them() {
        assert!(covers("Docs", "Docs"));
        assert!(covers("Docs", "Docs/a.txt"));
        assert!(!covers("Docs", "Docs2/a.txt"));
        assert!(covers("", "anything"));
    }
}
