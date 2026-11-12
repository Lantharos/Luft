//! What each setting takes and what it is now, however it is kept.

use luft_dbus_macros::introspect;
use serde_json::Value as Json;
use zbus::Variant;
use zbus::proxy;

use super::catalogue::{Choice as Listed, Declared, Keeping, Setting};
use super::gsettings::Key;
use super::kind::{Choice, Kind};
use crate::bus::{self, ChangesProxy};
use crate::failure::{Failure, Outcome};

#[introspect]
#[proxy(
    interface = "com.lantharos.CrashReports1",
    default_service = "com.lantharos.CrashReports1",
    default_path = "/com/lantharos/CrashReports1"
)]
pub trait CrashReports {
    fn set_choice(&self, choice: &str) -> zbus::Result<()>;

    #[zbus(property)]
    fn choice(&self) -> zbus::Result<String>;
}

fn choices(listed: &[Listed]) -> Vec<Choice> {
    listed
        .iter()
        .map(|option| Choice {
            value: option.value.clone(),
            name: option.words(),
            note: option
                .note
                .as_deref()
                .map(|id| super::catalogue::english(id).to_owned()),
        })
        .collect()
}

pub fn kind(setting: &Setting) -> Outcome<Kind> {
    let listed = choices(&setting.options);
    Ok(match (setting.keeping(), setting.declared) {
        (Keeping::Key(key), _) => Key::open(key)?.kind(setting, listed),
        (_, Some(Declared::Switch)) => Kind::Switch { notes: listed },
        (_, Some(Declared::Text)) => Kind::Text,
        _ => Kind::Choice { choices: listed },
    })
}

/// The option of a setting that chooses between whole sets of keys, which
/// the keys as they are now match.
pub fn mapped_now(setting: &Setting) -> Outcome<Json> {
    for option in &setting.options {
        let mut matches = true;
        for (key, condition) in &option.when {
            matches &= condition.holds(&Key::open(key)?.read());
        }
        if matches {
            return Ok(option.value.clone());
        }
    }
    Ok(Json::Null)
}

pub fn to_json(value: &Variant<'_>) -> Json {
    match value {
        Variant::Bool(on) => Json::Bool(*on),
        Variant::Str(text) => Json::String(text.as_str().to_owned()),
        other => Json::String(other.to_string()),
    }
}

async fn system_values(names: &[&str]) -> Outcome<Vec<Json>> {
    if names.is_empty() {
        return Ok(Vec::new());
    }
    let read = ChangesProxy::new(bus::system().await?)
        .await?
        .read(names)
        .await?;
    Ok(read.iter().map(|(_, value)| to_json(value)).collect())
}

async fn service_value(service: &str) -> Outcome<Json> {
    match service {
        "crash-reports" => Ok(Json::String(
            CrashReportsProxy::new(bus::session().await?)
                .await?
                .choice()
                .await?,
        )),
        other => Err(Failure::failed(format!(
            "luft doesn't know the service {other}."
        ))),
    }
}

/// The current value of each setting, reading the system settings in one call.
pub async fn current(settings: &[&Setting]) -> Outcome<Vec<Json>> {
    let names: Vec<&str> = settings
        .iter()
        .filter_map(|setting| match setting.keeping() {
            Keeping::System(name) => Some(name),
            _ => None,
        })
        .collect();
    let mut system = system_values(&names)
        .await
        .unwrap_or_else(|_| vec![Json::Null; names.len()])
        .into_iter();
    let mut values = Vec::with_capacity(settings.len());
    for setting in settings {
        values.push(match setting.keeping() {
            Keeping::Key(key) => Key::open(key)?.read(),
            Keeping::Mapped => mapped_now(setting)?,
            Keeping::System(_) => system.next().unwrap_or(Json::Null),
            Keeping::Service(service) => service_value(service).await.unwrap_or(Json::Null),
        });
    }
    Ok(values)
}

pub async fn set_service(service: &str, value: &Json) -> Outcome {
    match (service, value.as_str()) {
        ("crash-reports", Some(choice)) => Ok(CrashReportsProxy::new(bus::session().await?)
            .await?
            .set_choice(choice)
            .await?),
        _ => Err(Failure::invalid(format!("{value} doesn't fit {service}."))),
    }
}
