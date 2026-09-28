mod actions;
pub mod airplane;
mod saved;
mod snapshot;
mod watch;

use luft_app::dbus;
use luft_app::dbus::objects::Objects;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

use snapshot::Network;

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

#[derive(Deserialize)]
struct Toggle {
    enabled: bool,
}

#[derive(Deserialize)]
struct Device {
    device: String,
}

#[derive(Deserialize)]
struct Active {
    active: String,
}

#[derive(Deserialize)]
struct Ssid {
    ssid: String,
}

fn objects() -> Result<Objects, String> {
    Objects::fetch(dbus::system()?, SERVICE, "/org/freedesktop")
}

fn network() -> Result<Network, String> {
    let objects = objects()?;
    watch::remember(&objects);
    Ok(snapshot::build(&objects))
}

fn open(events: &Events, _: Value) -> Result<Network, String> {
    watch::open(events);
    let network = network()?;
    if let Some(wifi) = &network.wifi {
        actions::scan(&wifi.device);
    }
    Ok(network)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("network_open", events, open)
        .command("network_close", |_: Value| {
            watch::close();
            Ok(())
        })
        .command("network_scan", |Device { device }| {
            actions::scan(&device);
            Ok(())
        })
        .command("network_set_wifi", |Toggle { enabled }| {
            actions::set_wifi(enabled)
        })
        .command("network_set_airplane", |Toggle { enabled }| {
            airplane::set(enabled)
        })
        .command("network_activate", actions::activate)
        .command("network_deactivate", |Active { active }| {
            actions::deactivate(&active)
        })
        .command("network_disconnect", |Device { device }| {
            actions::disconnect(&device)
        })
        .command("network_join", actions::join)
        .command("network_forget", |Ssid { ssid }| {
            actions::forget(&ssid, &objects()?)
        })
}
