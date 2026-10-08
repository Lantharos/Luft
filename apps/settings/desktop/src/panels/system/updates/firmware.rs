use std::collections::HashMap;
use std::fs::File;
use std::os::fd::AsFd;

use luft_app::dbus;
use luft_software::http;
use luft_software::task::Task;
use serde::Serialize;
use zbus::blocking::Proxy;
use zbus::zvariant::{Fd, OwnedValue, Value};

const SERVICE: &str = "org.freedesktop.fwupd";
const UPDATABLE: u64 = 1 << 1;
const NEEDS_REBOOT: u64 = 1 << 8;
const NEEDS_SHUTDOWN: u64 = 1 << 17;

type Map = HashMap<String, OwnedValue>;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Firmware {
    pub id: String,
    pub name: String,
    pub vendor: Option<String>,
    pub current: Option<String>,
    pub version: String,
    pub summary: Option<String>,
    pub size: u64,
    pub restart: bool,
    #[serde(skip)]
    location: Option<String>,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system()?, SERVICE, "/", SERVICE).map_err(failed)
}

fn text(map: &Map, key: &str) -> Option<String> {
    map.get(key)
        .and_then(|value| String::try_from(value.clone()).ok())
        .filter(|value| !value.is_empty())
}

fn number(map: &Map, key: &str) -> u64 {
    map.get(key)
        .and_then(|value| u64::try_from(value).ok())
        .unwrap_or(0)
}

fn location(release: &Map) -> Option<String> {
    release
        .get("Locations")
        .and_then(|value| Vec::<String>::try_from(value.clone()).ok())
        .and_then(|locations| {
            locations
                .into_iter()
                .find(|location| location.starts_with("https://"))
        })
        .or_else(|| text(release, "Uri"))
}

pub fn available() -> bool {
    dbus::system()
        .ok()
        .and_then(|connection| zbus::blocking::fdo::DBusProxy::new(connection).ok())
        .and_then(|bus| bus.list_activatable_names().ok())
        .is_some_and(|names| names.iter().any(|name| name.as_str() == SERVICE))
}

pub fn updates() -> Result<Vec<Firmware>, String> {
    let proxy = proxy()?;
    let devices: Vec<Map> = proxy.call("GetDevices", &()).map_err(failed)?;
    Ok(devices
        .iter()
        .filter(|device| number(device, "Flags") & UPDATABLE != 0)
        .filter_map(|device| {
            let id = text(device, "DeviceId")?;
            let releases: Vec<Map> = proxy.call("GetUpgrades", &(id.as_str(),)).ok()?;
            let release = releases.into_iter().next()?;
            let flags = number(device, "Flags");
            Some(Firmware {
                name: text(device, "Name").unwrap_or_else(|| "Device firmware".into()),
                vendor: text(device, "Vendor"),
                current: text(device, "Version"),
                version: text(&release, "Version")?,
                summary: text(&release, "Summary"),
                size: number(&release, "Size"),
                restart: flags & (NEEDS_REBOOT | NEEDS_SHUTDOWN) != 0,
                location: location(&release),
                id,
            })
        })
        .collect())
}

pub fn install(id: &str, task: Task) -> Result<(), String> {
    let firmware = updates()?
        .into_iter()
        .find(|firmware| firmware.id == id)
        .ok_or("This device is already up to date.")?;
    let url = firmware
        .location
        .ok_or("This update can't be downloaded.")?;
    let file = dirs::cache_dir()
        .unwrap_or_default()
        .join("com.lantharos.settings")
        .join(format!("{id}.cab"));
    if let Some(folder) = file.parent() {
        std::fs::create_dir_all(folder).map_err(failed)?;
    }
    http::download(&url, &file, task)?;
    let archive = File::open(&file).map_err(failed)?;
    let options: HashMap<&str, Value> = HashMap::new();
    let result = proxy()?
        .call_method("Install", &(id, Fd::from(archive.as_fd()), options))
        .map(|_| ())
        .map_err(|error| match error {
            zbus::Error::MethodError(_, Some(message), _) => message,
            error => error.to_string(),
        });
    let _ = std::fs::remove_file(&file);
    result
}
