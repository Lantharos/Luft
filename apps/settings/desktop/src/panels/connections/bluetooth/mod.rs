mod actions;
mod agent;
pub mod rfkill;
mod snapshot;
mod watch;
mod windows;

use luft_app::dbus;
use luft_app::dbus::objects::Objects;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;
use zbus::fdo::DBusProxy;
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

async fn bluetooth() -> Result<Bluetooth, String> {
    Ok(snapshot::build(
        &Objects::fetch(dbus::system().await?, SERVICE, "/").await?,
    ))
}

async fn running(connection: &zbus::Connection) -> Option<bool> {
    let bus = DBusProxy::new(connection).await.ok()?;
    bus.name_has_owner(BusName::from_static_str(SERVICE).ok()?)
        .await
        .ok()
}

pub async fn present() -> bool {
    if rfkill::hard_blocked() {
        return true;
    }
    let Ok(connection) = dbus::system().await else {
        return false;
    };
    running(connection).await.unwrap_or(false)
        && Objects::fetch(connection, SERVICE, "/")
            .await
            .is_ok_and(|objects| objects.implementing(ADAPTER).next().is_some())
}

async fn adapter() -> Result<Adapter, String> {
    bluetooth()
        .await?
        .adapter
        .ok_or_else(|| "There is no Bluetooth adapter".to_owned())
}

async fn open(events: Events, _: Value) -> Result<Bluetooth, String> {
    watch::open(&events);
    if let Err(error) = agent::register(&events).await {
        eprintln!("bluetooth: {error}");
    }
    let bluetooth = bluetooth().await?;
    if let Some(adapter) = &bluetooth.adapter {
        actions::browse(adapter).await;
    }
    Ok(bluetooth)
}

async fn close(events: Events, _: Value) -> Result<(), String> {
    watch::close();
    agent::unregister(&events).await;
    if let Some(adapter) = bluetooth().await?.adapter {
        actions::stop_browsing(&adapter).await;
    }
    Ok(())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("bluetooth_open", events, open)
        .with_async("bluetooth_close", events, close)
        .command_async("bluetooth_set_powered", |Toggle { enabled }| async move {
            actions::set_powered(&adapter().await?, enabled).await
        })
        .command_async("bluetooth_connect", |Device { device }| async move {
            actions::connect(&device).await
        })
        .command_async("bluetooth_disconnect", |Device { device }| async move {
            actions::disconnect(&device).await
        })
        .command_async("bluetooth_pair", |Device { device }| async move {
            actions::pair(&device).await
        })
        .command_async("bluetooth_cancel_pairing", |Device { device }| async move {
            actions::cancel_pairing(&device).await
        })
        .command_async("bluetooth_forget", |Device { device }| async move {
            actions::forget(&device).await
        })
        .command_async(
            "bluetooth_set_trusted",
            |Trust { device, trusted }| async move { actions::set_trusted(&device, trusted).await },
        )
        .command_async(
            "bluetooth_set_visible",
            |Visibility { visible, timeout }| async move {
                actions::set_visible(&adapter().await?, visible, timeout).await
            },
        )
        .command_async("bluetooth_windows", |_: Value| windows::waiting())
        .command_async("bluetooth_import_windows", |_: Value| windows::import())
        .command("bluetooth_answer", |Answer { id, value }| {
            agent::answer(id, value);
            Ok(())
        })
}
