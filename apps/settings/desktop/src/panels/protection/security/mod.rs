mod hsi;
use luft_app::dbus::service as properties;
mod recovery;
mod trust;
mod usb;

use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use luft_trust::TRUST;
use properties::Service;
use trust::Trust;
use usb::{USB_PROTECTION, UsbProtection};

const TRUST_CHANGED: &str = "security.trust";
const USB_CHANGED: &str = "security.usb";

const LOGIN: Service = Service {
    name: "org.freedesktop.login1",
    path: "/org/freedesktop/login1",
    interface: "org.freedesktop.login1.Manager",
};

static WATCH_TRUST: Once = Once::new();
static WATCH_USB: Once = Once::new();

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct TurnOn {
    recovery_key: String,
    pin: String,
    passphrase: String,
}

#[derive(Deserialize)]
struct Unlock {
    unlock: String,
}

#[derive(Deserialize)]
struct TpmUnlock {
    unlock: String,
    pin: String,
}

#[derive(Deserialize)]
struct Key {
    key: String,
}

#[derive(Deserialize)]
struct Enabled {
    enabled: bool,
}

fn follow<T, F>(service: &'static Service, name: &'static str, events: Events, read: fn() -> F)
where
    T: Serialize,
    F: Future<Output = Result<Option<T>, String>> + Send + 'static,
{
    luft_app::spawn(async move {
        let Ok(mut changes) = service.changes().await else {
            return;
        };
        while changes.next().await.is_some() {
            if let Ok(Some(state)) = read().await {
                events.emit(name, state);
            }
        }
    });
}

async fn trust(events: Events, _: Value) -> Result<Option<Trust>, String> {
    let state = trust::read().await?;
    if state.is_some() {
        WATCH_TRUST.call_once(|| follow(&TRUST, TRUST_CHANGED, events, trust::read));
    }
    Ok(state)
}

async fn usb_protection(events: Events, _: Value) -> Result<Option<UsbProtection>, String> {
    let state = usb::read().await?;
    if state.is_some() {
        WATCH_USB.call_once(|| follow(&USB_PROTECTION, USB_CHANGED, events, usb::read));
    }
    Ok(state)
}

async fn restart(_: Value) -> Result<(), String> {
    LOGIN
        .change::<_, ()>("Reboot", &true)
        .await
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("security_trust", events, trust)
        .with_async("security_usb", events, usb_protection)
        .command_async("security_host", |_: Value| hsi::read())
        .command_async("security_set_usb", |Enabled { enabled }| {
            usb::set_enabled(enabled)
        })
        .command_async("security_check_encryption", |_: Value| luft_trust::checks())
        .command_async("security_generate_key", |_: Value| {
            luft_trust::call::<_, String>(&TRUST, "GenerateRecoveryKey", &())
        })
        .command_async(
            "security_turn_on",
            |TurnOn {
                 recovery_key,
                 pin,
                 passphrase,
             }| async move {
                luft_trust::call::<_, ()>(
                    &TRUST,
                    "TurnOnEncryption",
                    &(recovery_key, pin, passphrase),
                )
                .await
            },
        )
        .command_async("security_turn_off", |Unlock { unlock }| async move {
            luft_trust::unlocking::<_, ()>(&TRUST, "TurnOffEncryption", &unlock).await
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
        .command_async("security_show_key", |_: Value| {
            luft_trust::call::<_, String>(&TRUST, "ShowRecoveryKey", &())
        })
        .command_async("security_accept_secure_boot", |_: Value| {
            luft_trust::call::<_, ()>(&TRUST, "AcceptSecureBootChange", &())
        })
        .command_async("security_replace_key", |Unlock { unlock }| async move {
            luft_trust::unlocking::<_, String>(&TRUST, "ReplaceRecoveryKey", &unlock).await
        })
        .command_async("security_enroll_key", |_: Value| {
            luft_trust::call::<_, String>(&TRUST, "EnrollSigningKey", &())
        })
        .command_async("security_cancel_enrollment", |_: Value| {
            luft_trust::call::<_, ()>(&TRUST, "CancelSigningKeyEnrollment", &())
        })
        .command_async("security_remove_other_keys", |_: Value| {
            luft_trust::call::<_, String>(&TRUST, "RemoveOtherKeys", &())
        })
        .command_async("security_keep_other_keys", |_: Value| {
            luft_trust::call::<_, ()>(&TRUST, "KeepOtherKeys", &())
        })
        .command_async("security_install_startup", |_: Value| {
            luft_trust::call::<_, ()>(&TRUST, "InstallSignedStartup", &())
        })
        .command_async("security_save_key", |Key { key }| async move {
            recovery::save(&key).await
        })
        .command_async("security_print_key", |Key { key }| async move {
            recovery::print(&key).await
        })
        .command_async("security_restart", restart)
}
