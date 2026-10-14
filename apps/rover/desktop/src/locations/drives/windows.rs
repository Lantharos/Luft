use std::collections::HashMap;
use std::path::Path;

use luft_app::dbus;
use serde::{Deserialize, Serialize};
use zbus::zvariant::Value;

const SERVICE: &str = "com.lantharos.Windows1";
const PATH: &str = "/com/lantharos/Windows1";
const UDISKS: &str = "org.freedesktop.UDisks2";
const BLOCK_DEVICES: &str = "/org/freedesktop/UDisks2/block_devices";
const FILESYSTEM: &str = "org.freedesktop.UDisks2.Filesystem";

#[derive(Deserialize)]
struct Drive {
    device: String,
    label: Option<String>,
    hibernated: bool,
    mounted: bool,
}

#[derive(Serialize)]
pub struct WindowsDrive {
    pub device: String,
    pub name: String,
    pub hibernated: bool,
}

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn closed_windows() -> Vec<WindowsDrive> {
    let drives = dbus::system().and_then(|connection| {
        connection
            .call_method(Some(SERVICE), PATH, Some(SERVICE), "Drives", &())
            .map_err(failed)?
            .body()
            .deserialize::<String>()
            .map_err(failed)
    });
    let Ok(drives) =
        drives.and_then(|text| serde_json::from_str::<Vec<Drive>>(&text).map_err(failed))
    else {
        return Vec::new();
    };
    drives
        .into_iter()
        .filter(|drive| !drive.mounted)
        .map(|drive| WindowsDrive {
            name: drive.label.unwrap_or_else(|| "Windows".to_owned()),
            device: drive.device,
            hibernated: drive.hibernated,
        })
        .collect()
}

pub fn open_windows(device: &str, read_only: bool) -> Result<String, String> {
    let name = Path::new(device)
        .file_name()
        .and_then(|name| name.to_str())
        .filter(|name| name.bytes().all(|byte| byte.is_ascii_alphanumeric()))
        .ok_or("That isn't a drive")?;
    let mut options: HashMap<&str, Value> = HashMap::new();
    if read_only {
        options.insert("options", Value::from("ro"));
    }
    dbus::system()?
        .call_method(
            Some(UDISKS),
            format!("{BLOCK_DEVICES}/{name}").as_str(),
            Some(FILESYSTEM),
            "Mount",
            &(options,),
        )
        .map_err(|error| match error {
            zbus::Error::MethodError(_, Some(text), _) => text,
            other => other.to_string(),
        })?
        .body()
        .deserialize::<String>()
        .map_err(failed)
}
