use std::collections::HashMap;
use std::path::Path;

use luft_app::dbus::{self, failed};
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::Variant;

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

#[derive(Serialize, Type)]
pub struct WindowsDrive {
    pub device: String,
    pub name: String,
    pub hibernated: bool,
}

async fn drives() -> Result<Vec<Drive>, String> {
    let text = dbus::system()
        .await?
        .call_method(Some(SERVICE), PATH, Some(SERVICE), "Drives", &())
        .await
        .map_err(failed)?
        .body()
        .deserialize::<String>()
        .map_err(failed)?;
    serde_json::from_str(&text).map_err(failed)
}

pub async fn closed_windows() -> Vec<WindowsDrive> {
    let Ok(drives) = drives().await else {
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

pub async fn open_windows(device: &str, read_only: bool) -> Result<String, String> {
    let name = Path::new(device)
        .file_name()
        .and_then(|name| name.to_str())
        .filter(|name| name.bytes().all(|byte| byte.is_ascii_alphanumeric()))
        .ok_or("That isn't a drive")?;
    let mut options: HashMap<&str, Variant> = HashMap::new();
    if read_only {
        options.insert("options", Variant::from("ro"));
    }
    dbus::system()
        .await?
        .call_method(
            Some(UDISKS),
            format!("{BLOCK_DEVICES}/{name}").as_str(),
            Some(FILESYSTEM),
            "Mount",
            &(options,),
        )
        .await
        .map_err(|error| dbus::explain(&error))?
        .body()
        .deserialize::<String>()
        .map_err(failed)
}
