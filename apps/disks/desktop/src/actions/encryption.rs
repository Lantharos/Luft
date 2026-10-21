use std::collections::HashMap;

use luft_trust::Outcome;
use zbus::{OwnedObjectPath, OwnedVariant};

use super::passphrases;
use crate::udisks::{self, BLOCK, ENCRYPTED, no_options};

const WRONG_PASSPHRASE: [&str; 2] = [
    "Incorrect passphrase.",
    "No keyslot with given passphrase found.",
];

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

async fn has_key_file(block: &str) -> bool {
    udisks::objects()
        .await
        .ok()
        .and_then(|objects| {
            objects
                .get(block, BLOCK)?
                .get::<Vec<(String, HashMap<String, OwnedVariant>)>>("Configuration")
        })
        .unwrap_or_default()
        .iter()
        .filter(|(kind, _)| kind == "crypttab")
        .filter_map(|(_, entry)| entry.get("passphrase-path")?.try_clone().ok())
        .filter_map(|value| Vec::<u8>::try_from(value).ok())
        .any(|path| !matches!(udisks::bytes_text(path).as_str(), "" | "none" | "-"))
}

async fn known_passphrase(block: &str) -> Option<String> {
    if let Some(passphrase) = remembered(block).await {
        return Some(passphrase);
    }
    has_key_file(block).await.then(String::new)
}

fn outcome<T>(result: Result<T, String>) -> Result<Outcome<T>, String> {
    match result {
        Ok(value) => Ok(Outcome::Done(value)),
        Err(message)
            if WRONG_PASSPHRASE
                .iter()
                .any(|ending| message.ends_with(ending)) =>
        {
            Ok(Outcome::WrongKey(message))
        }
        Err(message) => Err(message),
    }
}

pub async fn unlock(
    block: &str,
    passphrase: Option<&str>,
    remember_it: bool,
) -> Result<Outcome<bool>, String> {
    let passphrase = match passphrase {
        Some(passphrase) => Some(passphrase.to_owned()),
        None => known_passphrase(block).await,
    };
    let Some(passphrase) = passphrase else {
        return Ok(Outcome::Done(false));
    };
    let unlocked = outcome(
        udisks::call::<OwnedObjectPath>(
            block,
            ENCRYPTED,
            "Unlock",
            &(passphrase.as_str(), no_options()),
        )
        .await
        .map(|_| true),
    )?;
    if remember_it && matches!(unlocked, Outcome::Done(true)) {
        remember(block, &passphrase).await?;
    }
    Ok(unlocked)
}

pub async fn lock(block: &str) -> Result<(), String> {
    super::mounting::release(block).await
}

pub async fn change_passphrase(
    block: &str,
    current: &str,
    next: &str,
) -> Result<Outcome<()>, String> {
    let changed = outcome(
        udisks::run(
            block,
            ENCRYPTED,
            "ChangePassphrase",
            &(current, next, no_options()),
        )
        .await,
    )?;
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
