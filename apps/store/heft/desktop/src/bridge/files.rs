use std::path::Path;

use sabine::{BridgeCommand, BridgeError, BridgeResponse, BridgeResult, SabineWindow};

use crate::library::{disk, resolve};

fn param<'a>(command: &'a BridgeCommand, name: &str) -> Result<&'a str, BridgeError> {
    command.params[name]
        .as_str()
        .ok_or_else(|| BridgeError::new(format!("`{name}` is missing")))
}

fn inside(command: &BridgeCommand) -> Result<std::path::PathBuf, BridgeError> {
    resolve(param(command, "path")?).map_err(BridgeError::new)
}

fn body(command: &BridgeCommand) -> &[u8] {
    command.body.as_deref().unwrap_or_default()
}

fn done(result: Result<(), String>) -> BridgeResult {
    result.map_err(BridgeError::new)?;
    Ok(BridgeResponse::json(serde_json::Value::Null))
}

fn read(command: BridgeCommand) -> BridgeResult {
    let bytes = disk::read(&inside(&command)?).map_err(BridgeError::new)?;
    Ok(BridgeResponse::bytes(bytes))
}

fn append(command: BridgeCommand) -> BridgeResult {
    done(disk::append(&inside(&command)?, body(&command)))
}

fn replace(command: BridgeCommand) -> BridgeResult {
    done(disk::replace(&inside(&command)?, body(&command)))
}

fn export(command: BridgeCommand) -> BridgeResult {
    let path = Path::new(param(&command, "path")?);
    if !path.is_absolute() {
        return Err(BridgeError::new("Exports go to a full path"));
    }
    done(disk::replace(path, body(&command)))
}

fn read_outside(command: BridgeCommand) -> BridgeResult {
    let path = Path::new(param(&command, "path")?);
    let bytes = std::fs::read(path).map_err(|error| BridgeError::new(error.to_string()))?;
    Ok(BridgeResponse::bytes(bytes))
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .bridge_handler("file_read", read)
        .bridge_handler("file_append", append)
        .bridge_handler("file_replace", replace)
        .bridge_handler("file_export", export)
        .bridge_handler("file_read_outside", read_outside)
}
