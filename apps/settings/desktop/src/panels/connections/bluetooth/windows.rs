use luft_app::dbus;
use luft_app::dbus::objects::failed;
use serde::{Deserialize, Serialize};
use zbus::blocking::Proxy;
use zbus::proxy::MethodFlags;

const SERVICE: &str = "com.lantharos.Windows1";
const PATH: &str = "/com/lantharos/Windows1";

#[derive(Deserialize)]
struct Status {
    installations: Vec<Installation>,
}

#[derive(Deserialize)]
struct Installation {
    bluetooth: Vec<Paired>,
}

#[derive(Deserialize, Serialize)]
pub struct Paired {
    device: String,
    name: Option<String>,
}

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system()?, SERVICE, PATH, SERVICE).map_err(failed)
}

pub fn waiting() -> Result<Vec<Paired>, String> {
    let status: String = proxy()?.call("Status", &()).map_err(failed)?;
    let status: Status = serde_json::from_str(&status).map_err(failed)?;
    Ok(status
        .installations
        .into_iter()
        .flat_map(|installation| installation.bluetooth)
        .collect())
}

pub fn import() -> Result<u32, String> {
    proxy()?
        .call_with_flags::<_, _, u32>(
            "ImportBluetooth",
            MethodFlags::AllowInteractiveAuth.into(),
            &(),
        )
        .map_err(|error| match error {
            zbus::Error::MethodError(_, Some(text), _) => text,
            other => other.to_string(),
        })?
        .ok_or_else(|| "Windows' Bluetooth devices weren't brought over".to_owned())
}
