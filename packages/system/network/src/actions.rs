use std::collections::HashMap;

use luft_app::dbus::objects::Objects;
use luft_app::dbus::{self, failed};
use serde::Deserialize;
use specta::Type;
use zbus::{ObjectPath, OwnedObjectPath, Proxy, Variant};

use super::profile::enterprise::Enterprise;
use super::profile::settings::{Group, Settings, put};
use super::profile::wireless::{self, Wireless};
use super::profile::{Security, WIFI};
use super::saved::{self, Kind};
use super::{DEVICE, MANAGER, MANAGER_PATH, SERVICE, WIRELESS, watch};

const ANY: &str = "/";

#[derive(Deserialize, Type)]
pub struct Join {
    device: String,
    ssid: String,
    security: Security,
    #[serde(default)]
    password: String,
    #[serde(default)]
    hidden: bool,
    enterprise: Option<Enterprise>,
}

#[derive(Deserialize, Type)]
pub struct Activate {
    pub connection: Option<String>,
    pub device: Option<String>,
}

async fn proxy<'a>(path: &'a str, interface: &'a str) -> Result<Proxy<'a>, String> {
    Proxy::new(dbus::system().await?, SERVICE, path, interface)
        .await
        .map_err(failed)
}

fn object(path: &str) -> Result<ObjectPath<'_>, String> {
    ObjectPath::try_from(path).map_err(failed)
}

async fn manager() -> Result<Proxy<'static>, String> {
    proxy(MANAGER_PATH, MANAGER).await
}

pub async fn scan(device: &str) {
    if let Ok(wireless) = proxy(device, WIRELESS).await {
        let options: HashMap<&str, Variant> = HashMap::new();
        let _ = wireless.call_method("RequestScan", &(options,)).await;
    }
}

pub async fn set_wifi(enabled: bool) -> Result<(), String> {
    manager()
        .await?
        .set_property("WirelessEnabled", enabled)
        .await
        .map_err(failed)
}

pub async fn activate(Activate { connection, device }: Activate) -> Result<(), String> {
    let connection = connection.unwrap_or_else(|| ANY.to_owned());
    let device = device.unwrap_or_else(|| ANY.to_owned());
    let _: OwnedObjectPath = manager()
        .await?
        .call(
            "ActivateConnection",
            &(object(&connection)?, object(&device)?, object(ANY)?),
        )
        .await
        .map_err(failed)?;
    Ok(())
}

pub async fn deactivate(active: &str) -> Result<(), String> {
    manager()
        .await?
        .call_method("DeactivateConnection", &(object(active)?,))
        .await
        .map(drop)
        .map_err(failed)
}

pub async fn disconnect(device: &str) -> Result<(), String> {
    proxy(device, DEVICE)
        .await?
        .call_method("Disconnect", &())
        .await
        .map(drop)
        .map_err(failed)
}

pub async fn join(join: Join) -> Result<(), String> {
    let mut wifi = Group::new();
    put(&mut wifi, "ssid", join.ssid.into_bytes());
    if join.hidden {
        put(&mut wifi, "hidden", true);
    }
    let mut general = Group::new();
    put(&mut general, "type", WIFI);
    let mut settings =
        Settings::from([("connection".to_owned(), general), (WIFI.to_owned(), wifi)]);
    let wireless = Wireless {
        security: join.security,
        enterprise: join.enterprise,
    };
    let password = Some(join.password.as_str()).filter(|password| !password.is_empty());
    wireless::store(&mut settings, &wireless, password);
    let (connection, _active): (OwnedObjectPath, OwnedObjectPath) = manager()
        .await?
        .call(
            "AddAndActivateConnection",
            &(settings, object(&join.device)?, object(ANY)?),
        )
        .await
        .map_err(failed)?;
    watch::expect(join.device, connection.to_string());
    Ok(())
}

pub async fn forget(ssid: &str, objects: &Objects) -> Result<(), String> {
    for saved in saved::all(objects).await {
        if matches!(&saved.kind, Kind::Wifi { ssid: known } if known == ssid.as_bytes()) {
            saved::delete(&saved.path).await?;
        }
    }
    Ok(())
}
