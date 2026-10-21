use std::collections::HashMap;
use std::path::PathBuf;

use anyhow::{Context, Result};
use futures_util::StreamExt;
use serde::Deserialize;
use zbus::Variant;
use zbus::proxy::MethodFlags;
use zbus::{Connection, Proxy};

use crate::service::{NAME, PATH};

const NOTIFICATIONS: &str = "org.freedesktop.Notifications";
const NOTIFICATIONS_PATH: &str = "/org/freedesktop/Notifications";
const TURN_OFF: &str = "turn-off";
const ICON: &str = "computer";
const SHOWN: &str = "luft/windows-notice";
const CHECKED: &str = "luft/windows-checked";

const OFFER: &str = "Windows doesn't fully shut down with it, which can leave sound, Wi-Fi and Bluetooth in a bad state when Luft starts, and keeps Windows' drive locked. Luft can turn it off for you.";
const HOW_TO: &str = "Windows wasn't fully off, so Luft reset the sound hardware. To avoid this, turn off Fast Startup in Windows: open Control Panel, Power Options, Choose what the power buttons do, and clear Turn on fast startup.";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Status {
    after_hibernation: bool,
    installations: Vec<Installation>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Installation {
    device: String,
    hibernated: bool,
    mounted: bool,
    fast_startup: bool,
}

fn state(name: &str) -> Result<PathBuf> {
    let base = std::env::var_os("XDG_STATE_HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|home| PathBuf::from(home).join(".local/state")))
        .context("There's no home folder")?;
    Ok(base.join(name))
}

fn remember(name: &str) -> Result<()> {
    let path = state(name)?;
    std::fs::create_dir_all(path.parent().expect("state lives in a folder"))?;
    std::fs::write(path, "")?;
    Ok(())
}

pub fn run() -> Result<()> {
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()?
        .block_on(notice())
}

async fn notice() -> Result<()> {
    let system = Connection::system().await?;
    let reply = system
        .call_method(Some(NAME), PATH, Some(NAME), "Status", &())
        .await?;
    let status: Status = serde_json::from_str(&reply.body().deserialize::<String>()?)?;
    let offer = status
        .installations
        .iter()
        .find(|windows| windows.fast_startup && !windows.hibernated && !windows.mounted);
    let fast_started = status.after_hibernation
        || status
            .installations
            .iter()
            .any(|windows| windows.hibernated);
    let Some(body) = offer.map(|_| OFFER).or(fast_started.then_some(HOW_TO)) else {
        return remember(CHECKED);
    };
    remember(SHOWN)?;

    let session = Connection::session().await?;
    let notifications =
        Proxy::new(&session, NOTIFICATIONS, NOTIFICATIONS_PATH, NOTIFICATIONS).await?;
    let mut invoked = notifications.receive_signal("ActionInvoked").await?;
    let mut closed = notifications.receive_signal("NotificationClosed").await?;
    let actions: Vec<&str> = match offer {
        Some(_) => vec![TURN_OFF, "Turn off Fast Startup"],
        None => Vec::new(),
    };
    let summary = if offer.is_some() {
        "Windows uses Fast Startup"
    } else {
        "Windows was shut down with Fast Startup"
    };
    let id: u32 = notifications
        .call(
            "Notify",
            &(
                "Luft",
                0u32,
                ICON,
                summary,
                body,
                actions,
                HashMap::<&str, Variant>::new(),
                0i32,
            ),
        )
        .await?;
    let Some(windows) = offer else {
        return Ok(());
    };
    loop {
        tokio::select! {
            Some(message) = invoked.next() => {
                let (notification, action): (u32, String) = message.body().deserialize()?;
                if notification == id && action == TURN_OFF {
                    let outcome = turn_off(&system, &windows.device).await;
                    let (summary, body) = match &outcome {
                        Ok(()) => ("Fast Startup is off", "Windows will shut down fully from now on."),
                        Err(error) => ("Fast Startup is still on", error.as_str()),
                    };
                    notifications
                        .call::<_, _, u32>(
                            "Notify",
                            &("Luft", 0u32, ICON, summary, body, Vec::<&str>::new(), HashMap::<&str, Variant>::new(), -1i32),
                        )
                        .await?;
                    return Ok(());
                }
            }
            Some(message) = closed.next() => {
                let (notification, _reason): (u32, u32) = message.body().deserialize()?;
                if notification == id {
                    return Ok(());
                }
            }
            else => return Ok(()),
        }
    }
}

async fn turn_off(system: &Connection, device: &str) -> Result<(), String> {
    let windows = Proxy::new(system, NAME, PATH, NAME)
        .await
        .map_err(|error| error.to_string())?;
    windows
        .call_with_flags::<_, _, ()>(
            "Change",
            MethodFlags::ALLOW_INTERACTIVE_AUTH,
            &(device, vec!["fastStartupOff"]),
        )
        .await
        .map(drop)
        .map_err(|error| match error {
            zbus::Error::MethodError(_, Some(text), _) => text,
            other => other.to_string(),
        })
}
