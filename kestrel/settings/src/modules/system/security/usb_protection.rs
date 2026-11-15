use futures_util::StreamExt;
use luft_dbus_macros::introspect;
use luft_i18n::t;
use zbus::{Connection, proxy};

use crate::L10N;
use crate::context::Context;
use crate::shared::notify::{self, Notification, NotificationsProxy, Sound, URGENCY_NORMAL};

const SETTINGS_ACTION: &str = "settings";

#[introspect]
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

fn describe(devices: &[(String, String)]) -> (String, String) {
    match devices {
        [(_, name)] => (
            t!(L10N, "usb-unlocked-one-title", name = name.as_str()),
            t!(L10N, "usb-unlocked-one"),
        ),
        _ => (
            t!(L10N, "usb-unlocked-many-title", count = devices.len()),
            t!(L10N, "usb-unlocked-many"),
        ),
    }
}

async fn announce(session: &Connection, devices: &[(String, String)], replaces: u32) -> u32 {
    let (summary, body) = describe(devices);
    let shown = Notification {
        app: "USB Devices",
        icon: "media-removable-symbolic",
        summary: &summary,
        body: &body,
        actions: &[(SETTINGS_ACTION, &t!(L10N, "notification-settings"))],
        urgency: URGENCY_NORMAL,
        transient: true,
        sound: Sound::Usual,
        shows_when_locked: false,
    }
    .show(session, replaces)
    .await;
    shown.unwrap_or_else(|error| {
        eprintln!("Couldn't announce the devices connected while locked: {error}");
        replaces
    })
}
