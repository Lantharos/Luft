use luft_app::dbus::{self, failed};
use luft_i18n::t;
use serde::{Deserialize, Serialize};
use zbus::Proxy;
use zbus::proxy::MethodFlags;

use crate::L10N;

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

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::system().await?, SERVICE, PATH, SERVICE)
        .await
        .map_err(failed)
}

pub async fn waiting() -> Result<Vec<Paired>, String> {
    let status: String = proxy().await?.call("Status", &()).await.map_err(failed)?;
    let status: Status = serde_json::from_str(&status).map_err(failed)?;
    Ok(status
        .installations
        .into_iter()
        .flat_map(|installation| installation.bluetooth)
        .collect())
}

pub async fn import() -> Result<u32, String> {
    proxy()
        .await?
        .call_with_flags::<_, _, u32>("ImportBluetooth", MethodFlags::ALLOW_INTERACTIVE_AUTH, &())
        .await
        .map_err(|error| dbus::explain(&error))?
        .ok_or_else(|| t!(L10N, "desktop-bluetooth-windows-import-failed"))
}
