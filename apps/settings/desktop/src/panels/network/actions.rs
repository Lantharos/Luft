use std::collections::HashMap;

use luft_app::dbus;
use luft_app::dbus::objects::failed;
use serde::Deserialize;
use zbus::blocking::Proxy;
use zbus::zvariant::{ObjectPath, OwnedObjectPath, Value};

use super::profile::enterprise::Enterprise;
use super::profile::settings::{Group, Settings, put};
use super::profile::wireless::{self, Wireless};
use super::profile::{Security, WIFI};
use super::saved::{self, Kind};
use super::{DEVICE, MANAGER, MANAGER_PATH, SERVICE, WIRELESS, watch};

const ANY: &str = "/";

#[derive(Deserialize)]
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

#[derive(Deserialize)]
pub struct Activate {
    pub connection: Option<String>,
    pub device: Option<String>,
}

fn proxy<'a>(path: &'a str, interface: &'a str) -> Result<Proxy<'a>, String> {
    Proxy::new(dbus::system()?, SERVICE, path, interface).map_err(failed)
}

fn object(path: &str) -> Result<ObjectPath<'_>, String> {
    ObjectPath::try_from(path).map_err(failed)
}

fn manager() -> Result<Proxy<'static>, String> {
    proxy(MANAGER_PATH, MANAGER)
}

pub fn scan(device: &str) {
    if let Ok(wireless) = proxy(device, WIRELESS) {
        let options: HashMap<&str, Value> = HashMap::new();
        let _ = wireless.call_method("RequestScan", &(options,));
    }
}

pub fn set_wifi(enabled: bool) -> Result<(), String> {
    manager()?
        .set_property("WirelessEnabled", enabled)
        .map_err(failed)
}

pub fn activate(Activate { connection, device }: Activate) -> Result<(), String> {
    let connection = connection.unwrap_or_else(|| ANY.to_owned());
    let device = device.unwrap_or_else(|| ANY.to_owned());
    let _: OwnedObjectPath = manager()?
        .call(
            "ActivateConnection",
            &(object(&connection)?, object(&device)?, object(ANY)?),
        )
        .map_err(failed)?;
    Ok(())
}

pub fn deactivate(active: &str) -> Result<(), String> {
    manager()?
        .call_method("DeactivateConnection", &(object(active)?,))
        .map(|_| ())
        .map_err(failed)
}

pub fn disconnect(device: &str) -> Result<(), String> {
    proxy(device, DEVICE)?
        .call_method("Disconnect", &())
        .map(|_| ())
        .map_err(failed)
}

pub fn join(join: Join) -> Result<(), String> {
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
    let (connection, _active): (OwnedObjectPath, OwnedObjectPath) = manager()?
        .call(
            "AddAndActivateConnection",
            &(settings, object(&join.device)?, object(ANY)?),
        )
        .map_err(failed)?;
    watch::expect(join.device, connection.to_string());
    Ok(())
}

pub fn forget(ssid: &str, objects: &luft_app::dbus::objects::Objects) -> Result<(), String> {
    saved::all(objects)
        .into_iter()
        .filter(
            |saved| matches!(&saved.kind, Kind::Wifi { ssid: known } if known == ssid.as_bytes()),
        )
        .try_for_each(|saved| saved::delete(&saved.path))
}
