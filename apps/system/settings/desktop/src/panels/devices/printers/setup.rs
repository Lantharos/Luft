use std::collections::HashMap;

use luft_app::dbus::explain;
use luft_app::dbus::service::Service;
use serde::Serialize;
use specta::Type;

const PRINTERS: Service = Service {
    name: "com.lantharos.Printers1",
    path: "/com/lantharos/Printers1",
    interface: "com.lantharos.Printers1",
};

#[derive(Serialize, Type, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum PrinterLink {
    Usb,
    Network,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PrinterDevice {
    uri: String,
    link: PrinterLink,
    name: String,
    model: String,
    device_id: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PrinterDriver {
    name: String,
    description: String,
    suits: bool,
}

const NETWORK_SCHEMES: [&str; 3] = ["dnssd://", "ipp://", "ipps://"];

fn device(
    (uri, _, name, model, device_id): (String, String, String, String, String),
) -> Option<PrinterDevice> {
    let link = if uri.starts_with("usb://") {
        PrinterLink::Usb
    } else if NETWORK_SCHEMES.iter().any(|scheme| uri.starts_with(scheme)) {
        PrinterLink::Network
    } else {
        return None;
    };
    Some(PrinterDevice {
        uri,
        link,
        name,
        model,
        device_id,
    })
}

async fn call<B, R>(method: &str, body: &B) -> Result<R, String>
where
    B: Serialize + zbus::DynamicType,
    R: for<'d> zbus::wire::DynamicDeserialize<'d>,
{
    PRINTERS
        .change(method, body)
        .await
        .map_err(|error| explain(&error))
}

pub async fn devices() -> Result<Vec<PrinterDevice>, String> {
    let found: Vec<(String, String, String, String, String)> = call("Devices", &()).await?;
    Ok(found.into_iter().filter_map(device).collect())
}

pub async fn drivers(device_id: &str, model: &str) -> Result<Vec<PrinterDriver>, String> {
    let found: Vec<(String, String, bool)> = call("Drivers", &(device_id, model)).await?;
    Ok(found
        .into_iter()
        .map(|(name, description, suits)| PrinterDriver {
            name,
            description,
            suits,
        })
        .collect())
}

pub async fn add(device: &str, driver: &str, name: &str, location: &str) -> Result<String, String> {
    call("Add", &(device, driver, name, location)).await
}

pub async fn remove(name: &str) -> Result<(), String> {
    call("Remove", &name).await
}

pub async fn configure(name: &str, options: &HashMap<String, String>) -> Result<(), String> {
    call("Configure", &(name, options)).await
}
