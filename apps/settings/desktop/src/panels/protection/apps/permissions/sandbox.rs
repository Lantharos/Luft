use luft_app::identity::permissions::{self, DEVICES, FOLDERS, FULL_ACCESS, YES};
use luft_app::portal::FileChooser;
use luft_app::portal::uri_path;
use serde::Deserialize;
use zbus::Connection;

#[derive(Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Device {
    Usb,
    Serial,
}

impl Device {
    fn name(self) -> &'static str {
        match self {
            Self::Usb => "usb",
            Self::Serial => "serial",
        }
    }
}

pub async fn full_access(connection: &Connection) -> zbus::Result<Vec<String>> {
    Ok(
        permissions::lookup(connection, FULL_ACCESS.table, FULL_ACCESS.id)
            .await?
            .into_iter()
            .filter(|(_, answer)| answer.first().map(String::as_str) == Some(YES))
            .map(|(app, _)| app)
            .collect(),
    )
}

async fn change(
    connection: &Connection,
    permission: &permissions::Permission,
    app: &str,
    edit: impl FnOnce(&mut Vec<String>),
) -> zbus::Result<()> {
    let mut values = permissions::values(connection, permission, app).await;
    edit(&mut values);
    let values: Vec<&str> = values.iter().map(String::as_str).collect();
    permissions::set_values(connection, permission, app, &values).await
}

/// Asks you for a folder and opens it to the app. Returns whether you chose one.
pub async fn add_folder(connection: &Connection, app: &str, title: &str) -> Result<bool, String> {
    let chooser = FileChooser {
        title,
        directory: true,
        ..FileChooser::default()
    };
    let Some(folder) = chooser.open().await?.first().and_then(|uri| uri_path(uri)) else {
        return Ok(false);
    };
    let folder = folder.display().to_string();
    change(connection, &FOLDERS, app, |folders| {
        if !folders.contains(&folder) {
            folders.push(folder);
        }
    })
    .await
    .map_err(|error| error.to_string())?;
    Ok(true)
}

pub async fn remove_folder(connection: &Connection, app: &str, folder: &str) -> zbus::Result<()> {
    change(connection, &FOLDERS, app, |folders| {
        folders.retain(|kept| kept != folder);
    })
    .await
}

pub async fn set_device(
    connection: &Connection,
    app: &str,
    device: Device,
    on: bool,
) -> zbus::Result<()> {
    change(connection, &DEVICES, app, |devices| {
        devices.retain(|kept| kept != device.name());
        if on {
            devices.push(device.name().to_owned());
        }
    })
    .await
}
