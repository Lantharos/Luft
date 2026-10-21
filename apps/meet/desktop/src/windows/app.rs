use std::collections::HashMap;

use luft_meet::resize::ROOT_TYPE;
use serde_json::Value;
use wmi::{Variant, WMIConnection};

pub use super::regional::hints;
use super::{belongings, dialog, link, logs};
use crate::app::Events;
use crate::app::job::Failed;
use crate::check::facts::Platform;
use crate::protocol::Call;

pub const PLATFORM: Platform = Platform::Windows;

pub fn call(events: &Events, call: Call) -> Result<Value, Failed> {
    link::call(events, call)
}

pub fn luft_installed() -> bool {
    WMIConnection::with_namespace_path(r"ROOT\Microsoft\Windows\Storage")
        .ok()
        .and_then(|wmi| {
            wmi.raw_query::<HashMap<String, Variant>>(format!(
                "SELECT DiskNumber FROM MSFT_Partition WHERE GptType = '{{{ROOT_TYPE}}}'"
            ))
            .ok()
        })
        .is_some_and(|found| !found.is_empty())
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
