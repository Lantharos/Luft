use luft_app::dbus::{error_message, failed};
use luft_i18n::t;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::properties::{Map, Service, absent, get};
use crate::L10N;

pub const USB_PROTECTION: Service = Service {
    name: "com.lantharos.UsbProtection1",
    path: "/com/lantharos/UsbProtection1",
    interface: "com.lantharos.UsbProtection1",
};

#[derive(Clone, Copy, Serialize, Deserialize, Type)]
#[serde(rename_all = "kebab-case")]
pub enum UsbMode {
    Off,
    WhileLocked,
    NoDrives,
    KnownOnly,
}

impl UsbMode {
    fn name(self) -> &'static str {
        match self {
            Self::Off => "off",
            Self::WhileLocked => "while-locked",
            Self::NoDrives => "no-drives",
            Self::KnownOnly => "known-only",
        }
    }

    fn named(name: &str) -> Self {
        match name {
            "off" => Self::Off,
            "no-drives" => Self::NoDrives,
            "known-only" => Self::KnownOnly,
            _ => Self::WhileLocked,
        }
    }
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UsbDevice {
    id: String,
    name: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct UsbProtection {
    mode: UsbMode,
    waiting: Vec<UsbDevice>,
    trusted: Vec<UsbDevice>,
}

fn devices(properties: &Map, name: &str) -> Vec<UsbDevice> {
    get::<Vec<(String, String)>>(properties, name)
        .unwrap_or_default()
        .into_iter()
        .map(|(id, name)| UsbDevice { id, name })
        .collect()
}

pub async fn read() -> Result<Option<UsbProtection>, String> {
    Ok(USB_PROTECTION
        .read()
        .await?
        .map(|properties| UsbProtection {
            mode: UsbMode::named(&get::<String>(&properties, "Mode").unwrap_or_default()),
            waiting: devices(&properties, "Waiting"),
            trusted: devices(&properties, "Trusted"),
        }))
}

async fn change(method: &str, argument: &str) -> Result<(), String> {
    USB_PROTECTION
        .change(method, &argument)
        .await
        .map_err(|error| match error_message(&error) {
            Some(message) => message.to_owned(),
            None if absent(&error) => t!(L10N, "desktop-security-usb-unavailable"),
            None => failed(error),
        })
}

pub async fn set_mode(mode: UsbMode) -> Result<(), String> {
    change("SetMode", mode.name()).await
}

pub async fn allow(id: String) -> Result<(), String> {
    change("Allow", &id).await
}

pub async fn forget(key: String) -> Result<(), String> {
    change("Forget", &key).await
}
