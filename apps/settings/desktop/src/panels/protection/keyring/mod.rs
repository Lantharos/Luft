mod bus;
mod snapshot;
mod watch;

use std::sync::Once;

use luft_app::{Commands, Events};
use luft_i18n::t;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::DynamicType;

use bus::{ACCESS, Problem, SSH, STATUS};
use snapshot::Keyring;

use crate::L10N;

static WATCH: Once = Once::new();

#[derive(Deserialize)]
struct Toggle {
    enabled: bool,
}

#[derive(Deserialize)]
struct Forget {
    app: String,
}

#[derive(Deserialize)]
struct Generate {
    name: String,
    chip: bool,
}

#[derive(Deserialize)]
struct Key {
    fingerprint: String,
}

#[derive(Deserialize)]
struct Confirm {
    fingerprint: String,
    confirm: bool,
}

async fn keyring(events: Events, _: Value) -> Result<Option<Keyring>, String> {
    WATCH.call_once(|| watch::watch(events));
    Ok(snapshot::read().await?)
}

async fn reseal(_: Value) -> Result<(), String> {
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
        .with_async("keyring", events, keyring)
        .command_async("keyring_lock", |_: Value| async {
            Ok(bus::call::<_, ()>(STATUS, "Lock", &()).await?)
        })
        .command_async("keyring_unlock", |_: Value| async {
            Ok(bus::call::<_, bool>(STATUS, "Unlock", &()).await?)
        })
        .command_async("keyring_set_pin", |Toggle { enabled }| async move {
            Ok(bus::call::<_, bool>(STATUS, "SetPin", &(enabled,)).await?)
        })
        .command_async("keyring_reseal", reseal)
        .command_async(
            "keyring_lock_with_screen",
            |Toggle { enabled }| async move {
                Ok(bus::set_property(STATUS, "LockWithScreen", enabled).await?)
            },
        )
        .command_async("keyring_forget_app", |Forget { app }| async move {
            confirmed("ForgetApp", &(app,)).await
        })
        .command_async("keyring_clear_history", |_: Value| async {
            confirmed("ClearHistory", &()).await
        })
        .command_async(
            "keyring_ssh_generate",
            |Generate { name, chip }| async move {
                Ok(bus::call::<_, String>(SSH, "Generate", &(name, chip)).await?)
            },
        )
        .command_async("keyring_ssh_public_key", |Key { fingerprint }| async move {
            Ok(bus::call::<_, String>(SSH, "PublicKey", &(fingerprint,)).await?)
        })
        .command_async("keyring_ssh_confirm", set_confirm)
        .command_async("keyring_ssh_remove", |Key { fingerprint }| async move {
            Ok(bus::call::<_, ()>(SSH, "Remove", &(fingerprint,)).await?)
        })
}
