use std::collections::HashMap;

use serde::Deserialize;
use zbus::blocking::Proxy;
use zbus::zvariant::{ObjectPath, OwnedObjectPath, Value};

use super::objects::failed;
use super::saved::{self, Kind};
use super::{DEVICE, MANAGER, MANAGER_PATH, SERVICE, WIRELESS, watch};
use crate::dbus;

const ANY: &str = "/";
const WEP_KEY: u32 = 1;

#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Security {
    Open,
    Owe,
    Wep,
    Psk,
    Sae,
}

#[derive(Deserialize)]
pub struct Join {
    device: String,
    ssid: String,
    security: Security,
    #[serde(default)]
    password: String,
    #[serde(default)]
    hidden: bool,
}

#[derive(Deserialize)]
pub struct Activate {
    connection: Option<String>,
    device: Option<String>,
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

fn security_settings(
    security: Security,
    password: &str,
) -> Option<HashMap<&'static str, Value<'_>>> {
    let settings = match security {
        Security::Open => return None,
        Security::Owe => HashMap::from([("key-mgmt", Value::from("owe"))]),
        Security::Psk => HashMap::from([
            ("key-mgmt", Value::from("wpa-psk")),
            ("psk", Value::from(password)),
        ]),
        Security::Sae => HashMap::from([
            ("key-mgmt", Value::from("sae")),
            ("psk", Value::from(password)),
        ]),
        Security::Wep => HashMap::from([
            ("key-mgmt", Value::from("none")),
            ("wep-key0", Value::from(password)),
            ("wep-key-type", Value::from(WEP_KEY)),
        ]),
    };
    Some(settings)
}

pub fn join(join: Join) -> Result<(), String> {
    let mut wireless = HashMap::from([("ssid", Value::from(join.ssid.as_bytes()))]);
    if join.hidden {
        wireless.insert("hidden", Value::from(true));
    }
    let mut settings = HashMap::from([
        (
            "connection",
            HashMap::from([("type", Value::from("802-11-wireless"))]),
        ),
        ("802-11-wireless", wireless),
    ]);
    if let Some(security) = security_settings(join.security, &join.password) {
        settings.insert("802-11-wireless-security", security);
    }
    let (connection, _active): (OwnedObjectPath, OwnedObjectPath) = manager()?
        .call(
            "AddAndActivateConnection",
            &(settings, object(&join.device)?, object(ANY)?),
        )
        .map_err(failed)?;
    watch::expect(join.device, connection.to_string());
    Ok(())
}

pub fn forget(ssid: &str, objects: &super::objects::Objects) -> Result<(), String> {
    saved::all(objects)
        .into_iter()
        .filter(
            |saved| matches!(&saved.kind, Kind::Wifi { ssid: known } if known == ssid.as_bytes()),
        )
        .try_for_each(|saved| saved::delete(&saved.path))
}
