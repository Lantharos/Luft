use std::collections::HashMap;
use std::fs::File;
use std::os::fd::AsFd;

use futures_util::future::join_all;
use luft_app::dbus::{self, failed};
use luft_i18n::t;
use luft_software::http;
use luft_software::task::Task;
use serde::Serialize;
use specta::Type;
use zbus::fdo::DBusProxy;
use zbus::{Fd, OwnedVariant, Proxy, Variant};

use crate::L10N;

const SERVICE: &str = "org.freedesktop.fwupd";
const UPDATABLE: u64 = 1 << 1;
const NEEDS_REBOOT: u64 = 1 << 8;
const NEEDS_SHUTDOWN: u64 = 1 << 17;

type Map = HashMap<String, OwnedVariant>;

#[derive(Serialize, Clone, Type)]
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

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, SERVICE, "/", SERVICE)
        .await
        .map_err(failed)
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

pub async fn available() -> bool {
    let Ok(system) = dbus::system().await else {
        return false;
    };
    let Ok(bus) = DBusProxy::new(system).await else {
        return false;
    };
    bus.list_activatable_names()
        .await
        .is_ok_and(|names| names.iter().any(|name| name.as_str() == SERVICE))
}

async fn upgrade(proxy: &Proxy<'_>, device: &Map) -> Option<Firmware> {
    let id = text(device, "DeviceId")?;
    let releases: Vec<Map> = proxy.call("GetUpgrades", &(id.as_str(),)).await.ok()?;
    let release = releases.into_iter().next()?;
    let flags = number(device, "Flags");
    Some(Firmware {
        name: text(device, "Name").unwrap_or_else(|| t!(L10N, "desktop-updates-firmware-unnamed")),
        vendor: text(device, "Vendor"),
        current: text(device, "Version"),
        version: text(&release, "Version")?,
        summary: text(&release, "Summary"),
        size: number(&release, "Size"),
        restart: flags & (NEEDS_REBOOT | NEEDS_SHUTDOWN) != 0,
        location: location(&release),
        id,
    })
}

pub async fn updates() -> Result<Vec<Firmware>, String> {
    let proxy = proxy().await?;
    let devices: Vec<Map> = proxy.call("GetDevices", &()).await.map_err(failed)?;
    let upgrades = devices
        .iter()
        .filter(|device| number(device, "Flags") & UPDATABLE != 0)
        .map(|device| upgrade(&proxy, device));
    Ok(join_all(upgrades).await.into_iter().flatten().collect())
}

async fn send(id: &str, archive: &File) -> Result<(), String> {
    let options: HashMap<&str, Variant> = HashMap::new();
    proxy()
        .await?
        .call_method("Install", &(id, Fd::from(archive.as_fd()), options))
        .await
        .map(|_| ())
        .map_err(|error| dbus::explain(&error))
}

pub fn install(id: &str, task: Task) -> Result<(), String> {
    let firmware = luft_app::block_on(updates())?
        .into_iter()
        .find(|firmware| firmware.id == id)
        .ok_or_else(|| t!(L10N, "desktop-updates-firmware-current"))?;
    let url = firmware
        .location
        .ok_or_else(|| t!(L10N, "desktop-updates-firmware-no-download"))?;
    let file = dirs::cache_dir()
        .unwrap_or_default()
        .join("com.lantharos.settings")
        .join(format!("{id}.cab"));
    if let Some(folder) = file.parent() {
        std::fs::create_dir_all(folder).map_err(failed)?;
    }
    http::download(&url, &file, task)?;
    let archive = File::open(&file).map_err(failed)?;
    let result = luft_app::block_on(send(id, &archive));
    let _ = std::fs::remove_file(&file);
    result
}
