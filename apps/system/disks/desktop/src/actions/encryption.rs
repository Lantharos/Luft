use luft_trust::Outcome;

use super::passphrases;
use crate::trust::drives;
use crate::udisks::{self, BLOCK};

async fn text_of(block: &str, property: &str) -> Option<String> {
    udisks::objects()
        .await
        .ok()?
        .get(block, BLOCK)
        .and_then(|target| target.get::<String>(property))
        .filter(|text| !text.is_empty())
}

async fn uuid_of(block: &str) -> Result<String, String> {
    text_of(block, "IdUUID")
        .await
        .ok_or_else(|| "This volume has no identifier".to_owned())
}

async fn name_of(block: &str) -> String {
    if let Some(label) = text_of(block, "IdLabel").await {
        return label;
    }
    udisks::objects()
        .await
        .ok()
        .and_then(|objects| objects.get(block, BLOCK)?.get::<Vec<u8>>("PreferredDevice"))
        .map(udisks::bytes_text)
        .unwrap_or_else(|| block.to_owned())
}

pub async fn remember(block: &str, passphrase: &str) -> Result<(), String> {
    passphrases::store(&uuid_of(block).await?, &name_of(block).await, passphrase)
        .await
        .map_err(|_| "The passphrase couldn't be saved in your keyring".to_owned())
}

async fn forget(block: &str) {
    if let Ok(uuid) = uuid_of(block).await {
        passphrases::delete(&uuid).await;
    }
}

async fn remembered(block: &str) -> Option<String> {
    passphrases::load(&uuid_of(block).await.ok()?).await
}

pub async fn unlock(
    block: &str,
    passphrase: Option<&str>,
    remember_it: bool,
) -> Result<Outcome<bool>, String> {
    let passphrase = match passphrase {
        Some(passphrase) => Some(passphrase.to_owned()),
        None => remembered(block).await,
    };
    let Some(passphrase) = passphrase else {
        return drives::unlock_with_kept_key(&uuid_of(block).await?)
            .await
            .map(Outcome::Done);
    };
    let device = drives::device_of(block).await?;
    match luft_trust::drives::unlock(&device, &passphrase).await? {
        Outcome::Done(_) => {
            if remember_it {
                remember(block, &passphrase).await?;
            }
            Ok(Outcome::Done(true))
        }
        Outcome::WrongKey(message) => Ok(Outcome::WrongKey(message)),
    }
}

pub async fn lock(block: &str) -> Result<(), String> {
    super::mounting::release(block).await
}

pub async fn change_passphrase(
    block: &str,
    current: &str,
    next: &str,
) -> Result<Outcome<()>, String> {
    let device = drives::device_of(block).await?;
    let changed = luft_trust::drives::change_passphrase(&device, current, next).await?;
    if matches!(changed, Outcome::Done(())) && remembered(block).await.is_some() {
        remember(block, next).await?;
    }
    Ok(changed)
}

pub async fn is_remembered(block: &str) -> bool {
    remembered(block).await.is_some()
}

pub async fn stop_remembering(block: &str) {
    forget(block).await;
}
