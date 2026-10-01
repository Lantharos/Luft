mod bus;
mod snapshot;
mod watch;

use std::sync::Once;

use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Deserialize;
use serde_json::Value;
use zbus::zvariant::ObjectPath;

use bus::{ACCESS, Problem, SSH, STATUS};
use snapshot::Keyring;

static WATCH: Once = Once::new();

#[derive(Deserialize)]
struct Toggle {
    enabled: bool,
}

#[derive(Deserialize)]
struct Import {
    name: String,
}

#[derive(Deserialize)]
struct Revoke {
    app: String,
    item: String,
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

fn keyring(events: &Events, _: Value) -> Result<Option<Keyring>, String> {
    WATCH.call_once(|| watch::watch(events.clone()));
    Ok(snapshot::read()?)
}

fn reseal(_: Value) -> Result<(), String> {
    bus::call(STATUS, "Reseal", &()).map_err(|problem| match problem {
        Problem::Failed(_) => {
            "The security chip couldn’t protect your keyring right now".to_owned()
        }
        problem => problem.into(),
    })
}

fn revoke(Revoke { app, item }: Revoke) -> Result<(), String> {
    let item = ObjectPath::try_from(item.as_str()).map_err(|error| error.to_string())?;
    Ok(bus::call::<_, ()>(ACCESS, "Revoke", &(app, item))?)
}

fn set_confirm(
    Confirm {
        fingerprint,
        confirm,
    }: Confirm,
) -> Result<(), String> {
    Ok(bus::call(SSH, "SetConfirm", &(fingerprint, confirm))?)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with("keyring", events, keyring)
        .command("keyring_lock", |_: Value| {
            Ok(bus::call::<_, ()>(STATUS, "Lock", &())?)
        })
        .command("keyring_unlock", |_: Value| {
            Ok(bus::call::<_, bool>(STATUS, "Unlock", &())?)
        })
        .command("keyring_set_pin", |Toggle { enabled }| {
            Ok(bus::call::<_, bool>(STATUS, "SetPin", &(enabled,))?)
        })
        .command("keyring_reseal", reseal)
        .command("keyring_import", |Import { name }| {
            Ok(bus::call::<_, bool>(STATUS, "ImportKeyring", &(name,))?)
        })
        .command("keyring_lock_with_screen", |Toggle { enabled }| {
            Ok(bus::set_property(STATUS, "LockWithScreen", enabled)?)
        })
        .command("keyring_revoke", revoke)
        .command("keyring_forget_app", |Forget { app }| {
            Ok(bus::call::<_, ()>(ACCESS, "ForgetApp", &(app,))?)
        })
        .command("keyring_clear_history", |_: Value| {
            Ok(bus::call::<_, ()>(ACCESS, "ClearHistory", &())?)
        })
        .command("keyring_ssh_generate", |Generate { name, chip }| {
            Ok(bus::call::<_, String>(SSH, "Generate", &(name, chip))?)
        })
        .command("keyring_ssh_public_key", |Key { fingerprint }| {
            Ok(bus::call::<_, String>(SSH, "PublicKey", &(fingerprint,))?)
        })
        .command("keyring_ssh_confirm", set_confirm)
        .command("keyring_ssh_remove", |Key { fingerprint }| {
            Ok(bus::call::<_, ()>(SSH, "Remove", &(fingerprint,))?)
        })
}
