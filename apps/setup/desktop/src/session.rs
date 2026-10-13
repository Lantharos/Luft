use gio::prelude::*;
use luft_app::Commands;
use luft_app::dbus::{self, service::failed};
use sabine::SabineWindow;
use serde_json::Value;

const SETUP: &str = "com.lantharos.Kestrel.Setup";
const SETUP_PATH: &str = "/com/lantharos/Kestrel/Setup";
const LOGIN: &str = "org.freedesktop.login1";
const LOGIN_PATH: &str = "/org/freedesktop/login1";
const LOGIN_MANAGER: &str = "org.freedesktop.login1.Manager";
const DISKS: &str = "com.lantharos.disks.desktop";

fn in_setup() -> bool {
    dbus::session()
        .ok()
        .and_then(|bus| zbus::blocking::fdo::DBusProxy::new(bus).ok())
        .and_then(|proxy| proxy.name_has_owner(SETUP.try_into().ok()?).ok())
        .unwrap_or(false)
}

fn finish(_: Value) -> Result<bool, String> {
    if !in_setup() {
        return Ok(false);
    }
    dbus::session()?
        .call_method(Some(SETUP), SETUP_PATH, Some(SETUP), "Finish", &())
        .map(drop)
        .map_err(failed)?;
    Ok(true)
}

fn restart(_: Value) -> Result<(), String> {
    dbus::system()?
        .call_method(
            Some(LOGIN),
            LOGIN_PATH,
            Some(LOGIN_MANAGER),
            "Reboot",
            &(true,),
        )
        .map(drop)
        .map_err(failed)
}

fn open_disks(_: Value) -> Result<(), String> {
    let app = gio_unix::DesktopAppInfo::new(DISKS).ok_or("Disks isn't installed")?;
    app.launch(&[], gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("session_finish", finish)
        .command("session_restart", restart)
        .command("session_open_disks", open_disks)
}
