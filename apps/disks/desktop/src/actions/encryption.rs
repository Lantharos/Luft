use std::collections::HashMap;

use zbus::zvariant::OwnedValue;

use super::passphrases;
use crate::udisks::{self, BLOCK, ENCRYPTED, no_options};

fn text_of(block: &str, property: &str) -> Option<String> {
    udisks::objects()
        .ok()?
        .get(block, BLOCK)
        .and_then(|target| target.get::<String>(property))
        .filter(|text| !text.is_empty())
}

fn uuid_of(block: &str) -> Result<String, String> {
    text_of(block, "IdUUID").ok_or_else(|| "This volume has no identifier".to_owned())
}

fn name_of(block: &str) -> String {
    text_of(block, "IdLabel").unwrap_or_else(|| {
        udisks::objects()
            .ok()
            .and_then(|objects| objects.get(block, BLOCK)?.get::<Vec<u8>>("PreferredDevice"))
            .map(udisks::bytes_text)
            .unwrap_or_else(|| block.to_owned())
    })
}

pub fn remember(block: &str, passphrase: &str) -> Result<(), String> {
    passphrases::store(&uuid_of(block)?, &name_of(block), passphrase)
        .map_err(|_| "The passphrase couldn't be saved in your keyring".to_owned())
}

fn forget(block: &str) {
    if let Ok(uuid) = uuid_of(block) {
        passphrases::delete(&uuid);
    }
}

fn remembered(block: &str) -> Option<String> {
    passphrases::load(&uuid_of(block).ok()?)
}

fn has_key_file(block: &str) -> bool {
    udisks::objects()
        .ok()
        .and_then(|objects| {
            objects
                .get(block, BLOCK)?
                .get::<Vec<(String, HashMap<String, OwnedValue>)>>("Configuration")
        })
        .unwrap_or_default()
        .iter()
        .filter(|(kind, _)| kind == "crypttab")
        .filter_map(|(_, entry)| entry.get("passphrase-path")?.try_clone().ok())
        .filter_map(|value| Vec::<u8>::try_from(value).ok())
        .any(|path| !matches!(udisks::bytes_text(path).as_str(), "" | "none" | "-"))
}

pub fn unlock(block: &str, passphrase: Option<&str>, remember_it: bool) -> Result<bool, String> {
    let passphrase = passphrase
        .map(str::to_owned)
        .or_else(|| remembered(block))
        .or_else(|| has_key_file(block).then(String::new));
    let Some(passphrase) = passphrase else {
        return Ok(false);
    };
    let _: zbus::zvariant::OwnedObjectPath = udisks::call(
        block,
        ENCRYPTED,
        "Unlock",
        &(passphrase.as_str(), no_options()),
    )?;
    if remember_it {
        remember(block, &passphrase)?;
    }
    Ok(true)
}

pub fn lock(block: &str) -> Result<(), String> {
    super::mounting::release(block)
}

pub fn change_passphrase(block: &str, current: &str, next: &str) -> Result<(), String> {
    udisks::run(
        block,
        ENCRYPTED,
        "ChangePassphrase",
        &(current, next, no_options()),
    )?;
    if remembered(block).is_some() {
        remember(block, next)?;
    }
    Ok(())
}

pub fn is_remembered(block: &str) -> bool {
    remembered(block).is_some()
}

pub fn stop_remembering(block: &str) {
    forget(block);
}
