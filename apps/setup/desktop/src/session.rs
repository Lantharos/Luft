use gio::prelude::*;
use luft_app::Commands;
use luft_app::dbus::{self, failed};
use luft_app::launch::{self, Token};
use luft_i18n::t;
use sabine::SabineWindow;
use serde_json::Value;
use zbus::Connection;
use zbus::fdo::DBusProxy;
use zbus::names::WellKnownName;

use crate::L10N;

const SETUP: &str = "com.lantharos.Kestrel.Setup";
const SETUP_PATH: &str = "/com/lantharos/Kestrel/Setup";
const LOGIN: &str = "org.freedesktop.login1";
const LOGIN_PATH: &str = "/org/freedesktop/login1";
const LOGIN_MANAGER: &str = "org.freedesktop.login1.Manager";
const DISKS: &str = "com.lantharos.disks.desktop";

async fn in_setup(session: &Connection) -> bool {
    let Ok(proxy) = DBusProxy::new(session).await else {
        return false;
    };
    proxy
        .name_has_owner(WellKnownName::from_static_str_unchecked(SETUP).into())
        .await
        .unwrap_or(false)
}

async fn finish(_: Value) -> Result<bool, String> {
    let session = dbus::session().await?;
    if !in_setup(session).await {
        return Ok(false);
    }
    session
        .call_method(Some(SETUP), SETUP_PATH, Some(SETUP), "Finish", &())
        .await
        .map_err(failed)?;
    Ok(true)
}

async fn restart(_: Value) -> Result<(), String> {
    dbus::system()
        .await?
        .call_method(
            Some(LOGIN),
            LOGIN_PATH,
            Some(LOGIN_MANAGER),
            "Reboot",
            &(true,),
        )
        .await
        .map(drop)
        .map_err(failed)
}

fn open_disks(Token { token }: Token) -> Result<(), String> {
    let app =
        gio_unix::DesktopAppInfo::new(DISKS).ok_or_else(|| t!(L10N, "desktop-disks-missing"))?;
    launch::start(app.upcast_ref(), &[], token.as_deref()).map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command_async("session_finish", finish)
        .command_async("session_restart", restart)
        .command("session_open_disks", open_disks)
}
