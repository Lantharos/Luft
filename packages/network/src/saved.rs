use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

use futures_util::future::join_all;
use luft_app::dbus::objects::Objects;
use luft_app::dbus::{self, failed};
use zbus::proxy::MethodFlags;
use zbus::{OwnedObjectPath, Proxy};

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

async fn connection(path: &str) -> Result<Proxy<'_>, String> {
    Proxy::new(dbus::system().await?, SERVICE, path, CONNECTION)
        .await
        .map_err(failed)
}

async fn load(path: String) -> Result<Saved, String> {
    let settings: Settings = connection(&path)
        .await?
        .call("GetSettings", &())
        .await
        .map_err(failed)?;
    Ok(Saved {
        name: get(&settings, "connection", "id").unwrap_or_default(),
        kind: kind(&settings),
        path,
    })
}

pub async fn all(objects: &Objects) -> Vec<Saved> {
    let paths: Vec<String> = objects
        .get(super::SETTINGS_PATH, SETTINGS)
        .and_then(|settings| settings.get::<Vec<OwnedObjectPath>>("Connections"))
        .unwrap_or_default()
        .into_iter()
        .map(|path| path.to_string())
        .collect();
    let missing: Vec<String> = {
        let mut cache = CACHE.lock().unwrap();
        cache.retain(|path, _| paths.contains(path));
        paths
            .iter()
            .filter(|path| !cache.contains_key(*path))
            .cloned()
            .collect()
    };
    let loaded = join_all(missing.into_iter().map(load)).await;
    let mut cache = CACHE.lock().unwrap();
    for saved in loaded.into_iter().flatten() {
        cache.insert(saved.path.clone(), saved);
    }
    paths
        .iter()
        .filter_map(|path| cache.get(path).cloned())
        .collect()
}

pub fn invalidate(path: &str) {
    CACHE.lock().unwrap().remove(path);
}

pub async fn delete(path: &str) -> Result<(), String> {
    connection(path)
        .await?
        .call_with_flags::<_, _, ()>("Delete", MethodFlags::ALLOW_INTERACTIVE_AUTH, &())
        .await
        .map(drop)
        .map_err(failed)
}
