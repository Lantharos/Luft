use luft_app::dbus::{error_message, failed};
use luft_i18n::t;
use serde::Serialize;
use specta::Type;

use super::properties::{Service, absent, get};
use crate::L10N;

pub const USB_PROTECTION: Service = Service {
    name: "com.lantharos.UsbProtection1",
    path: "/com/lantharos/UsbProtection1",
    interface: "com.lantharos.UsbProtection1",
};

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UsbDevice {
    id: String,
    name: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UsbProtection {
    enabled: bool,
    guarding: bool,
    held: Vec<UsbDevice>,
}

pub async fn read() -> Result<Option<UsbProtection>, String> {
    Ok(USB_PROTECTION.read().await?.map(|properties| {
        let held: Vec<(String, String)> = get(&properties, "Held").unwrap_or_default();
        UsbProtection {
            enabled: get(&properties, "Enabled").unwrap_or_default(),
            guarding: get(&properties, "Guarding").unwrap_or_default(),
            held: held
                .into_iter()
                .map(|(id, name)| UsbDevice { id, name })
                .collect(),
        }
    }))
}

pub async fn set_enabled(enabled: bool) -> Result<(), String> {
    USB_PROTECTION
        .change("SetEnabled", &enabled)
        .await
        .map_err(|error| match error_message(&error) {
            Some(message) => message.to_owned(),
            None if absent(&error) => t!(L10N, "desktop-security-usb-unavailable"),
            None => failed(error),
        })
}
