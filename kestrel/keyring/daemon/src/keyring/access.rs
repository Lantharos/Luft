use luft_keyring_vault::{Contents, Item};

use crate::identity::{App, UNBRANDED_CHROMIUM};

pub const PORTAL_SCHEMA: &str = "org.freedesktop.portal.Secret";
const DRIVE_PASSPHRASE: &str = "gvfs-luks-uuid";
const DRIVE_UNLOCKERS: [&str; 2] = [
    "exe:/usr/libexec/gvfs-udisks2-volume-monitor",
    "app:com.lantharos.disks",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Decision {
    Allowed,
    Claim,
    Ask,
    Denied,
}

pub fn decide(contents: &Contents, app: &App, collection: &str, item: &Item) -> Decision {
    if item.owner.as_deref() == Some(app.key.as_str()) {
        return Decision::Allowed;
    }
    if item.attributes.get("xdg:schema").is_some_and(|schema| {
        schema == PORTAL_SCHEMA || schema == crate::services::passkeys::SCHEMA
    }) {
        return Decision::Denied;
    }
    if item.attributes.contains_key(DRIVE_PASSPHRASE) && DRIVE_UNLOCKERS.contains(&app.key.as_str())
    {
        return Decision::Allowed;
    }
    let rule = contents
        .rules
        .iter()
        .find(|rule| rule.app == app.key && rule.collection == collection && rule.item == item.id);
    match rule {
        Some(rule) if rule.allowed => Decision::Allowed,
        Some(_) => Decision::Denied,
        None if item.unclaimed && app.may_claim(app_hint(item).as_deref()) => Decision::Claim,
        None => Decision::Ask,
    }
}

pub fn hidden(contents: &Contents, app: &App, collection: &str, item: &Item) -> bool {
    app.keeps_its_own_chromium_key()
        && app_hint(item).as_deref() == Some(UNBRANDED_CHROMIUM)
        && decide(contents, app, collection, item) != Decision::Allowed
}

pub fn app_hint(item: &Item) -> Option<String> {
    item.attributes
        .get("application")
        .map(|application| application.to_lowercase())
}
