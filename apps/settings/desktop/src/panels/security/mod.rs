mod hsi;
mod properties;
mod recovery;
mod sheet;
mod trust;
mod usb;

use std::sync::Once;

use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;

use properties::Service;
use trust::{TRUST, Trust};
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

fn trust(events: &Events, _: Value) -> Result<Option<Trust>, String> {
    let state = trust::read()?;
    if state.is_some() {
        let events = events.clone();
        WATCH_TRUST.call_once(|| {
            TRUST.watch(move || {
                if let Ok(Some(state)) = trust::read() {
                    events.emit(TRUST_CHANGED, state);
                }
            })
        });
    }
    Ok(state)
}

fn usb_protection(events: &Events, _: Value) -> Result<Option<UsbProtection>, String> {
    let state = usb::read()?;
    if state.is_some() {
        let events = events.clone();
        WATCH_USB.call_once(|| {
            USB_PROTECTION.watch(move || {
                if let Ok(Some(state)) = usb::read() {
                    events.emit(USB_CHANGED, state);
                }
            })
        });
    }
    Ok(state)
}

fn restart(_: Value) -> Result<(), String> {
    LOGIN
        .change::<_, ()>("Reboot", &true)
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("security_trust", events, trust)
        .with("security_usb", events, usb_protection)
        .command("security_host", |_: Value| hsi::read())
        .command("security_set_usb", |Enabled { enabled }| {
            usb::set_enabled(enabled)
        })
        .command("security_check_encryption", |_: Value| trust::checks())
        .command("security_generate_key", |_: Value| {
            trust::call::<_, String>("GenerateRecoveryKey", &())
        })
        .command(
            "security_turn_on",
            |TurnOn {
                 recovery_key,
                 pin,
                 passphrase,
             }| {
                trust::call::<_, ()>("TurnOnEncryption", &(recovery_key, pin, passphrase))
            },
        )
        .command("security_turn_off", |Unlock { unlock }| {
            trust::unlocking::<_, ()>("TurnOffEncryption", &unlock)
        })
        .command("security_set_up_tpm", |TpmUnlock { unlock, pin }| {
            trust::unlocking::<_, String>("SetUpTpmUnlock", &(unlock, pin))
        })
        .command("security_remove_tpm", |Unlock { unlock }| {
            trust::unlocking::<_, ()>("RemoveTpmUnlock", &unlock)
        })
        .command("security_show_key", |_: Value| {
            trust::call::<_, String>("ShowRecoveryKey", &())
        })
        .command("security_replace_key", |Unlock { unlock }| {
            trust::unlocking::<_, String>("ReplaceRecoveryKey", &unlock)
        })
        .command("security_enroll_key", |_: Value| {
            trust::call::<_, String>("EnrollSigningKey", &())
        })
        .command("security_cancel_enrollment", |_: Value| {
            trust::call::<_, ()>("CancelSigningKeyEnrollment", &())
        })
        .command("security_install_startup", |_: Value| {
            trust::call::<_, ()>("InstallSignedStartup", &())
        })
        .command("security_save_key", |Key { key }| recovery::save(&key))
        .command("security_print_key", |Key { key }| recovery::print(&key))
        .command("security_restart", restart)
}
