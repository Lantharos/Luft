use luft_app::dbus;
use luft_app::dbus::objects::failed;
use zbus::blocking::Proxy;
use zbus::zvariant::ObjectPath;

use super::network::airplane;
use super::snapshot::Adapter;
use super::{ADAPTER, DEVICE, SERVICE};

fn proxy<'a>(path: &'a str, interface: &'a str) -> Result<Proxy<'a>, String> {
    Proxy::new(dbus::system()?, SERVICE, path, interface).map_err(failed)
}

fn explain(error: zbus::Error) -> String {
    let name = match &error {
        zbus::Error::MethodError(name, _, _) => name.as_str(),
        _ => "",
    };
    let explanation = match name {
        "org.bluez.Error.AuthenticationFailed" => "The code didn't match",
        "org.bluez.Error.AuthenticationCanceled" | "org.bluez.Error.AuthenticationRejected" => {
            "Pairing was canceled"
        }
        "org.bluez.Error.AuthenticationTimeout" => "The device took too long to respond",
        "org.bluez.Error.ConnectionAttemptFailed"
        | "org.bluez.Error.Failed"
        | "org.bluez.Error.NotReady"
        | "org.bluez.Error.NotAvailable" => {
            "Couldn't reach the device. Make sure it's on and nearby."
        }
        "org.bluez.Error.InProgress" => "Still working on the last request",
        _ => "Something went wrong. Try again.",
    };
    explanation.to_owned()
}

fn device_call(path: &str, method: &str) -> Result<(), String> {
    proxy(path, DEVICE)?
        .call_method(method, &())
        .map(drop)
        .map_err(explain)
}

pub fn set_powered(adapter: &Adapter, powered: bool) -> Result<(), String> {
    if powered && adapter.blocked {
        airplane::rfkill()?
            .set_property("BluetoothAirplaneMode", false)
            .map_err(failed)?;
    }
    proxy(&adapter.path, ADAPTER)?
        .set_property("Powered", powered)
        .map_err(failed)
}

pub fn connect(device: &str) -> Result<(), String> {
    device_call(device, "Connect")
}

pub fn disconnect(device: &str) -> Result<(), String> {
    device_call(device, "Disconnect")
}

pub fn cancel_pairing(device: &str) -> Result<(), String> {
    device_call(device, "CancelPairing")
}

pub fn pair(device: &str) -> Result<(), String> {
    device_call(device, "Pair")?;
    proxy(device, DEVICE)?
        .set_property("Trusted", true)
        .map_err(failed)?;
    let _ = connect(device);
    Ok(())
}

pub fn forget(device: &str) -> Result<(), String> {
    let (adapter, _) = device.rsplit_once('/').ok_or("Unknown device")?;
    proxy(adapter, ADAPTER)?
        .call_method(
            "RemoveDevice",
            &(ObjectPath::try_from(device).map_err(failed)?,),
        )
        .map(drop)
        .map_err(explain)
}

pub fn set_trusted(device: &str, trusted: bool) -> Result<(), String> {
    proxy(device, DEVICE)?
        .set_property("Trusted", trusted)
        .map_err(failed)
}

pub fn set_visible(adapter: &Adapter, visible: bool, timeout: u32) -> Result<(), String> {
    let proxy = proxy(&adapter.path, ADAPTER)?;
    proxy
        .set_property("DiscoverableTimeout", timeout)
        .map_err(failed)?;
    proxy.set_property("Discoverable", visible).map_err(failed)
}

pub fn browse(adapter: &Adapter) {
    if adapter.powered
        && !adapter.discovering
        && let Ok(proxy) = proxy(&adapter.path, ADAPTER)
    {
        let _ = proxy.call_method("StartDiscovery", &());
    }
}

pub fn stop_browsing(adapter: &Adapter) {
    if let Ok(proxy) = proxy(&adapter.path, ADAPTER) {
        let _ = proxy.call_method("StopDiscovery", &());
    }
}
