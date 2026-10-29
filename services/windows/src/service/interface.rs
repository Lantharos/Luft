use std::path::Path;
use std::process::Command;
use std::sync::Arc;

use anyhow::{Context, bail};
use luft_dbus::idle::Idle;
use luft_dbus_macros::introspect;
use luft_windows::bluetooth::bluez;
use luft_windows::change::{self, Change};
use serde::Serialize;
use zbus::message::Header;
use zbus::{Connection, interface};

use super::error::Error;
use crate::boot::RECORD;
use crate::installations::{self, Found};

const STATUS: &str = "com.lantharos.windows.status";
const CHANGE: &str = "com.lantharos.windows.change";
const BLUETOOTH: &str = "com.lantharos.windows.bluetooth";

pub struct Windows {
    idle: Arc<Idle>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Status {
    after_hibernation: bool,
    installations: Vec<Found>,
}

impl Windows {
    pub fn new(idle: Arc<Idle>) -> Self {
        Self { idle }
    }

    async fn authorize(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        action: &str,
    ) -> Result<(), Error> {
        if luft_dbus::polkit::is_authorized(connection, header, action).await? {
            Ok(())
        } else {
            Err(Error::not_authorized())
        }
    }

    async fn blocking<T: Send + 'static>(
        &self,
        work: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        let _activity = self.idle.hold();
        tokio::task::spawn_blocking(work)
            .await
            .map_err(|_| Error::Failed("Looking at Windows stopped unexpectedly.".to_owned()))?
            .map_err(Error::from)
    }
}

fn change_windows(device: String, changes: Vec<Change>) -> anyhow::Result<()> {
    let found = installations::survey()?
        .into_iter()
        .find(|found| found.device == device)
        .context("That Windows isn't there anymore")?;
    found.changeable()?;
    change::apply(Path::new(&device), &changes)?;
    Ok(())
}

fn import_bluetooth() -> anyhow::Result<u32> {
    let pairings: Vec<_> = installations::survey()?
        .into_iter()
        .flat_map(|found| found.bluetooth)
        .collect();
    let imported = bluez::import(Path::new(bluez::STORAGE), &pairings)?;
    if imported > 0 {
        let status = Command::new("systemctl")
            .args(["try-restart", "bluetooth.service"])
            .status()?;
        if !status.success() {
            bail!("Bluetooth couldn't be restarted");
        }
    }
    Ok(imported as u32)
}

#[introspect]
#[interface(name = "com.lantharos.Windows1")]
impl Windows {
    async fn status(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, STATUS).await?;
        self.blocking(|| {
            Ok(serde_json::to_string(&Status {
                after_hibernation: Path::new(RECORD).exists(),
                installations: installations::survey()?,
            })?)
        })
        .await
    }

    async fn drives(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<String, Error> {
        self.authorize(connection, &header, STATUS).await?;
        self.blocking(|| Ok(serde_json::to_string(&installations::drives())?))
            .await
    }

    async fn change(
        &self,
        device: String,
        changes: Vec<String>,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<(), Error> {
        self.authorize(connection, &header, CHANGE).await?;
        let changes = changes
            .iter()
            .map(|change| serde_json::from_value(serde_json::Value::String(change.clone())))
            .collect::<Result<Vec<Change>, _>>()
            .map_err(|_| Error::Failed("Luft doesn't know that change.".to_owned()))?;
        self.blocking(move || change_windows(device, changes)).await
    }

    async fn import_bluetooth(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<u32, Error> {
        self.authorize(connection, &header, BLUETOOTH).await?;
        self.blocking(import_bluetooth).await
    }
}
