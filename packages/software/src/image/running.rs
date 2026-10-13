use luft_app::dbus;
use zbus::blocking::MessageIterator;
use zbus::names::BusName;

use super::transaction::{SERVICE, SYSROOT_PATH, sysroot_property};
use crate::progress::Change;

pub struct Running {
    pub address: String,
    pub change: Option<Change>,
    pub sender: String,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn change_of(method: &str) -> Option<Change> {
    match method {
        "RefreshMd" | "AutomaticUpdateTrigger" => Some(Change::Refresh),
        "Upgrade" | "Deploy" | "Rebase" => Some(Change::Download),
        "PkgChange" | "UpdateDeployment" => Some(Change::Install),
        _ => None,
    }
}

pub fn running() -> Result<Option<Running>, String> {
    let started = zbus::blocking::fdo::DBusProxy::new(dbus::system()?)
        .map_err(failed)?
        .name_has_owner(BusName::from_static_str(SERVICE).map_err(failed)?)
        .map_err(failed)?;
    if !started {
        return Ok(None);
    }
    let (method, sender, _): (String, String, String) = sysroot_property("ActiveTransaction")?
        .try_into()
        .map_err(failed)?;
    if method.is_empty() {
        return Ok(None);
    }
    Ok(Some(Running {
        address: sysroot_property("ActiveTransactionPath")?
            .try_into()
            .map_err(failed)?,
        change: change_of(&method),
        sender,
    }))
}

fn changes() -> Result<MessageIterator, String> {
    let rule = zbus::MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .sender(SERVICE)
        .map_err(failed)?
        .path(SYSROOT_PATH)
        .map_err(failed)?
        .interface("org.freedesktop.DBus.Properties")
        .map_err(failed)?
        .member("PropertiesChanged")
        .map_err(failed)?
        .build();
    MessageIterator::for_match_rule(rule, dbus::system()?, Some(64)).map_err(failed)
}

pub fn watch(mut changed: impl FnMut()) -> Result<(), String> {
    for message in changes()? {
        message.map_err(failed)?;
        changed();
    }
    Ok(())
}

pub fn wait() -> Result<(), String> {
    let changes = changes()?;
    if running()?.is_none() {
        return Ok(());
    }
    for message in changes {
        message.map_err(failed)?;
        if running()?.is_none() {
            break;
        }
    }
    Ok(())
}
