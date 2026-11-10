use std::path::Path;
use std::process::Command;
use std::sync::Arc;

use anyhow::{Context, bail};
use luft_dbus::idle::Idle;
use luft_dbus::polkit;
use luft_dbus_macros::introspect;
use luft_windows::bluetooth::bluez;
use luft_windows::change::{self, Change};
use serde::Serialize;
use zbus::message::Header;
use zbus::{Connection, interface};

use crate::boot::RECORD;
use crate::installations::{self, Found};

pub const NAME: &str = "com.lantharos.Windows1";
pub const PATH: &str = "/com/lantharos/Windows1";
const STATUS: &str = "com.lantharos.windows.status";
const CHANGE: &str = "com.lantharos.windows.change";
const BLUETOOTH: &str = "com.lantharos.windows.bluetooth";

luft_dbus::errors!("com.lantharos.Windows1.Error" {
    DriveOpen,
    NotShutDown,
    Gone,
    UnknownChange,
});

struct Windows {
    idle: Arc<Idle>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Status {
    after_hibernation: bool,
    installations: Vec<Found>,
}

impl Windows {
    async fn blocking<T: Send + 'static>(
        &self,
        work: impl FnOnce() -> anyhow::Result<T> + Send + 'static,
    ) -> Result<T, Error> {
        let _activity = self.idle.hold();
        Ok(tokio::task::spawn_blocking(work)
            .await
            .context("Looking at Windows stopped unexpectedly.")??)
    }
}

fn changeable(found: &Found) -> Result<(), Error> {
    if found.mounted {
        return Err(Error::DriveOpen(
            "Windows' drive is open. Close it in Rover, then try again.".to_owned(),
        ));
    }
    if found.hibernated {
        return Err(Error::NotShutDown(
            "Windows isn't fully shut down. Start it, hold Shift while you choose Shut down, then try again.".to_owned(),
        ));
    }
    Ok(())
}

fn change_windows(device: String, changes: Vec<Change>) -> anyhow::Result<()> {
    let found = installations::survey()?
        .into_iter()
        .find(|found| found.device == device)
        .ok_or_else(|| Error::Gone("That Windows isn't there anymore.".to_owned()))?;
    changeable(&found)?;
    change::apply(Path::new(&device), &changes)
        .map(drop)
        .context("Windows' settings couldn't be changed.")
}

fn import_bluetooth() -> anyhow::Result<u32> {
    let pairings: Vec<_> = installations::survey()?
        .into_iter()
        .flat_map(|found| found.bluetooth)
        .collect();
    let imported = bluez::import(Path::new(bluez::STORAGE), &pairings)
        .context("The Bluetooth devices couldn't be brought over.")?;
    if imported > 0 {
        let status = Command::new("/usr/bin/systemctl")
            .args(["try-restart", "bluetooth.service"])
            .status()?;
        if !status.success() {
            bail!("Bluetooth couldn't be restarted.");
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
        polkit::authorize(connection, &header, STATUS).await?;
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
        polkit::authorize(connection, &header, STATUS).await?;
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
        polkit::authorize(connection, &header, CHANGE).await?;
        let changes = changes
            .iter()
            .map(|change| serde_json::from_value(serde_json::Value::String(change.clone())))
            .collect::<Result<Vec<Change>, _>>()
            .map_err(|_| Error::UnknownChange("Luft doesn't know that change.".to_owned()))?;
        self.blocking(move || change_windows(device, changes)).await
    }

    async fn import_bluetooth(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
    ) -> Result<u32, Error> {
        polkit::authorize(connection, &header, BLUETOOTH).await?;
        self.blocking(import_bluetooth).await
    }
}

pub fn run() -> anyhow::Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(luft_dbus::idle::serve(NAME, PATH, |idle| Windows { idle }))?;
    Ok(())
}
