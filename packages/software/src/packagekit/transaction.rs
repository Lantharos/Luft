use std::collections::HashMap;

use luft_app::dbus;
use serde::Serialize;
use zbus::blocking::{Connection, MessageIterator};
use zbus::message::Message;
use zbus::zvariant::{DynamicType, OwnedObjectPath, OwnedValue};

use super::enums::{self, exit};
use super::package::Package;
use crate::task::{CANCELLED, Task};

pub const SERVICE: &str = "org.freedesktop.PackageKit";
pub const PATH: &str = "/org/freedesktop/PackageKit";
const MANAGER: &str = "org.freedesktop.PackageKit";
const TRANSACTION: &str = "org.freedesktop.PackageKit.Transaction";
const QUEUED_SIGNALS: usize = 8192;

pub type Details = HashMap<String, OwnedValue>;

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

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

fn property_u32(changed: &HashMap<String, OwnedValue>, name: &str) -> Option<u32> {
    changed
        .get(name)
        .and_then(|value| u32::try_from(value).ok())
}

pub fn run<B>(method: &str, body: &B, mode: Mode, task: Option<Task>) -> Result<Outcome, String>
where
    B: Serialize + DynamicType,
{
    let connection = dbus::system()?;
    let path: OwnedObjectPath = connection
        .call_method(Some(SERVICE), PATH, Some(MANAGER), "CreateTransaction", &())
        .and_then(|reply| reply.body().deserialize())
        .map_err(failed)?;
    let rule = zbus::MatchRule::builder()
        .msg_type(zbus::message::Type::Signal)
        .path(path.as_str())
        .map_err(failed)?
        .build();
    let signals =
        MessageIterator::for_match_rule(rule, connection, Some(QUEUED_SIGNALS)).map_err(failed)?;
    call(connection, &path, "SetHints", &(mode.hints(),))?;
    let execute = || {
        call(connection, &path, method, body)?;
        collect(signals, task)
    };
    match task {
        Some(task) => {
            let cancel_path = path.clone();
            task.cancel
                .while_running(
                    move || {
                        if let Ok(connection) = dbus::system() {
                            let _ = call(connection, &cancel_path, "Cancel", &());
                        }
                    },
                    execute,
                )
                .unwrap_or_else(|| Err(CANCELLED.into()))
        }
        None => execute(),
    }
}

fn call<B>(
    connection: &Connection,
    path: &OwnedObjectPath,
    method: &str,
    body: &B,
) -> Result<(), String>
where
    B: Serialize + DynamicType,
{
    connection
        .call_method(
            Some(SERVICE),
            path.as_str(),
            Some(TRANSACTION),
            method,
            body,
        )
        .map(|_| ())
        .map_err(|error| match error {
            zbus::Error::MethodError(_, Some(message), _) => message,
            error => error.to_string(),
        })
}

fn collect(signals: MessageIterator, task: Option<Task>) -> Result<Outcome, String> {
    let mut outcome = Outcome::default();
    let mut error = None;
    let (mut status, mut percentage) = (0, 101);
    for message in signals {
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
                    && report(&message, &mut status, &mut percentage)
                {
                    task.progress(
                        enums::stage(status),
                        (percentage <= 100).then(|| percentage as f32 / 100.0),
                    );
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

fn report(message: &Message, status: &mut u32, percentage: &mut u32) -> bool {
    let Ok((_, changed, _)) = message
        .body()
        .deserialize::<(String, HashMap<String, OwnedValue>, Vec<String>)>()
    else {
        return false;
    };
    let previous = (*status, *percentage);
    *status = property_u32(&changed, "Status").unwrap_or(*status);
    *percentage = property_u32(&changed, "Percentage").unwrap_or(*percentage);
    previous != (*status, *percentage)
}
