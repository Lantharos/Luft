mod actions;
pub mod airplane;
mod certificate;
mod profile;
mod saved;
mod snapshot;
mod vpn;
mod watch;

use luft_app::dbus;
use luft_app::dbus::objects::Objects;
use luft_app::{Commands, Empty, Events};
use sabine::SabineWindow;
use serde::Deserialize;

use snapshot::Network;
use specta::Type;

const SERVICE: &str = "org.freedesktop.NetworkManager";
const MANAGER_PATH: &str = "/org/freedesktop/NetworkManager";
const SETTINGS_PATH: &str = "/org/freedesktop/NetworkManager/Settings";
const MANAGER: &str = "org.freedesktop.NetworkManager";
const SETTINGS: &str = "org.freedesktop.NetworkManager.Settings";
const CONNECTION: &str = "org.freedesktop.NetworkManager.Settings.Connection";
const DEVICE: &str = "org.freedesktop.NetworkManager.Device";
const WIRED: &str = "org.freedesktop.NetworkManager.Device.Wired";
const WIRELESS: &str = "org.freedesktop.NetworkManager.Device.Wireless";
const ACCESS_POINT: &str = "org.freedesktop.NetworkManager.AccessPoint";
const ACTIVE: &str = "org.freedesktop.NetworkManager.Connection.Active";

#[derive(Deserialize, Type)]
struct Toggle {
    enabled: bool,
}

#[derive(Deserialize, Type)]
struct Device {
    device: String,
}

#[derive(Deserialize, Type)]
struct Active {
    active: String,
}

#[derive(Deserialize, Type)]
struct Ssid {
    ssid: String,
}

#[derive(Deserialize, Type)]
struct Connection {
    path: String,
}

#[derive(Deserialize, Type)]
struct PrivateKey {
    key: String,
}

#[derive(Deserialize, Type)]
struct Choose {
    purpose: certificate::Purpose,
}

async fn objects() -> Result<Objects, String> {
    Objects::fetch(dbus::system().await?, SERVICE, "/org/freedesktop").await
}

async fn network() -> Result<Network, String> {
    let objects = objects().await?;
    watch::remember(&objects);
    Ok(snapshot::build(&objects).await)
}

async fn open(events: Events, Empty {}: Empty) -> Result<Network, String> {
    watch::open(&events);
    let network = network().await?;
    if let Some(wifi) = &network.wifi {
        actions::scan(&wifi.device).await;
    }
    Ok(network)
}

pub async fn store_secrets_system_wide() -> Result<(), String> {
    for saved in saved::all(&objects().await?).await {
        if matches!(saved.kind, saved::Kind::Wifi { .. })
            && let Err(error) = profile::store_secret_system_wide(&saved.path).await
        {
            eprintln!("{}'s password stays with this account: {error}", saved.name);
        }
    }
    Ok(())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&watch::CHANGED)
        .bridge_event(&watch::FAILED)
        .with_async("network_open", events, open)
        .command("network_close", |Empty {}| {
            watch::close();
            Ok(())
        })
        .command_async("network_set_wifi", |Toggle { enabled }| {
            actions::set_wifi(enabled)
        })
        .command_async("network_set_airplane", |Toggle { enabled }| {
            airplane::set(enabled)
        })
        .command_async("network_activate", actions::activate)
        .command_async("network_deactivate", |Active { active }| async move {
            actions::deactivate(&active).await
        })
        .command_async("network_disconnect", |Device { device }| async move {
            actions::disconnect(&device).await
        })
        .command_async("network_join", actions::join)
        .command_async("network_forget", |Ssid { ssid }| async move {
            actions::forget(&ssid, &objects().await?).await
        })
        .command_async("network_remove", |Connection { path }| async move {
            saved::delete(&path).await
        })
        .command_async("network_vpn_import", |Empty {}| vpn::import())
        .command("network_wireguard_keys", |Empty {}| {
            vpn::wireguard::generate()
        })
        .command("network_wireguard_public_key", |PrivateKey { key }| {
            vpn::wireguard::public_key(&key)
        })
        .command_async("network_wireguard_add", vpn::wireguard::add)
        .command_async("network_profile", |Connection { path }| async move {
            profile::load(&path).await
        })
        .command_async("network_profile_save", profile::save)
        .command_async("network_profile_secret", |Connection { path }| async move {
            profile::secret(&path).await
        })
        .command_async("network_choose_certificate", |Choose { purpose }| {
            certificate::choose(purpose)
        })
}
