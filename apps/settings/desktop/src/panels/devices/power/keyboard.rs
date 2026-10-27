use serde::Serialize;
use specta::Type;
use zbus::{Connection, OwnedObjectPath};

use super::battery::{DESTINATION, PATH};
use super::failed;

const BACKLIGHT: &str = "org.freedesktop.UPower.KbdBacklight";

#[derive(Serialize, Type)]
pub struct Keyboard {
    id: String,
    level: i32,
    max: i32,
}

async fn call(connection: &Connection, path: &str, method: &str) -> Result<i32, String> {
    connection
        .call_method(Some(DESTINATION), path, Some(BACKLIGHT), method, &())
        .await
        .map_err(failed)?
        .body()
        .deserialize()
        .map_err(failed)
}

async fn backlights(connection: &Connection) -> Result<Vec<OwnedObjectPath>, String> {
    connection
        .call_method(
            Some(DESTINATION),
            PATH,
            Some(DESTINATION),
            "EnumerateKbdBacklights",
            &(),
        )
        .await
        .map_err(failed)?
        .body()
        .deserialize()
        .map_err(failed)
}

pub async fn read(connection: &Connection) -> Result<Option<Keyboard>, String> {
    for path in backlights(connection).await? {
        let max = call(connection, path.as_str(), "GetMaxBrightness").await?;
        if max > 0 {
            return Ok(Some(Keyboard {
                level: call(connection, path.as_str(), "GetBrightness").await?,
                id: path.to_string(),
                max,
            }));
        }
    }
    Ok(None)
}

pub async fn set(connection: &Connection, id: &str, level: i32) -> Result<(), String> {
    connection
        .call_method(
            Some(DESTINATION),
            id,
            Some(BACKLIGHT),
            "SetBrightness",
            &level,
        )
        .await
        .map(|_| ())
        .map_err(failed)
}
