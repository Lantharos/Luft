use std::collections::HashMap;

use futures_util::future::join_all;
use futures_util::{Stream, StreamExt};
use luft_app::dbus::{self, failed};
use zbus::fdo::DBusProxy;
use zbus::names::BusName;
use zbus::{MatchRule, MessageStream, OwnedObjectPath, OwnedVariant};

use super::enums::{flag, role, status};
use super::transaction::{MANAGER, PATH, PROPERTIES, SERVICE, TRANSACTION};
use crate::progress::Change;

fn change_of(role: u32, flags: u64) -> Option<Change> {
    if flags & flag::SIMULATE != 0 {
        return None;
    }
    match role {
        role::REFRESH_CACHE => Some(Change::Refresh),
        role::DOWNLOAD_PACKAGES => Some(Change::Download),
        role::UPDATE_PACKAGES if flags & flag::ONLY_DOWNLOAD != 0 => Some(Change::Download),
        role::UPDATE_PACKAGES | role::UPGRADE_SYSTEM | role::REPAIR_SYSTEM => Some(Change::Update),
        role::INSTALL_PACKAGES | role::INSTALL_FILES => Some(Change::Install),
        role::REMOVE_PACKAGES => Some(Change::Remove),
        _ => None,
    }
}

pub struct Running {
    pub path: String,
    pub change: Change,
    pub sender: String,
}

async fn describe(path: OwnedObjectPath) -> Option<Running> {
    let properties: HashMap<String, OwnedVariant> = dbus::system()
        .await
        .ok()?
        .call_method(
            Some(SERVICE),
            path.as_str(),
            Some(PROPERTIES),
            "GetAll",
            &(TRANSACTION,),
        )
        .await
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
        change: change_of(role, flags)?,
        sender: properties
            .get("Sender")
            .and_then(|value| String::try_from(value.clone()).ok())
            .unwrap_or_default(),
        path: path.to_string(),
    })
}

pub async fn running() -> Result<Vec<Running>, String> {
    let connection = dbus::system().await?;
    let started = DBusProxy::new(connection)
        .await
        .map_err(failed)?
        .name_has_owner(BusName::from_static_str(SERVICE).map_err(failed)?)
        .await
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
        .await
        .and_then(|reply| reply.body().deserialize())
        .map_err(failed)?;
    Ok(join_all(paths.into_iter().map(describe))
        .await
        .into_iter()
        .flatten()
        .collect())
}

/// Every change to PackageKit's list of transactions, as `()`.
pub async fn changes() -> Result<impl Stream<Item = ()>, String> {
    let rule = MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .sender(SERVICE)
        .path(PATH)
        .interface(MANAGER)
        .member("TransactionListChanged")
        .build()
        .map_err(failed)?;
    let signals = MessageStream::for_match_rule(rule, dbus::system().await?, None)
        .await
        .map_err(failed)?;
    Ok(signals.map(drop))
}
