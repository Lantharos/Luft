use luft_app::dbus::{self, error_name, failed};
use luft_i18n::t;
use zbus::{ObjectPath, Proxy};

use super::network::airplane;
use super::snapshot::Adapter;
use super::{ADAPTER, DEVICE, SERVICE};
use crate::L10N;

async fn proxy<'a>(path: &'a str, interface: &'a str) -> Result<Proxy<'a>, String> {
    Proxy::new(dbus::system().await?, SERVICE, path, interface)
        .await
        .map_err(failed)
}

fn explain(error: zbus::Error) -> String {
    let explanation = match error_name(&error).as_deref().unwrap_or_default() {
        "org.bluez.Error.AuthenticationFailed" => "desktop-bluetooth-code-mismatch",
        "org.bluez.Error.AuthenticationCanceled" | "org.bluez.Error.AuthenticationRejected" => {
            "desktop-bluetooth-pairing-canceled"
        }
        "org.bluez.Error.AuthenticationTimeout" => "desktop-bluetooth-timed-out",
        "org.bluez.Error.ConnectionAttemptFailed"
        | "org.bluez.Error.Failed"
        | "org.bluez.Error.NotReady"
        | "org.bluez.Error.NotAvailable" => "desktop-bluetooth-unreachable",
        "org.bluez.Error.InProgress" => "desktop-bluetooth-busy",
        _ => "desktop-bluetooth-failed",
    };
    t!(L10N, explanation)
}

async fn device_call(path: &str, method: &str) -> Result<(), String> {
    proxy(path, DEVICE)
        .await?
        .call_method(method, &())
        .await
        .map(drop)
        .map_err(explain)
}

pub async fn set_powered(adapter: &Adapter, powered: bool) -> Result<(), String> {
    if powered && adapter.blocked {
        airplane::rfkill()
            .await?
            .set_property("BluetoothAirplaneMode", false)
            .await
            .map_err(failed)?;
    }
    proxy(&adapter.path, ADAPTER)
        .await?
        .set_property("Powered", powered)
        .await
        .map_err(failed)
}

pub async fn connect(device: &str) -> Result<(), String> {
    device_call(device, "Connect").await
}

pub async fn disconnect(device: &str) -> Result<(), String> {
    device_call(device, "Disconnect").await
}

pub async fn cancel_pairing(device: &str) -> Result<(), String> {
    device_call(device, "CancelPairing").await
}

pub async fn pair(device: &str) -> Result<(), String> {
    device_call(device, "Pair").await?;
    proxy(device, DEVICE)
        .await?
        .set_property("Trusted", true)
        .await
        .map_err(failed)?;
    let _ = connect(device).await;
    Ok(())
}

pub async fn forget(device: &str) -> Result<(), String> {
    let (adapter, _) = device
        .rsplit_once('/')
        .ok_or_else(|| t!(L10N, "desktop-bluetooth-unknown-device"))?;
    proxy(adapter, ADAPTER)
        .await?
        .call_method(
            "RemoveDevice",
            &(ObjectPath::try_from(device).map_err(failed)?,),
        )
        .await
        .map(drop)
        .map_err(explain)
}

pub async fn set_trusted(device: &str, trusted: bool) -> Result<(), String> {
    proxy(device, DEVICE)
        .await?
        .set_property("Trusted", trusted)
        .await
        .map_err(failed)
}

pub async fn set_visible(adapter: &Adapter, visible: bool, timeout: u32) -> Result<(), String> {
    let proxy = proxy(&adapter.path, ADAPTER).await?;
    proxy
        .set_property("DiscoverableTimeout", timeout)
        .await
        .map_err(failed)?;
    proxy
        .set_property("Discoverable", visible)
        .await
        .map_err(failed)
}

pub async fn browse(adapter: &Adapter) {
    if adapter.powered
        && !adapter.discovering
        && let Ok(proxy) = proxy(&adapter.path, ADAPTER).await
    {
        let _ = proxy.call_method("StartDiscovery", &()).await;
    }
}

pub async fn stop_browsing(adapter: &Adapter) {
    if let Ok(proxy) = proxy(&adapter.path, ADAPTER).await {
        let _ = proxy.call_method("StopDiscovery", &()).await;
    }
}
