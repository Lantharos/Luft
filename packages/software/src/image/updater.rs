use luft_app::dbus::{self, service::Service};
use zbus::blocking::MessageIterator;
use zbus::blocking::fdo::DBusProxy;
use zbus::names::BusName;
use zbus::zvariant::OwnedValue;

use crate::progress::{Progress, Stage};
use crate::task::{CANCELLED, Task};

const UPDATER: Service = Service {
    name: "com.lantharos.Updater1",
    path: "/com/lantharos/Updater1",
    interface: "com.lantharos.Updater1",
};
const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const DOWNLOADED: &str = "Downloaded";
const STOPPED: &str = "The update service stopped unexpectedly.";

type Changes = std::collections::HashMap<String, OwnedValue>;

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn message_of(error: zbus::Error) -> String {
    match error {
        zbus::Error::MethodError(_, Some(message), _) => message,
        error => error.to_string(),
    }
}

fn change(method: &str) -> Result<(), String> {
    UPDATER.change::<_, ()>(method, &()).map_err(message_of)
}

pub fn status() -> Result<String, String> {
    UPDATER.proxy()?.call("Status", &()).map_err(message_of)
}

pub fn rollback() -> Result<(), String> {
    change("Rollback")
}

fn signals() -> Result<MessageIterator, String> {
    let rule = zbus::MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .sender(UPDATER.name)
        .map_err(failed)?
        .path(UPDATER.path)
        .map_err(failed)?
        .build();
    MessageIterator::for_match_rule(rule, dbus::system()?, Some(64)).map_err(failed)
}

fn started() -> Result<bool, String> {
    DBusProxy::new(dbus::system()?)
        .map_err(failed)?
        .name_has_owner(BusName::from_static_str(UPDATER.name).map_err(failed)?)
        .map_err(failed)
}

pub fn downloading() -> Result<bool, String> {
    if !started()? {
        return Ok(false);
    }
    UPDATER.proxy()?.get_property("Downloading").map_err(failed)
}

fn progress(downloaded: u64, size: Option<u64>) -> Progress {
    match size.filter(|size| *size > 0) {
        Some(size) if downloaded >= size => Progress::new(Stage::Finishing, None),
        Some(size) => Progress::new(Stage::Downloading, Some(downloaded as f32 / size as f32)),
        None => Progress::new(Stage::Downloading, None),
    }
}

fn collect(signals: MessageIterator, size: Option<u64>, task: Task) -> Result<(), String> {
    for message in signals {
        let message = message.map_err(failed)?;
        let header = message.header();
        let body = message.body();
        match header.member().map(|member| member.as_str()) {
            Some("Finished") => {
                let (error,): (String,) = body.deserialize().map_err(failed)?;
                return match (error.is_empty(), task.cancel.is_cancelled()) {
                    (true, _) => Ok(()),
                    (false, true) => Err(CANCELLED.into()),
                    (false, false) => Err(error),
                };
            }
            Some("PropertiesChanged")
                if header.interface().is_some_and(|name| name == PROPERTIES) =>
            {
                let Ok((_, changes, _)) = body.deserialize::<(String, Changes, Vec<String>)>()
                else {
                    continue;
                };
                let downloaded = changes
                    .get(DOWNLOADED)
                    .and_then(|value| u64::try_from(value).ok());
                if let Some(downloaded) = downloaded {
                    (task.report)(progress(downloaded, size));
                }
            }
            _ => {}
        }
    }
    Err(STOPPED.into())
}

fn cancellable(signals: MessageIterator, size: Option<u64>, task: Task) -> Result<(), String> {
    task.cancel
        .while_running(
            || {
                let _ = change("Cancel");
            },
            || collect(signals, size, task),
        )
        .unwrap_or_else(|| Err(CANCELLED.into()))
}

pub fn download(size: Option<u64>, task: Task) -> Result<(), String> {
    let signals = signals()?;
    task.progress(Stage::Preparing, None);
    change("Download")?;
    cancellable(signals, size, task)
}

pub fn follow(size: Option<u64>, task: Task) -> Result<(), String> {
    let signals = signals()?;
    if !downloading()? {
        return Ok(());
    }
    task.progress(Stage::Preparing, None);
    cancellable(signals, size, task)
}

pub fn watch(mut changed: impl FnMut()) -> Result<(), String> {
    for message in signals()? {
        message.map_err(failed)?;
        changed();
    }
    Ok(())
}
