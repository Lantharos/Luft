use std::sync::OnceLock;

use futures_util::{Stream, StreamExt};
use luft_app::dbus::{self, failed};
use serde::Serialize;
use zbus::Proxy;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Airplane {
    enabled: bool,
    hardware: bool,
}

const SERVICE: &str = "com.lantharos.Settings.Rfkill";
const PATH: &str = "/com/lantharos/Settings/Rfkill";

static RFKILL: OnceLock<Proxy<'static>> = OnceLock::new();

pub async fn rfkill() -> Result<&'static Proxy<'static>, String> {
    if let Some(proxy) = RFKILL.get() {
        return Ok(proxy);
    }
    let proxy = Proxy::new(dbus::session().await?, SERVICE, PATH, SERVICE)
        .await
        .map_err(failed)?;
    Ok(RFKILL.get_or_init(|| proxy))
}

pub async fn state() -> Option<Airplane> {
    let rfkill = rfkill().await.ok()?;
    let flag = async |name: &str| rfkill.get_property::<bool>(name).await.ok();
    if !flag("ShouldShowAirplaneMode").await? {
        return None;
    }
    Some(Airplane {
        enabled: flag("AirplaneMode").await?,
        hardware: flag("HardwareAirplaneMode").await.unwrap_or(false),
    })
}

pub async fn set(enabled: bool) -> Result<(), String> {
    rfkill()
        .await?
        .set_property("AirplaneMode", enabled)
        .await
        .map_err(failed)
}

/// Every change to airplane mode, as `()`.
pub async fn changes() -> Option<impl Stream<Item = ()>> {
    let connection = dbus::session().await.ok()?;
    let properties = Proxy::new(connection, SERVICE, PATH, "org.freedesktop.DBus.Properties")
        .await
        .ok()?;
    let signals = properties.receive_signal("PropertiesChanged").await.ok()?;
    Some(signals.map(drop))
}
