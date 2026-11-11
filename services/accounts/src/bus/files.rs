use std::path::{Path, PathBuf};
use std::sync::Arc;

use anyhow::Context;
use luft_dbus_macros::introspect;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, interface};

use super::{Error, ROVER, SETTINGS, admit, json};
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

#[introspect]
#[interface(name = "com.lantharos.Accounts1.Files")]
impl Files {
    async fn drives(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        admit(connection, &header, &[SETTINGS, ROVER]).await?;
        Ok(json(&drives::snapshot(&self.hub)))
    }

    async fn states(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        folder: String,
    ) -> Result<String, Error> {
        admit(connection, &header, &[SETTINGS, ROVER]).await?;
        let hub = self.hub.clone();
        let states = tokio::task::spawn_blocking(move || drives::states(&hub, Path::new(&folder)))
            .await
            .context("Looking at that folder stopped unexpectedly.")??;
        Ok(json(&states))
    }

    async fn keep(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        paths_to_keep: Vec<String>,
    ) -> Result<(), Error> {
        admit(connection, &header, &[SETTINGS, ROVER]).await?;
        Ok(drives::keep(&self.hub, paths(paths_to_keep)).await?)
    }

    async fn free(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        paths_to_free: Vec<String>,
    ) -> Result<(), Error> {
        admit(connection, &header, &[SETTINGS, ROVER]).await?;
        Ok(drives::free(&self.hub, paths(paths_to_free)).await?)
    }

    async fn share_link(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        path: String,
    ) -> Result<String, Error> {
        admit(connection, &header, &[SETTINGS, ROVER]).await?;
        Ok(drives::share_link(&self.hub, Path::new(&path)).await?)
    }

    async fn web_address(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        path: String,
    ) -> Result<String, Error> {
        admit(connection, &header, &[SETTINGS, ROVER]).await?;
        Ok(drives::web_address(&self.hub, Path::new(&path)).await?)
    }

    async fn dismiss_conflict(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        account: String,
        copy: String,
    ) -> Result<(), Error> {
        admit(connection, &header, &[SETTINGS, ROVER]).await?;
        self.hub.records().edit(&account, |record| {
            record.conflicts.retain(|conflict| conflict.copy != copy)
        })?;
        self.hub.drives_changed().await;
        Ok(())
    }

    #[zbus(signal)]
    pub async fn drives_changed(emitter: &SignalEmitter<'_>) -> zbus::Result<()>;
}
