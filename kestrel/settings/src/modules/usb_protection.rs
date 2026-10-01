use futures_util::StreamExt;
use zbus::{Connection, proxy};

use crate::context::Context;
use crate::shared::notify::{self, Notification, NotificationsProxy, URGENCY_NORMAL};

const SETTINGS_ACTION: &str = "settings";

#[proxy(
    interface = "com.lantharos.UsbProtection1",
    default_service = "com.lantharos.UsbProtection1",
    default_path = "/com/lantharos/UsbProtection1"
)]
trait UsbProtection {
    fn take_released(&self) -> zbus::Result<Vec<(String, String)>>;

    #[zbus(signal)]
    fn released(&self, devices: Vec<(String, String)>) -> zbus::Result<()>;
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let protection = UsbProtectionProxy::new(&context.system).await?;
    let mut released = protection.receive_released().await?;
    let mut actions = NotificationsProxy::new(&context.session)
        .await?
        .receive_action_invoked()
        .await?;
    let session = context.session.clone();
    tokio::spawn(async move {
        if let Err(error) = notify::server_ready(&session).await {
            eprintln!("Couldn't wait for the notification server: {error}");
        }
        let mut notification = announce_released(&session, &protection, 0).await;
        loop {
            tokio::select! {
                Some(_) = released.next() => {
                    notification = announce_released(&session, &protection, notification).await;
                }
                Some(action) = actions.next() => {
                    if action.args().is_ok_and(|args| args.id == notification && args.action_key == SETTINGS_ACTION) {
                        notify::open_settings("security");
                    }
                }
            }
        }
    });
    Ok(())
}

async fn announce_released(
    session: &Connection,
    protection: &UsbProtectionProxy<'_>,
    replaces: u32,
) -> u32 {
    match protection.take_released().await {
        Ok(devices) if !devices.is_empty() => announce(session, &devices, replaces).await,
        Ok(_) => replaces,
        Err(error) => {
            eprintln!("Couldn't collect the devices connected while locked: {error}");
            replaces
        }
    }
}

fn describe(devices: &[(String, String)]) -> (String, &'static str) {
    match devices {
        [(_, name)] => (
            format!("{name} is now available"),
            "It was plugged in while the screen was locked.",
        ),
        _ => (
            format!("{} devices are now available", devices.len()),
            "They were plugged in while the screen was locked.",
        ),
    }
}

async fn announce(session: &Connection, devices: &[(String, String)], replaces: u32) -> u32 {
    let (summary, body) = describe(devices);
    let shown = Notification {
        app: "USB Devices",
        icon: "media-removable-symbolic",
        summary: &summary,
        body,
        actions: &[(SETTINGS_ACTION, "Settings")],
        urgency: URGENCY_NORMAL,
        transient: true,
    }
    .show(session, replaces)
    .await;
    shown.unwrap_or_else(|error| {
        eprintln!("Couldn't announce the devices connected while locked: {error}");
        replaces
    })
}
