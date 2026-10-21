use serde_json::Value;

pub use super::installed::luft_installed;
use super::job::Failed;
pub use super::regional::hints;
use super::{Events, belongings, dialog, link, logs};
use crate::check::facts::Platform;
use crate::protocol::Call;

pub const PLATFORM: Platform = Platform::Windows;

pub fn call(events: &Events, call: Call) -> Result<Value, Failed> {
    link::call(events, call)
}

pub fn belongings() -> Result<Value, Failed> {
    serde_json::to_value(belongings::gather()).map_err(|error| Failed::from(error.to_string()))
}

pub fn pick_iso() -> Option<String> {
    dialog::pick_iso()
}

pub fn save_logs() -> Result<Option<String>, Failed> {
    Ok(logs::save()?)
}

pub fn show_file(path: &str) -> Result<(), Failed> {
    Ok(logs::show(path)?)
}
