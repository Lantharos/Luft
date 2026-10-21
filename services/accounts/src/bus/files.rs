use std::path::{Path, PathBuf};
use std::sync::Arc;

use zbus::interface;

use super::{Error, json};
use crate::drives;
use crate::hub::Hub;

pub struct Files {
    hub: Arc<Hub>,
}

impl Files {
    pub fn new(hub: Arc<Hub>) -> Self {
        Self { hub }
    }
}

fn paths(paths: Vec<String>) -> Vec<PathBuf> {
    paths.into_iter().map(PathBuf::from).collect()
}

#[interface(name = "com.lantharos.Accounts1.Files")]
impl Files {
    fn drives(&self) -> String {
        json(&drives::snapshot(&self.hub))
    }

    async fn states(&self, folder: String) -> Result<String, Error> {
        let hub = self.hub.clone();
        let states = tokio::task::spawn_blocking(move || drives::states(&hub, Path::new(&folder)))
            .await
            .map_err(|error| Error::Failed(error.to_string()))??;
        Ok(json(&states))
    }

    async fn keep(&self, paths_to_keep: Vec<String>) -> Result<(), Error> {
        Ok(drives::keep(&self.hub, paths(paths_to_keep)).await?)
    }

    async fn free(&self, paths_to_free: Vec<String>) -> Result<(), Error> {
        Ok(drives::free(&self.hub, paths(paths_to_free)).await?)
    }

    async fn share_link(&self, path: String) -> Result<String, Error> {
        Ok(drives::share_link(&self.hub, Path::new(&path)).await?)
    }

    async fn web_address(&self, path: String) -> Result<String, Error> {
        Ok(drives::web_address(&self.hub, Path::new(&path)).await?)
    }

    async fn dismiss_conflict(&self, account: String, copy: String) -> Result<(), Error> {
        self.hub.records().edit(&account, |record| {
            record.conflicts.retain(|conflict| conflict.copy != copy)
        })?;
        self.hub.drives_changed().await;
        Ok(())
    }
}
