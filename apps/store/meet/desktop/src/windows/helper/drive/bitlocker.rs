#![allow(non_snake_case, non_camel_case_types)]

use std::path::Path;
use std::time::Duration;

use serde::Deserialize;
use wmi::{AuthLevel, WMIConnection};

use crate::check::facts::Encryption;

const NAMESPACE: &str = r"ROOT\CIMV2\Security\MicrosoftVolumeEncryption";
const FULLY_DECRYPTED: u32 = 0;
const FULLY_ENCRYPTED: u32 = 1;
const DECRYPTING: u32 = 3;
const PROTECTION_OFF: u32 = 0;
const POLL: Duration = Duration::from_millis(500);

#[derive(Deserialize)]
struct Win32_EncryptableVolume {
    __Path: String,
    ConversionStatus: Option<u32>,
}

#[derive(Deserialize)]
struct Protection {
    DeviceID: String,
    ConversionStatus: Option<u32>,
    ProtectionStatus: Option<u32>,
}

#[derive(Deserialize)]
struct Returned {
    ReturnValue: u32,
}

#[derive(Deserialize)]
struct Conversion {
    ReturnValue: u32,
    ConversionStatus: u32,
}

pub struct BitLocker {
    wmi: WMIConnection,
}

impl BitLocker {
    pub fn open() -> Result<Self, String> {
        let wmi =
            WMIConnection::with_namespace_path(NAMESPACE).map_err(|error| error.to_string())?;
        wmi.set_proxy_blanket(AuthLevel::PktPrivacy)
            .map_err(|error| error.to_string())?;
        Ok(Self { wmi })
    }

    fn volume(&self, condition: &str) -> Option<Win32_EncryptableVolume> {
        let query = format!("SELECT * FROM Win32_EncryptableVolume WHERE {condition}");
        self.wmi.raw_query(query).ok()?.into_iter().next()
    }

    pub fn of_drive(&self, letter: &str) -> Encryption {
        match self
            .volume(&format!("DriveLetter = '{letter}'"))
            .and_then(|volume| volume.ConversionStatus)
        {
            None | Some(FULLY_DECRYPTED) => Encryption::Off,
            Some(FULLY_ENCRYPTED) => Encryption::On,
            Some(_) => Encryption::Changing,
        }
    }

    pub fn protected(&self) -> Vec<String> {
        self.wmi
            .raw_query::<Protection>(
                "SELECT DeviceID, ConversionStatus, ProtectionStatus FROM Win32_EncryptableVolume",
            )
            .unwrap_or_default()
            .into_iter()
            .filter(|volume| {
                volume
                    .ProtectionStatus
                    .is_some_and(|status| status != PROTECTION_OFF)
                    || volume
                        .ConversionStatus
                        .is_some_and(|status| status != FULLY_DECRYPTED)
            })
            .map(|volume| volume.DeviceID)
            .collect()
    }

    pub fn keep_readable(&self, volume_path: &Path) -> Result<(), String> {
        let device = volume_path.to_string_lossy().replace('\\', "\\\\");
        let Some(volume) = self.volume(&format!("DeviceID = '{device}'")) else {
            return Ok(());
        };
        match volume.ConversionStatus {
            None | Some(FULLY_DECRYPTED) => return Ok(()),
            Some(DECRYPTING) => {}
            Some(_) => {
                let returned: Returned = self
                    .wmi
                    .exec_instance_method::<Win32_EncryptableVolume, _>(
                        &volume.__Path,
                        "Decrypt",
                        (),
                    )
                    .map_err(|error| error.to_string())?;
                if returned.ReturnValue != 0 {
                    return Err(format!(
                        "BitLocker kept Luft's partition locked (error {:#x})",
                        returned.ReturnValue
                    ));
                }
            }
        }
        loop {
            let conversion: Conversion = self
                .wmi
                .exec_instance_method::<Win32_EncryptableVolume, _>(
                    &volume.__Path,
                    "GetConversionStatus",
                    (),
                )
                .map_err(|error| error.to_string())?;
            if conversion.ReturnValue != 0 || conversion.ConversionStatus == FULLY_DECRYPTED {
                return Ok(());
            }
            std::thread::sleep(POLL);
        }
    }
}
