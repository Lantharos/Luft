use std::time::Duration;

use serde::Serialize;

use crate::actions::formatting::{self, Format};
use crate::actions::mounting;
use crate::udisks::{self, BLOCK, FILESYSTEM, bytes_text};
use luft_trust::{self as client, DRIVES, Outcome, TRUST};

const EXPLANATION: [&str; 3] = [
    "If this drive asks for a recovery key, type this key to unlock it.",
    "Keep it somewhere other than the drive and this computer,",
    "such as on paper or in a password manager.",
];
const MOUNT_WAIT: Duration = Duration::from_millis(100);
const MOUNT_TRIES: usize = 50;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Check {
    method: String,
    checks: Vec<client::Check>,
    auto_unlock: String,
}

async fn device_of(block: &str) -> Result<String, String> {
    udisks::objects()
        .await?
        .get(block, BLOCK)
        .and_then(|target| target.get::<Vec<u8>>("Device"))
        .map(bytes_text)
        .ok_or_else(|| "This partition is gone".to_owned())
}

pub async fn check(block: &str) -> Result<Check, String> {
    let (method, checks, auto_unlock): (String, Vec<(String, bool, String)>, String) =
        client::call(&DRIVES, "Check", &(device_of(block).await?,)).await?;
    Ok(Check {
        method,
        checks: checks.into_iter().map(client::Check::from).collect(),
        auto_unlock,
    })
}

pub async fn recovery_key() -> Result<String, String> {
    client::call(&TRUST, "GenerateRecoveryKey", &()).await
}

async fn mounted(block: &str) -> bool {
    udisks::objects()
        .await
        .ok()
        .and_then(|objects| {
            objects
                .get(block, FILESYSTEM)
                .and_then(|filesystem| filesystem.get::<Vec<Vec<u8>>>("MountPoints"))
        })
        .is_some_and(|points| !points.is_empty())
}

async fn remount(block: &str) -> Result<(), String> {
    for _ in 0..MOUNT_TRIES {
        let objects = udisks::objects().await?;
        let cleartext = objects
            .implementing(BLOCK)
            .find(|candidate| candidate.link("CryptoBackingDevice").as_deref() == Some(block))
            .filter(|cleartext| objects.get(cleartext.path, FILESYSTEM).is_some())
            .map(|cleartext| cleartext.path.to_owned());
        if let Some(cleartext) = cleartext {
            return mounting::mount(&cleartext).await.map(drop);
        }
        tokio::time::sleep(MOUNT_WAIT).await;
    }
    Ok(())
}

pub async fn encrypt(
    block: &str,
    recovery: &str,
    passphrase: &str,
    auto_unlock: bool,
) -> Result<(), String> {
    let device = device_of(block).await?;
    let was_mounted = mounted(block).await;
    mounting::release(block).await?;
    let _: String = client::call(
        &DRIVES,
        "Encrypt",
        &(device, recovery, passphrase, auto_unlock),
    )
    .await?;
    if was_mounted {
        remount(block).await?;
    }
    Ok(())
}

pub async fn format(
    block: &str,
    format: Format,
    recovery: &str,
    auto_unlock: bool,
) -> Result<(), String> {
    let device = device_of(block).await?;
    let unlock = format
        .passphrase
        .clone()
        .filter(|passphrase| !passphrase.is_empty())
        .unwrap_or_else(|| recovery.to_owned());
    formatting::format_volume(
        block,
        &Format {
            passphrase: Some(unlock.clone()),
            remember: false,
            ..format
        },
    )
    .await?;
    client::call(
        &DRIVES,
        "SetUpUnlocking",
        &(device, unlock, recovery, auto_unlock),
    )
    .await
}

pub async fn decrypt(block: &str, unlock: &str) -> Result<Outcome<()>, String> {
    client::unlocking(&DRIVES, "Decrypt", &(device_of(block).await?, unlock)).await
}

pub async fn set_up_unlocking(
    block: &str,
    unlock: &str,
    recovery: &str,
    auto_unlock: bool,
) -> Result<Outcome<()>, String> {
    client::unlocking(
        &DRIVES,
        "SetUpUnlocking",
        &(device_of(block).await?, unlock, recovery, auto_unlock),
    )
    .await
}

pub async fn pause(uuid: &str) -> Result<(), String> {
    client::call(&DRIVES, "Pause", &(uuid,)).await
}

pub async fn resume(uuid: &str, unlock: &str) -> Result<Outcome<()>, String> {
    client::unlocking(&DRIVES, "Resume", &(uuid, unlock)).await
}

pub async fn show_recovery_key(uuid: &str) -> Result<String, String> {
    client::call(&DRIVES, "ShowRecoveryKey", &(uuid,)).await
}

fn sheet<'a>(key: &'a str, name: &str) -> luft_app::recovery::Sheet<'a> {
    luft_app::recovery::Sheet {
        key,
        name: format!("{name} on {}", luft_app::recovery::computer()),
        explanation: &EXPLANATION,
    }
}

pub async fn save_key(key: &str, name: &str) -> Result<bool, String> {
    sheet(key, name)
        .save(&format!("Recovery key for {name}.txt"))
        .await
}

pub async fn print_key(key: &str, name: &str) -> Result<bool, String> {
    sheet(key, name).print().await
}
