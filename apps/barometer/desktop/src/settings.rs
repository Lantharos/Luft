use std::fs;
use std::path::PathBuf;

use serde_json::Value;

fn path() -> Option<PathBuf> {
    Some(dirs::config_dir()?.join("barometer").join("settings.json"))
}

pub fn read() -> Option<Value> {
    serde_json::from_slice(&fs::read(path()?).ok()?).ok()
}

pub fn write(settings: Value) -> Result<(), String> {
    let path = path().ok_or("There's no configuration folder")?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let temporary = path.with_extension("json.tmp");
    fs::write(&temporary, settings.to_string()).map_err(|error| error.to_string())?;
    fs::rename(&temporary, &path).map_err(|error| error.to_string())
}
