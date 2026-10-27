mod hsi;
use luft_app::dbus::service as properties;
mod recovery;
mod trust;
mod usb;

use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};

use luft_trust::TRUST;
use properties::Service;
use specta::Type;
use trust::Trust;
use usb::{USB_PROTECTION, UsbProtection};

const TRUST_CHANGED: BridgeEvent<Trust> = BridgeEvent::new("security.trust");
const USB_CHANGED: BridgeEvent<UsbProtection> = BridgeEvent::new("security.usb");

const LOGIN: Service = Service {
    name: "org.freedesktop.login1",
    path: "/org/freedesktop/login1",
    interface: "org.freedesktop.login1.Manager",
};

static WATCH_TRUST: Once = Once::new();
static WATCH_USB: Once = Once::new();

#[derive(Deserialize, Type)]
struct Unlock {
    unlock: String,
}

#[derive(Deserialize, Type)]
struct TpmUnlock {
    unlock: String,
    pin: String,
}

#[derive(Deserialize, Type)]
struct RecoveryKey {
    key: String,
}

#[derive(Deserialize, Type)]
struct UsbEnabled {
    enabled: bool,
}

fn follow<T, F>(service: &'static Service, event: BridgeEvent<T>, events: Events, read: fn() -> F)
where
    T: Serialize + 'static,
    F: Future<Output = Result<Option<T>, String>> + Send + 'static,
{
    luft_app::spawn(async move {
        let Ok(mut changes) = service.changes().await else {
            return;
        };
        while changes.next().await.is_some() {
            if let Ok(Some(state)) = read().await {
                events.emit(event, state);
            }
        }
    });
}

async fn trust(events: Events, Empty {}: Empty) -> Result<Option<Trust>, String> {
    let state = trust::read().await?;
    if state.is_some() {
        WATCH_TRUST.call_once(|| follow(&TRUST, TRUST_CHANGED, events, trust::read));
    }
    Ok(state)
}

async fn usb_protection(events: Events, Empty {}: Empty) -> Result<Option<UsbProtection>, String> {
    let state = usb::read().await?;
    if state.is_some() {
        WATCH_USB.call_once(|| follow(&USB_PROTECTION, USB_CHANGED, events, usb::read));
    }
    Ok(state)
}

async fn restart(Empty {}: Empty) -> Result<(), String> {
    LOGIN
        .change::<_, ()>("Reboot", &true)
        .await
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&TRUST_CHANGED)
        .bridge_event(&USB_CHANGED)
        .with_async("security_trust", events, trust)
        .with_async("security_usb", events, usb_protection)
        .command_async("security_host", |Empty {}| hsi::read())
        .command_async("security_set_usb", |UsbEnabled { enabled }| {
            usb::set_enabled(enabled)
        })
        .command_async(
            "security_set_up_tpm",
            |TpmUnlock { unlock, pin }| async move {
                luft_trust::unlocking::<_, String>(&TRUST, "SetUpTpmUnlock", &(unlock, pin)).await
            },
        )
        .command_async("security_remove_tpm", |Unlock { unlock }| async move {
            luft_trust::unlocking::<_, ()>(&TRUST, "RemoveTpmUnlock", &unlock).await
        })
        .command_async("security_show_key", |Empty {}| {
            luft_trust::call::<_, String>(&TRUST, "ShowRecoveryKey", &())
        })
        .command_async("security_accept_secure_boot", |Empty {}| {
            luft_trust::call::<_, ()>(&TRUST, "AcceptSecureBootChange", &())
        })
        .command_async("security_replace_key", |Unlock { unlock }| async move {
            luft_trust::unlocking::<_, String>(&TRUST, "ReplaceRecoveryKey", &unlock).await
        })
        .command_async("security_enroll_key", |Empty {}| {
            luft_trust::call::<_, String>(&TRUST, "EnrollSigningKey", &())
        })
        .command_async("security_cancel_enrollment", |Empty {}| {
            luft_trust::call::<_, ()>(&TRUST, "CancelSigningKeyEnrollment", &())
        })
        .command_async("security_remove_other_keys", |Empty {}| {
            luft_trust::call::<_, String>(&TRUST, "RemoveOtherKeys", &())
        })
        .command_async("security_keep_other_keys", |Empty {}| {
            luft_trust::call::<_, ()>(&TRUST, "KeepOtherKeys", &())
        })
        .command_async("security_install_startup", |Empty {}| {
            luft_trust::call::<_, ()>(&TRUST, "InstallSignedStartup", &())
        })
        .command_async("security_save_key", |RecoveryKey { key }| async move {
            recovery::save(&key).await
        })
        .command_async("security_print_key", |RecoveryKey { key }| async move {
            recovery::print(&key).await
        })
        .command_async("security_restart", restart)
}
