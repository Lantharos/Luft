use std::collections::BTreeMap;

use luft_keyring_vault::Item;

use crate::requester::{Caller, Requester, SABINE_OWNER, View, sandboxed_app_of};

pub const PORTAL_SCHEMA: &str = "org.freedesktop.portal.Secret";
const CHROMIUM: &str = "chromium";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Decision {
    Allowed,
    Denied,
    ConfirmItsYou,
    AskTheApp,
}

pub fn sandboxed_owner(item: &Item) -> Option<&str> {
    item.owner.as_deref().and_then(sandboxed_app_of)
}

pub fn decide(requester: &Requester, item: &Item) -> Decision {
    let owner = sandboxed_owner(item);
    match &requester.caller {
        Caller::You => Decision::Allowed,
        Caller::App(id) if owner == Some(id.as_str()) => Decision::Allowed,
        _ if has_protected_schema(&item.attributes) => Decision::Denied,
        Caller::App(_) if owner.is_some() => Decision::ConfirmItsYou,
        _ => Decision::AskTheApp,
    }
}

pub fn has_protected_schema(attributes: &BTreeMap<String, String>) -> bool {
    attributes.get("xdg:schema").is_some_and(|schema| {
        schema == PORTAL_SCHEMA || schema == crate::services::passkeys::SCHEMA
    })
}

impl View {
    pub fn shows(self, item: &Item) -> bool {
        let sabine = item.owner.as_deref() == Some(SABINE_OWNER);
        match self {
            Self::Everything => !sabine,
            Self::SabineChromium => sabine || !names_chromium(item),
        }
    }
}

fn names_chromium(item: &Item) -> bool {
    item.attributes
        .get("application")
        .is_some_and(|application| application.eq_ignore_ascii_case(CHROMIUM))
}
