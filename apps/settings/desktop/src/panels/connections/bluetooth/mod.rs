mod actions;
mod agent;
pub mod rfkill;
mod snapshot;
mod watch;

use luft_app::dbus;
use luft_app::dbus::objects::Objects;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;
use zbus::names::BusName;

use super::network;
use snapshot::{Adapter, Bluetooth};

const SERVICE: &str = "org.bluez";
const ADAPTER: &str = "org.bluez.Adapter1";
const DEVICE: &str = "org.bluez.Device1";
const BATTERY: &str = "org.bluez.Battery1";

#[derive(Deserialize)]
struct Toggle {
    enabled: bool,
}

#[derive(Deserialize)]
struct Device {
    device: String,
}

#[derive(Deserialize)]
struct Trust {
    device: String,
    trusted: bool,
}

#[derive(Deserialize)]
struct Visibility {
    visible: bool,
    timeout: u32,
}

#[derive(Deserialize)]
struct Answer {
    id: u32,
    value: Option<String>,
}

fn bluetooth() -> Result<Bluetooth, String> {
    Ok(snapshot::build(&Objects::fetch(
        dbus::system()?,
        SERVICE,
        "/",
    )?))
}

pub fn present() -> bool {
    if rfkill::hard_blocked() {
        return true;
    }
    let Ok(connection) = dbus::system() else {
        return false;
    };
    let running = zbus::blocking::fdo::DBusProxy::new(connection)
        .ok()
        .and_then(|bus| {
            bus.name_has_owner(BusName::from_static_str(SERVICE).ok()?)
                .ok()
        })
        .unwrap_or(false);
    running
        && Objects::fetch(connection, SERVICE, "/")
            .is_ok_and(|objects| objects.implementing(ADAPTER).next().is_some())
}

fn adapter() -> Result<Adapter, String> {
    bluetooth()?
        .adapter
        .ok_or_else(|| "There is no Bluetooth adapter".to_owned())
}

fn open(events: &Events, _: Value) -> Result<Bluetooth, String> {
    watch::open(events);
    if let Err(error) = agent::register(events) {
        eprintln!("bluetooth: {error}");
    }
    let bluetooth = bluetooth()?;
    if let Some(adapter) = &bluetooth.adapter {
        actions::browse(adapter);
    }
    Ok(bluetooth)
}

fn close(events: &Events, _: Value) -> Result<(), String> {
    watch::close();
    agent::unregister(events);
    if let Some(adapter) = bluetooth()?.adapter {
        actions::stop_browsing(&adapter);
    }
    Ok(())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("bluetooth_open", events, open)
        .with("bluetooth_close", events, close)
        .command("bluetooth_set_powered", |Toggle { enabled }| {
            actions::set_powered(&adapter()?, enabled)
        })
        .command("bluetooth_connect", |Device { device }| {
            actions::connect(&device)
        })
        .command("bluetooth_disconnect", |Device { device }| {
            actions::disconnect(&device)
        })
        .command("bluetooth_pair", |Device { device }| actions::pair(&device))
        .command("bluetooth_cancel_pairing", |Device { device }| {
            actions::cancel_pairing(&device)
        })
        .command("bluetooth_forget", |Device { device }| {
            actions::forget(&device)
        })
        .command("bluetooth_set_trusted", |Trust { device, trusted }| {
            actions::set_trusted(&device, trusted)
        })
        .command(
            "bluetooth_set_visible",
            |Visibility { visible, timeout }| actions::set_visible(&adapter()?, visible, timeout),
        )
        .command("bluetooth_answer", |Answer { id, value }| {
            agent::answer(id, value);
            Ok(())
        })
}
