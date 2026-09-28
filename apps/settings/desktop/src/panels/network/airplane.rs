use std::sync::OnceLock;
use std::sync::mpsc::Sender;

use serde::Serialize;
use zbus::blocking::Proxy;

use crate::dbus;
use crate::dbus::objects::failed;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Airplane {
    enabled: bool,
    hardware: bool,
}

const SERVICE: &str = "org.gnome.SettingsDaemon.Rfkill";
const PATH: &str = "/org/gnome/SettingsDaemon/Rfkill";

static RFKILL: OnceLock<Proxy<'static>> = OnceLock::new();

pub fn rfkill() -> Result<&'static Proxy<'static>, String> {
    if let Some(proxy) = RFKILL.get() {
        return Ok(proxy);
    }
    let proxy = Proxy::new(dbus::session()?, SERVICE, PATH, SERVICE).map_err(failed)?;
    Ok(RFKILL.get_or_init(|| proxy))
}

pub fn state() -> Option<Airplane> {
    let rfkill = rfkill().ok()?;
    let flag = |name: &str| rfkill.get_property::<bool>(name).ok();
    if !flag("ShouldShowAirplaneMode")? {
        return None;
    }
    Some(Airplane {
        enabled: flag("AirplaneMode")?,
        hardware: flag("HardwareAirplaneMode").unwrap_or(false),
    })
}

pub fn set(enabled: bool) -> Result<(), String> {
    rfkill()?
        .set_property("AirplaneMode", enabled)
        .map_err(failed)
}

pub fn watch(changes: Sender<()>) {
    std::thread::spawn(move || {
        let Ok(connection) = dbus::session() else {
            return;
        };
        let Ok(properties) =
            Proxy::new(connection, SERVICE, PATH, "org.freedesktop.DBus.Properties")
        else {
            return;
        };
        let Ok(signals) = properties.receive_signal("PropertiesChanged") else {
            return;
        };
        for _ in signals {
            if changes.send(()).is_err() {
                return;
            }
        }
    });
}
