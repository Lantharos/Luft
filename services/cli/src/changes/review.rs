//! Asking Kestrel to show a set of changes for review. Kestrel shows it only
//! for luft from the system image, reads every value itself, and makes the
//! changes it showed once someone approves them: what luft sends can't
//! change after it was shown.

use std::collections::HashMap;

use luft_dbus_macros::introspect;
use serde_json::Value as Json;
use zbus::proxy;
use zbus::{OwnedVariant, Variant};

use super::Change;
use super::history::Restore;
use crate::bus;
use crate::failure::{Exit, Failure, Outcome};
use crate::settings::values::to_json;

const ERRORS: &str = "com.lantharos.Kestrel.Changes1.Error.";

type Record = HashMap<String, OwnedVariant>;

#[introspect]
#[proxy(
    interface = "com.lantharos.Kestrel.Changes1",
    default_service = "com.lantharos.Kestrel",
    default_path = "/com/lantharos/Kestrel/Changes"
)]
trait Review {
    fn review(
        &self,
        changes: &[(&str, Variant<'_>)],
    ) -> zbus::Result<(bool, Vec<Record>, String, String)>;
}

pub struct Answer {
    pub approved: bool,
    pub restore: Vec<Restore>,
    pub requester: String,
    pub error: Option<String>,
}

fn variant(value: &Json) -> Variant<'_> {
    match value {
        Json::Bool(on) => Variant::from(*on),
        Json::Number(number) => number.as_i64().map_or_else(
            || Variant::from(number.as_f64().unwrap_or_default()),
            Variant::from,
        ),
        Json::String(text) => Variant::from(text.as_str()),
        other => Variant::from(other.to_string()),
    }
}

fn text(record: &Record, key: &str) -> Option<String> {
    record
        .get(key)
        .and_then(|value| String::try_from(value.try_clone().ok()?).ok())
}

fn restore(record: &Record) -> Option<Restore> {
    let setting = text(record, "setting")?;
    if let Some(key) = text(record, "key") {
        return Some(Restore::Key {
            setting,
            key,
            own: text(record, "own"),
        });
    }
    let value = record.get("value")?;
    Some(Restore::Setting {
        setting,
        value: to_json(value),
    })
}

fn refused(error: zbus::Error) -> Failure {
    if luft_dbus::service::absent(&error) {
        return Failure::unavailable(
            "These changes need someone to review them on the screen, and the desktop isn't running.",
        );
    }
    let message = luft_dbus::explain(&error);
    match luft_dbus::error_name(&error)
        .as_deref()
        .and_then(|name| name.strip_prefix(ERRORS))
    {
        Some("Invalid") => Failure::invalid(message),
        Some(_) => Failure::unavailable(message),
        None => Failure::new(Exit::Failed, message),
    }
}

pub async fn ask(changes: &[(Change, Json)]) -> Outcome<Answer> {
    let sent: Vec<(&str, Variant<'_>)> = changes
        .iter()
        .map(|(change, _)| (change.setting.id.as_str(), variant(&change.value)))
        .collect();
    let kestrel = ReviewProxy::new(bus::session().await?).await?;
    let (approved, records, requester, error) = kestrel.review(&sent).await.map_err(refused)?;
    Ok(Answer {
        approved,
        restore: records.iter().filter_map(restore).collect(),
        requester,
        error: (!error.is_empty()).then_some(error),
    })
}
