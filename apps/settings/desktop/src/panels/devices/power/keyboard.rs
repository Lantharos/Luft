use serde::Serialize;
use zbus::blocking::Connection;
use zbus::zvariant::OwnedObjectPath;

use super::battery::{DESTINATION, PATH};
use super::failed;

const BACKLIGHT: &str = "org.freedesktop.UPower.KbdBacklight";

#[derive(Serialize)]
pub struct Keyboard {
    id: String,
    level: i32,
    max: i32,
}

fn call(connection: &Connection, path: &str, method: &str) -> Result<i32, String> {
    connection
        .call_method(Some(DESTINATION), path, Some(BACKLIGHT), method, &())
        .map_err(failed)?
        .body()
        .deserialize()
        .map_err(failed)
}

fn backlights(connection: &Connection) -> Result<Vec<OwnedObjectPath>, String> {
    connection
        .call_method(
            Some(DESTINATION),
            PATH,
            Some(DESTINATION),
            "EnumerateKbdBacklights",
            &(),
        )
        .map_err(failed)?
        .body()
        .deserialize()
        .map_err(failed)
}

pub fn read(connection: &Connection) -> Result<Option<Keyboard>, String> {
    for path in backlights(connection)? {
        let max = call(connection, path.as_str(), "GetMaxBrightness")?;
        if max > 0 {
            return Ok(Some(Keyboard {
                level: call(connection, path.as_str(), "GetBrightness")?,
                id: path.to_string(),
                max,
            }));
        }
    }
    Ok(None)
}

pub fn set(connection: &Connection, id: &str, level: i32) -> Result<(), String> {
    connection
        .call_method(
            Some(DESTINATION),
            id,
            Some(BACKLIGHT),
            "SetBrightness",
            &level,
        )
        .map(|_| ())
        .map_err(failed)
}
