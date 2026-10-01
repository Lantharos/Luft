use luft_keyring_vault::{Contents, Item};

use crate::identity::App;

pub const PORTAL_SCHEMA: &str = "org.freedesktop.portal.Secret";

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
    if item
        .attributes
        .get("xdg:schema")
        .is_some_and(|schema| schema == PORTAL_SCHEMA || schema == crate::passkeys::SCHEMA)
    {
        return Decision::Denied;
    }
    let rule = contents
        .rules
        .iter()
        .find(|rule| rule.app == app.key && rule.collection == collection && rule.item == item.id);
    match rule {
        Some(rule) if rule.allowed => Decision::Allowed,
        Some(_) => Decision::Denied,
        None if item.unclaimed => Decision::Claim,
        None => Decision::Ask,
    }
}
