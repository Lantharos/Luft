use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

use luft_app::dbus;
use luft_app::dbus::objects::{Objects, failed};
use zbus::blocking::Proxy;
use zbus::proxy::MethodFlags;

use super::profile::settings::{Settings, get};
use super::{CONNECTION, SERVICE, SETTINGS};

#[derive(Clone)]
pub enum Kind {
    Wifi { ssid: Vec<u8> },
    Vpn,
    Other,
}

#[derive(Clone)]
pub struct Saved {
    pub path: String,
    pub name: String,
    pub kind: Kind,
}

static CACHE: LazyLock<Mutex<HashMap<String, Saved>>> = LazyLock::new(Mutex::default);

fn kind(settings: &Settings) -> Kind {
    let kind: String = get(settings, "connection", "type").unwrap_or_default();
    match kind.as_str() {
        "802-11-wireless"
            if get::<String>(settings, "802-11-wireless", "mode").as_deref() != Some("ap") =>
        {
            Kind::Wifi {
                ssid: get(settings, "802-11-wireless", "ssid").unwrap_or_default(),
            }
        }
        "vpn" | "wireguard" => Kind::Vpn,
        _ => Kind::Other,
    }
}

fn load(path: &str) -> Result<Saved, String> {
    let connection = Proxy::new(dbus::system()?, SERVICE, path, CONNECTION).map_err(failed)?;
    let settings: Settings = connection.call("GetSettings", &()).map_err(failed)?;
    Ok(Saved {
        path: path.to_owned(),
        name: get(&settings, "connection", "id").unwrap_or_default(),
        kind: kind(&settings),
    })
}

pub fn all(objects: &Objects) -> Vec<Saved> {
    let paths: Vec<String> = objects
        .get(super::SETTINGS_PATH, SETTINGS)
        .and_then(|settings| settings.get::<Vec<zbus::zvariant::OwnedObjectPath>>("Connections"))
        .unwrap_or_default()
        .into_iter()
        .map(|path| path.to_string())
        .collect();
    let mut cache = CACHE.lock().unwrap();
    cache.retain(|path, _| paths.contains(path));
    paths
        .iter()
        .filter_map(|path| {
            if let Some(saved) = cache.get(path) {
                return Some(saved.clone());
            }
            let saved = load(path).ok()?;
            cache.insert(path.clone(), saved.clone());
            Some(saved)
        })
        .collect()
}

pub fn invalidate(path: &str) {
    CACHE.lock().unwrap().remove(path);
}

pub fn delete(path: &str) -> Result<(), String> {
    Proxy::new(dbus::system()?, SERVICE, path, CONNECTION)
        .map_err(failed)?
        .call_with_flags::<_, _, ()>("Delete", MethodFlags::AllowInteractiveAuth.into(), &())
        .map(|_| ())
        .map_err(failed)
}
