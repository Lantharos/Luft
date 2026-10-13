use luft_app::dbus;
use serde::Serialize;
use zbus::blocking::{Connection, MessageIterator};
use zbus::message::Body;
use zbus::zvariant::{DynamicType, OwnedObjectPath, OwnedValue};

use super::progress::{Event, Tracker};
use crate::task::{CANCELLED, Task};

pub const SERVICE: &str = "org.projectatomic.rpmostree1";
pub const SYSROOT_PATH: &str = "/org/projectatomic/rpmostree1/Sysroot";
pub const SYSROOT: &str = "org.projectatomic.rpmostree1.Sysroot";
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const OS: &str = "org.projectatomic.rpmostree1.OS";
const TRANSACTION: &str = "org.projectatomic.rpmostree1.Transaction";
const TRANSACTION_PATH: &str = "/";

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn message_of(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(_, Some(message), _) => message,
        error => error.to_string(),
    }
}

pub fn sysroot_property(name: &str) -> Result<OwnedValue, String> {
    dbus::system()?
        .call_method(
            Some(SERVICE),
            SYSROOT_PATH,
            Some(PROPERTIES),
            "Get",
            &(SYSROOT, name),
        )
        .and_then(|reply| reply.body().deserialize::<OwnedValue>())
        .map_err(message_of)
}

fn os_path() -> Result<OwnedObjectPath, String> {
    OwnedObjectPath::try_from(sysroot_property("Booted")?).map_err(failed)
}

pub fn run<B>(method: &str, body: &B, task: Option<Task>) -> Result<(), String>
where
    B: Serialize + DynamicType,
{
    let address: String = dbus::system()?
        .call_method(Some(SERVICE), os_path()?.as_str(), Some(OS), method, body)
        .and_then(|reply| reply.body().deserialize())
        .map_err(message_of)?;
    follow(&address, task)
}

fn call(peer: &Connection, method: &str) -> Result<(), String> {
    peer.call_method(
        None::<&str>,
        TRANSACTION_PATH,
        Some(TRANSACTION),
        method,
        &(),
    )
    .map(|_| ())
    .map_err(message_of)
}

pub fn follow(address: &str, task: Option<Task>) -> Result<(), String> {
    let peer = dbus::peer(address)?;
    let signals = MessageIterator::from(&peer);
    let start = || {
        call(&peer, "Start")?;
        collect(signals, task)
    };
    let Some(task) = task else {
        return start();
    };
    let cancel = peer.clone();
    task.cancel
        .while_running(
            move || {
                let _ = call(&cancel, "Cancel");
            },
            start,
        )
        .unwrap_or_else(|| Err(CANCELLED.into()))
}

fn text(body: &Body) -> Option<String> {
    body.deserialize::<(String,)>().ok().map(|(text,)| text)
}

fn collect(signals: MessageIterator, task: Option<Task>) -> Result<(), String> {
    let mut tracker = Tracker::default();
    for message in signals {
        let message = message.map_err(failed)?;
        let header = message.header();
        if header.message_type() != zbus::message::Type::Signal {
            continue;
        }
        let body = message.body();
        let progress = match header.member().map(|member| member.as_str()) {
            Some("Finished") => {
                let (success, error): (bool, String) = body.deserialize().map_err(failed)?;
                let cancelled = task.is_some_and(|task| task.cancel.is_cancelled());
                return match (success, cancelled) {
                    (true, _) => Ok(()),
                    (false, true) => Err(CANCELLED.into()),
                    (false, false) => Err(error),
                };
            }
            Some("Message") => text(&body).and_then(|text| tracker.update(Event::Message(&text))),
            Some("TaskBegin") => {
                text(&body).and_then(|text| tracker.update(Event::TaskBegin(&text)))
            }
            Some("TaskEnd") => tracker.update(Event::TaskEnd),
            Some("PercentProgress") => body
                .deserialize::<(String, u32)>()
                .ok()
                .and_then(|(text, percentage)| tracker.update(Event::Percent(&text, percentage))),
            _ => None,
        };
        if let (Some(task), Some(progress)) = (task, progress) {
            (task.report)(progress);
        }
    }
    Err("The system update service stopped unexpectedly.".into())
}
