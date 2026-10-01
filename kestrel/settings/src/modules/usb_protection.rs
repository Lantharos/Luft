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
    #[zbus(signal)]
    fn released(&self, devices: Vec<(String, String)>) -> zbus::Result<()>;
}

pub async fn start(context: &Context) -> zbus::Result<()> {
    let mut released = UsbProtectionProxy::new(&context.system)
        .await?
        .receive_released()
        .await?;
    let mut actions = NotificationsProxy::new(&context.session)
        .await?
        .receive_action_invoked()
        .await?;
    let session = context.session.clone();
    tokio::spawn(async move {
        let mut notification = 0;
        loop {
            tokio::select! {
                Some(signal) = released.next() => {
                    if let Ok(args) = signal.args() {
                        notification = announce(&session, &args.devices, notification).await;
                    }
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
