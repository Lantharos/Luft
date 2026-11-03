use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

fn path() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_default()
        .join("luft/blocked-appimages.json")
}

/// The AppImages schelf.store pulled, each with the store id it was installed
/// as, which its sandbox refuses to start.
pub fn blocked() -> BTreeMap<String, String> {
    fs::read(path())
        .ok()
        .and_then(|bytes| serde_json::from_slice(&bytes).ok())
        .unwrap_or_default()
}

pub fn set_blocked(apps: &BTreeMap<String, String>) -> Result<(), String> {
    let path = path();
    let partial = path.with_extension("json.partial");
    let text = serde_json::to_vec(apps).map_err(|error| error.to_string())?;
    path.parent()
        .map_or(Ok(()), fs::create_dir_all)
        .and_then(|()| fs::write(&partial, text))
        .and_then(|()| fs::rename(&partial, &path))
        .map_err(|error| error.to_string())
}
