use serde::Serialize;

use super::properties::{Service, absent, failed, get};

pub const USB_PROTECTION: Service = Service {
    name: "com.lantharos.UsbProtection1",
    path: "/com/lantharos/UsbProtection1",
    interface: "com.lantharos.UsbProtection1",
};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Device {
    id: String,
    name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UsbProtection {
    enabled: bool,
    guarding: bool,
    held: Vec<Device>,
}

pub fn read() -> Result<Option<UsbProtection>, String> {
    Ok(USB_PROTECTION.read()?.map(|properties| {
        let held: Vec<(String, String)> = get(&properties, "Held").unwrap_or_default();
        UsbProtection {
            enabled: get(&properties, "Enabled").unwrap_or_default(),
            guarding: get(&properties, "Guarding").unwrap_or_default(),
            held: held
                .into_iter()
                .map(|(id, name)| Device { id, name })
                .collect(),
        }
    }))
}

pub fn set_enabled(enabled: bool) -> Result<(), String> {
    USB_PROTECTION
        .change("SetEnabled", &enabled)
        .map_err(|error| match error {
            zbus::Error::MethodError(_, Some(message), _) => message,
            error if absent(&error) => "USB protection isn't available on this computer".into(),
            error => failed(error),
        })
}
