use serde_json::Value;

pub use super::regional::hints;
use super::{link, logs};
use crate::app::Events;
use crate::app::job::Failed;
use crate::check::facts::Platform;
use crate::protocol::Call;

pub const PLATFORM: Platform = Platform::Linux;

pub fn call(events: &Events, call: Call) -> Result<Value, Failed> {
    link::call(events, call)
}

pub fn belongings() -> Result<Value, Failed> {
    Err(Failed::from(
        "Luft keeps your files in place on Linux, so there's nothing to pack.".to_owned(),
    ))
}

pub fn pick_iso() -> Option<String> {
    rfd::FileDialog::new()
        .set_title("Choose a Luft ISO")
        .add_filter("Luft ISO", &["iso"])
        .pick_file()
        .map(|path| path.to_string_lossy().into_owned())
}

pub fn save_logs() -> Result<Option<String>, Failed> {
    Ok(logs::save()?)
}

pub fn show_file(path: &str) -> Result<(), Failed> {
    Ok(logs::show(path)?)
}
