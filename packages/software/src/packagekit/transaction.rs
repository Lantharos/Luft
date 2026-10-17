use std::collections::HashMap;
use std::num::NonZeroUsize;

use futures_util::StreamExt;
use luft_app::dbus::{self, failed};
use serde::Serialize;
use zbus::{Connection, DynamicType, MatchRule, MessageStream, OwnedObjectPath, OwnedVariant};

use super::enums::{self, exit, status};
use super::package::Package;
use crate::task::{CANCELLED, Task};

pub const SERVICE: &str = "org.freedesktop.PackageKit";
pub const PATH: &str = "/org/freedesktop/PackageKit";
pub const MANAGER: &str = "org.freedesktop.PackageKit";
pub const TRANSACTION: &str = "org.freedesktop.PackageKit.Transaction";
pub const PROPERTIES: &str = "org.freedesktop.DBus.Properties";
const UNKNOWN_PERCENTAGE: u32 = 101;
const QUEUED_SIGNALS: NonZeroUsize = NonZeroUsize::new(8192).unwrap();

pub type Details = HashMap<String, OwnedVariant>;

#[derive(Default)]
pub struct Outcome {
    pub packages: Vec<Package>,
    pub details: Vec<Details>,
}

#[derive(Clone, Copy)]
pub enum Mode {
    Quiet,
    Interactive,
    Background,
}

impl Mode {
    fn hints(self) -> Vec<String> {
        let (interactive, background) = match self {
            Self::Quiet => (false, false),
            Self::Interactive => (true, false),
            Self::Background => (false, true),
        };
        let locale = std::env::var("LANG").unwrap_or_else(|_| "C".into());
        vec![
            format!("locale={locale}"),
            format!("interactive={interactive}"),
            format!("background={background}"),
        ]
    }
}

fn property_u32(changed: &HashMap<String, OwnedVariant>, name: &str) -> Option<u32> {
    changed
        .get(name)
        .and_then(|value| u32::try_from(value).ok())
}

async fn subscribe(connection: &Connection, path: &str) -> Result<MessageStream, String> {
    let rule = MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .path(path)
        .build()
        .map_err(failed)?;
    MessageStream::for_match_rule(rule, connection, Some(QUEUED_SIGNALS))
        .await
        .map_err(failed)
}

async fn while_running<T>(
    task: Task<'_>,
    path: &str,
    run: impl Future<Output = Result<T, String>>,
) -> Result<T, String> {
    let path = path.to_owned();
    task.cancel
        .while_awaiting(
            move || {
                let path = path.clone();
                luft_app::spawn(async move {
                    if let Ok(connection) = dbus::system().await {
                        let _ = call(connection, &path, "Cancel", &()).await;
                    }
                });
            },
            run,
        )
        .await
        .unwrap_or_else(|| Err(CANCELLED.into()))
}

pub async fn run<B>(
    method: &str,
    body: &B,
    mode: Mode,
    task: Option<Task<'_>>,
) -> Result<Outcome, String>
where
    B: Serialize + DynamicType,
{
    let connection = dbus::system().await?;
    let path: OwnedObjectPath = connection
        .call_method(Some(SERVICE), PATH, Some(MANAGER), "CreateTransaction", &())
        .await
        .and_then(|reply| reply.body().deserialize())
        .map_err(failed)?;
    let signals = subscribe(connection, path.as_str()).await?;
    call(connection, path.as_str(), "SetHints", &(mode.hints(),)).await?;
    let execute = async {
        call(connection, path.as_str(), method, body).await?;
        collect(signals, task, Tracker::default()).await
    };
    match task {
        Some(task) => while_running(task, path.as_str(), execute).await,
        None => execute.await,
    }
}

pub async fn follow(path: &str, task: Task<'_>) -> Result<(), String> {
    let connection = dbus::system().await?;
    let signals = subscribe(connection, path).await?;
    let Ok(properties) = connection
        .call_method(
            Some(SERVICE),
            path,
            Some(PROPERTIES),
            "GetAll",
            &(TRANSACTION,),
        )
        .await
        .and_then(|reply| reply.body().deserialize::<HashMap<String, OwnedVariant>>())
    else {
        return Ok(());
    };
    let mut tracker = Tracker::default();
    tracker.update(&properties);
    if tracker.status == status::FINISHED {
        return Ok(());
    }
    tracker.report(task);
    while_running(task, path, collect(signals, Some(task), tracker))
        .await
        .map(drop)
}

async fn call<B>(connection: &Connection, path: &str, method: &str, body: &B) -> Result<(), String>
where
    B: Serialize + DynamicType,
{
    connection
        .call_method(Some(SERVICE), path, Some(TRANSACTION), method, body)
        .await
        .map(drop)
        .map_err(|error| dbus::explain(&error))
}

async fn collect(
    mut signals: MessageStream,
    task: Option<Task<'_>>,
    mut tracker: Tracker,
) -> Result<Outcome, String> {
    let mut outcome = Outcome::default();
    let mut error = None;
    while let Some(message) = signals.next().await {
        let message = message.map_err(failed)?;
        let member = message
            .header()
            .member()
            .map(|member| member.to_string())
            .unwrap_or_default();
        match member.as_str() {
            "Package" => {
                if let Ok((info, id, summary)) =
                    message.body().deserialize::<(u32, String, String)>()
                {
                    outcome.packages.extend(Package::new(info, &id, summary));
                }
            }
            "Packages" => {
                if let Ok((packages,)) = message
                    .body()
                    .deserialize::<(Vec<(u32, String, String)>,)>()
                {
                    outcome.packages.extend(
                        packages
                            .into_iter()
                            .filter_map(|(info, id, summary)| Package::new(info, &id, summary)),
                    );
                }
            }
            "Details" => {
                if let Ok((details,)) = message.body().deserialize::<(Details,)>() {
                    outcome.details.push(details);
                }
            }
            "ErrorCode" => {
                if let Ok((code, details)) = message.body().deserialize::<(u32, String)>() {
                    error = Some(enums::error_message(code, &details));
                }
            }
            "PropertiesChanged" => {
                if let Some(task) = task
                    && let Ok((_, changed, _)) =
                        message
                            .body()
                            .deserialize::<(String, HashMap<String, OwnedVariant>, Vec<String>)>()
                    && tracker.update(&changed)
                {
                    tracker.report(task);
                }
            }
            "Finished" => {
                let (code, _) = message.body().deserialize::<(u32, u32)>().map_err(failed)?;
                return match code {
                    exit::SUCCESS => Ok(outcome),
                    exit::CANCELLED => Err(CANCELLED.into()),
                    _ => Err(error.unwrap_or_else(|| "Something went wrong.".into())),
                };
            }
            "Destroy" => break,
            _ => {}
        }
    }
    Err(error.unwrap_or_else(|| "The software service stopped unexpectedly.".into()))
}

struct Tracker {
    status: u32,
    percentage: u32,
}

impl Default for Tracker {
    fn default() -> Self {
        Self {
            status: 0,
            percentage: UNKNOWN_PERCENTAGE,
        }
    }
}

impl Tracker {
    fn update(&mut self, changed: &HashMap<String, OwnedVariant>) -> bool {
        let previous = (self.status, self.percentage);
        self.status = property_u32(changed, "Status").unwrap_or(self.status);
        self.percentage = property_u32(changed, "Percentage").unwrap_or(self.percentage);
        previous != (self.status, self.percentage)
    }

    fn report(&self, task: Task) {
        task.progress(
            enums::stage(self.status),
            (self.percentage <= 100).then(|| self.percentage as f32 / 100.0),
        );
    }
}
