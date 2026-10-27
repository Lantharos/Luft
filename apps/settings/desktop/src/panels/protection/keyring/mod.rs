mod bus;
mod snapshot;
mod watch;

use std::sync::Once;

use luft_app::{Commands, Empty, Events};
use luft_i18n::t;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use zbus::DynamicType;

use bus::{ACCESS, Problem, SSH, STATUS};
use snapshot::{Access, Keyring};
use specta::Type;

use crate::L10N;

static WATCH: Once = Once::new();

#[derive(Deserialize, Type)]
struct KeyringToggle {
    enabled: bool,
}

#[derive(Deserialize, Type)]
struct Forget {
    app: String,
}

#[derive(Deserialize, Type)]
struct Generate {
    name: String,
    chip: bool,
}

#[derive(Deserialize, Type)]
struct SshKeyTarget {
    fingerprint: String,
}

#[derive(Deserialize, Type)]
struct Confirm {
    fingerprint: String,
    confirm: bool,
}

async fn keyring(events: Events, Empty {}: Empty) -> Result<Option<Keyring>, String> {
    WATCH.call_once(|| watch::watch(events));
    Ok(snapshot::read().await?)
}

async fn access(Empty {}: Empty) -> Result<Option<Access>, String> {
    Ok(bus::optional(snapshot::access().await)?)
}

async fn reseal(Empty {}: Empty) -> Result<(), String> {
    bus::call(STATUS, "Reseal", &())
        .await
        .map_err(|problem| match problem {
            Problem::Failed(_) => t!(L10N, "desktop-keyring-reseal-failed"),
            problem => problem.into(),
        })
}

async fn confirmed<B: Serialize + DynamicType>(method: &str, body: &B) -> Result<bool, String> {
    match bus::call::<_, ()>(ACCESS, method, body).await {
        Ok(()) => Ok(true),
        Err(Problem::Denied) => Ok(false),
        Err(problem) => Err(problem.into()),
    }
}

async fn set_confirm(
    Confirm {
        fingerprint,
        confirm,
    }: Confirm,
) -> Result<(), String> {
    Ok(bus::call(SSH, "SetConfirm", &(fingerprint, confirm)).await?)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&watch::CHANGED)
        .with_async("keyring", events, keyring)
        .command_async("keyring_access", access)
        .command_async("keyring_lock", |Empty {}| async {
            Ok(bus::call::<_, ()>(STATUS, "Lock", &()).await?)
        })
        .command_async("keyring_unlock", |Empty {}| async {
            Ok(bus::call::<_, bool>(STATUS, "Unlock", &()).await?)
        })
        .command_async("keyring_set_pin", |KeyringToggle { enabled }| async move {
            Ok(bus::call::<_, bool>(STATUS, "SetPin", &(enabled,)).await?)
        })
        .command_async("keyring_reseal", reseal)
        .command_async(
            "keyring_lock_with_screen",
            |KeyringToggle { enabled }| async move {
                Ok(bus::set_property(STATUS, "LockWithScreen", enabled).await?)
            },
        )
        .command_async("keyring_forget_app", |Forget { app }| async move {
            confirmed("ForgetApp", &(app,)).await
        })
        .command_async("keyring_clear_history", |Empty {}| async {
            confirmed("ClearHistory", &()).await
        })
        .command_async(
            "keyring_ssh_generate",
            |Generate { name, chip }| async move {
                Ok(bus::call::<_, String>(SSH, "Generate", &(name, chip)).await?)
            },
        )
        .command_async(
            "keyring_ssh_public_key",
            |SshKeyTarget { fingerprint }| async move {
                Ok(bus::call::<_, String>(SSH, "PublicKey", &(fingerprint,)).await?)
            },
        )
        .command_async("keyring_ssh_confirm", set_confirm)
        .command_async(
            "keyring_ssh_remove",
            |SshKeyTarget { fingerprint }| async move {
                Ok(bus::call::<_, ()>(SSH, "Remove", &(fingerprint,)).await?)
            },
        )
}
