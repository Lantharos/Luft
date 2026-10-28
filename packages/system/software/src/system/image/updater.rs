use futures_util::{Stream, StreamExt};
use luft_app::dbus::service::{Service, get};
use luft_app::dbus::{self, failed};
use luft_variant::Variant;
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::fdo::DBusProxy;
use zbus::names::BusName;
use zbus::{MessageStream, OwnedVariant};

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

type Changes = std::collections::HashMap<String, OwnedVariant>;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "lowercase")]
pub enum Schedule {
    Daily,
    Weekly,
    Never,
}

impl Schedule {
    fn named(name: &str) -> Option<Self> {
        match name {
            "daily" => Some(Self::Daily),
            "weekly" => Some(Self::Weekly),
            "never" => Some(Self::Never),
            _ => None,
        }
    }

    fn name(self) -> &'static str {
        match self {
            Self::Daily => "daily",
            Self::Weekly => "weekly",
            Self::Never => "never",
        }
    }
}

/// How often the system looks for updates by itself, and whether it downloads what it finds.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, Type)]
pub struct UpdatePolicy {
    pub schedule: Schedule,
    pub download: bool,
    #[serde(skip)]
    pub checked: Option<u64>,
}

/// When the update service looks for updates by itself, and what it does with them.
pub async fn policy() -> Result<UpdatePolicy, String> {
    let properties = UPDATER.read().await?.ok_or(STOPPED)?;
    let schedule = get::<String>(&properties, "Schedule")
        .and_then(|name| Schedule::named(&name))
        .ok_or(STOPPED)?;
    Ok(UpdatePolicy {
        schedule,
        download: get(&properties, "DownloadAutomatically").unwrap_or(true),
        checked: get::<u64>(&properties, "LastChecked").filter(|checked| *checked > 0),
    })
}

pub async fn set_policy(policy: UpdatePolicy) -> Result<(), String> {
    UPDATER
        .change::<_, ()>("SetSchedule", &(policy.schedule.name(), policy.download))
        .await
        .map_err(|error| dbus::explain(&error))
}

async fn change(method: &str) -> Result<(), String> {
    UPDATER
        .change::<_, ()>(method, &())
        .await
        .map_err(|error| dbus::explain(&error))
}

pub async fn status() -> Result<String, String> {
    UPDATER
        .proxy()
        .await?
        .call("Status", &())
        .await
        .map_err(|error| dbus::explain(&error))
}

pub async fn rollback() -> Result<(), String> {
    change("Rollback").await
}

async fn signals() -> Result<MessageStream, String> {
    let connection = dbus::system().await?;
    dbus::objects::signals(connection, UPDATER.name, UPDATER.path).await
}

async fn started() -> Result<bool, String> {
    DBusProxy::new(dbus::system().await?)
        .await
        .map_err(failed)?
        .name_has_owner(BusName::from_static_str(UPDATER.name).map_err(failed)?)
        .await
        .map_err(failed)
}

pub async fn downloading() -> Result<bool, String> {
    if !started().await? {
        return Ok(false);
    }
    UPDATER
        .proxy()
        .await?
        .get_property("Downloading")
        .await
        .map_err(failed)
}

fn progress(downloaded: u64, size: Option<u64>) -> Progress {
    match size.filter(|size| *size > 0) {
        Some(size) if downloaded >= size => Progress::new(Stage::Finishing, None),
        Some(size) => Progress::new(Stage::Downloading, Some(downloaded as f32 / size as f32)),
        None => Progress::new(Stage::Downloading, None),
    }
}

async fn collect(
    mut signals: MessageStream,
    size: Option<u64>,
    task: Task<'_>,
) -> Result<(), String> {
    while let Some(message) = signals.next().await {
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

async fn cancellable(
    signals: MessageStream,
    size: Option<u64>,
    task: Task<'_>,
) -> Result<(), String> {
    task.cancel
        .while_awaiting(
            || {
                luft_app::spawn(async {
                    let _ = change("Cancel").await;
                });
            },
            collect(signals, size, task),
        )
        .await
        .unwrap_or_else(|| Err(CANCELLED.into()))
}

pub async fn download(size: Option<u64>, task: Task<'_>) -> Result<(), String> {
    let signals = signals().await?;
    task.progress(Stage::Preparing, None);
    change("Download").await?;
    cancellable(signals, size, task).await
}

pub async fn switch(variant: Variant, size: Option<u64>, task: Task<'_>) -> Result<(), String> {
    let signals = signals().await?;
    task.progress(Stage::Preparing, None);
    UPDATER
        .change::<_, ()>("SwitchVariant", &(variant.name(),))
        .await
        .map_err(|error| dbus::explain(&error))?;
    cancellable(signals, size, task).await
}

pub async fn follow(size: Option<u64>, task: Task<'_>) -> Result<(), String> {
    let signals = signals().await?;
    if !downloading().await? {
        return Ok(());
    }
    task.progress(Stage::Preparing, None);
    cancellable(signals, size, task).await
}

/// Every signal the updater sends, as `()`.
pub async fn changes() -> Result<impl Stream<Item = ()>, String> {
    Ok(signals().await?.map(drop))
}
