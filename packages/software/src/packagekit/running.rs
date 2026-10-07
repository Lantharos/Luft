use std::collections::HashMap;

use luft_app::dbus;
use serde::Serialize;
use zbus::blocking::MessageIterator;
use zbus::names::BusName;
use zbus::zvariant::{OwnedObjectPath, OwnedValue};

use super::enums::{flag, role, status};
use super::transaction::{MANAGER, PATH, PROPERTIES, SERVICE, TRANSACTION};

#[derive(Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Change {
    Refresh,
    Download,
    Update,
    Install,
    Remove,
}

impl Change {
    fn of(role: u32, flags: u64) -> Option<Self> {
        if flags & flag::SIMULATE != 0 {
            return None;
        }
        match role {
            role::REFRESH_CACHE => Some(Self::Refresh),
            role::DOWNLOAD_PACKAGES => Some(Self::Download),
            role::UPDATE_PACKAGES if flags & flag::ONLY_DOWNLOAD != 0 => Some(Self::Download),
            role::UPDATE_PACKAGES | role::UPGRADE_SYSTEM | role::REPAIR_SYSTEM => {
                Some(Self::Update)
            }
            role::INSTALL_PACKAGES | role::INSTALL_FILES => Some(Self::Install),
            role::REMOVE_PACKAGES => Some(Self::Remove),
            _ => None,
        }
    }
}

pub struct Running {
    pub path: String,
    pub change: Change,
    pub sender: String,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn describe(path: OwnedObjectPath) -> Option<Running> {
    let properties: HashMap<String, OwnedValue> = dbus::system()
        .ok()?
        .call_method(
            Some(SERVICE),
            path.as_str(),
            Some(PROPERTIES),
            "GetAll",
            &(TRANSACTION,),
        )
        .and_then(|reply| reply.body().deserialize())
        .ok()?;
    let number = |name: &str| {
        properties
            .get(name)
            .and_then(|value| u32::try_from(value).ok())
    };
    if number("Status") == Some(status::FINISHED) {
        return None;
    }
    let role = number("Role")?;
    let flags = properties
        .get("TransactionFlags")
        .and_then(|value| u64::try_from(value).ok())
        .unwrap_or(0);
    Some(Running {
        change: Change::of(role, flags)?,
        sender: properties
            .get("Sender")
            .and_then(|value| String::try_from(value.clone()).ok())
            .unwrap_or_default(),
        path: path.to_string(),
    })
}

pub fn running() -> Result<Vec<Running>, String> {
    let connection = dbus::system()?;
    let started = zbus::blocking::fdo::DBusProxy::new(connection)
        .map_err(failed)?
        .name_has_owner(BusName::from_static_str(SERVICE).map_err(failed)?)
        .map_err(failed)?;
    if !started {
        return Ok(Vec::new());
    }
    let paths: Vec<OwnedObjectPath> = connection
        .call_method(
            Some(SERVICE),
            PATH,
            Some(MANAGER),
            "GetTransactionList",
            &(),
        )
        .and_then(|reply| reply.body().deserialize())
        .map_err(failed)?;
    Ok(paths.into_iter().filter_map(describe).collect())
}

pub fn watch(mut changed: impl FnMut()) -> Result<(), String> {
    let connection = dbus::system()?;
    let rule = zbus::MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .sender(SERVICE)
        .map_err(failed)?
        .path(PATH)
        .map_err(failed)?
        .interface(MANAGER)
        .map_err(failed)?
        .member("TransactionListChanged")
        .map_err(failed)?
        .build();
    let signals = MessageIterator::for_match_rule(rule, connection, Some(64)).map_err(failed)?;
    for message in signals {
        message.map_err(failed)?;
        changed();
    }
    Ok(())
}
