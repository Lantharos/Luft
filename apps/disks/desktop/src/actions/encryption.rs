use std::collections::HashMap;

use luft_app::secrets;
use zbus::zvariant::OwnedValue;

use crate::udisks::{self, BLOCK, ENCRYPTED, no_options};

fn secret_name(uuid: &str) -> String {
    format!("luks-{uuid}")
}

fn uuid_of(block: &str) -> Result<String, String> {
    udisks::objects()?
        .get(block, BLOCK)
        .and_then(|target| target.get::<String>("IdUUID"))
        .filter(|uuid| !uuid.is_empty())
        .ok_or_else(|| "This volume has no identifier".to_owned())
}

pub fn remember(block: &str, passphrase: &str) -> Result<(), String> {
    secrets::store(&secret_name(&uuid_of(block)?), passphrase.as_bytes())
        .map_err(|_| "The passphrase couldn't be saved in your keyring".to_owned())
}

fn forget(block: &str) {
    if let Ok(uuid) = uuid_of(block) {
        let _ = secrets::delete(&secret_name(&uuid));
    }
}

fn remembered(block: &str) -> Option<String> {
    let secret = secrets::load(&secret_name(&uuid_of(block).ok()?)).ok()??;
    String::from_utf8(secret).ok()
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
        forget(block);
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
