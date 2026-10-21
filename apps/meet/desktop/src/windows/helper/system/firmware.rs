use luft_i18n::t;
use windows::Win32::Foundation::{ERROR_ENVVAR_NOT_FOUND, ERROR_INVALID_FUNCTION};
use windows::Win32::Security::{SE_SHUTDOWN_NAME, SE_SYSTEM_ENVIRONMENT_NAME};
use windows::Win32::System::Shutdown::{
    InitiateSystemShutdownExW, SHTDN_REASON_FLAG_PLANNED, SHTDN_REASON_MAJOR_OTHER,
};
use windows::Win32::System::SystemInformation::{FIRMWARE_TYPE, FirmwareTypeUefi, GetFirmwareType};
use windows::Win32::System::WindowsProgramming::{
    GetFirmwareEnvironmentVariableExW, SetFirmwareEnvironmentVariableExW,
};
use windows::core::HSTRING;

use super::privilege::enable;
use crate::L10N;
use crate::boot::entries::Variables;
use crate::boot::gpt;
use crate::boot::load_option::{self, Partition};
use crate::check::facts::Firmware;
use crate::windows::helper::drive::raw::RawDisk;

const GLOBAL_VARIABLES: &str = "{8BE4DF61-93CA-11D2-AA0D-00E098032B8C}";
const NON_VOLATILE: u32 = 0x1;
const BOOT_SERVICE: u32 = 0x2;
const RUNTIME: u32 = 0x4;
const LARGEST_VARIABLE: usize = 4096;
const BOOT_TO_SETTINGS: u64 = 0x1;

pub fn firmware() -> Firmware {
    let mut kind = FIRMWARE_TYPE::default();
    match unsafe { GetFirmwareType(&mut kind) } {
        Ok(()) if kind == FirmwareTypeUefi => Firmware::Uefi,
        _ => Firmware::Bios,
    }
}

pub fn read_variable(vendor: &str, name: &str) -> Result<Option<Vec<u8>>, String> {
    enable(SE_SYSTEM_ENVIRONMENT_NAME)?;
    let mut buffer = vec![0u8; LARGEST_VARIABLE];
    let length = unsafe {
        GetFirmwareEnvironmentVariableExW(
            &HSTRING::from(name),
            &HSTRING::from(vendor),
            Some(buffer.as_mut_ptr().cast()),
            buffer.len() as u32,
            None,
        )
    };
    if length == 0 {
        let error = windows::core::Error::from_thread();
        if error.code() == ERROR_ENVVAR_NOT_FOUND.to_hresult() {
            return Ok(None);
        }
        if error.code() == ERROR_INVALID_FUNCTION.to_hresult() {
            return Err(t!(L10N, "firmware-not-uefi"));
        }
        return Err(t!(
            L10N,
            "firmware-variable-unreadable",
            name = name,
            error = error.to_string()
        ));
    }
    buffer.truncate(length as usize);
    Ok(Some(buffer))
}

pub fn write_variable(vendor: &str, name: &str, data: &[u8]) -> Result<(), String> {
    enable(SE_SYSTEM_ENVIRONMENT_NAME)?;
    unsafe {
        SetFirmwareEnvironmentVariableExW(
            &HSTRING::from(name),
            &HSTRING::from(vendor),
            (!data.is_empty()).then_some(data.as_ptr().cast()),
            data.len() as u32,
            NON_VOLATILE | BOOT_SERVICE | RUNTIME,
        )
    }
    .map_err(|error| {
        t!(
            L10N,
            "firmware-variable-not-saved",
            name = name,
            error = error.to_string()
        )
    })
}

pub fn secure_boot() -> Option<bool> {
    read("SecureBoot")
        .ok()
        .flatten()
        .map(|value| value.first() == Some(&1))
}

fn read(name: &str) -> Result<Option<Vec<u8>>, String> {
    read_variable(GLOBAL_VARIABLES, name)
}

fn write(name: &str, data: &[u8]) -> Result<(), String> {
    write_variable(GLOBAL_VARIABLES, name, data)
}

fn indications(name: &str) -> Result<u64, String> {
    let value = read(name)?.unwrap_or_default();
    let length = value.len().min(8);
    let mut bytes = [0u8; 8];
    bytes[..length].copy_from_slice(&value[..length]);
    Ok(u64::from_le_bytes(bytes))
}

pub fn opens_settings() -> bool {
    indications("OsIndicationsSupported").is_ok_and(|bits| bits & BOOT_TO_SETTINGS != 0)
}

pub fn restart_into_settings() -> Result<(), String> {
    let bits = indications("OsIndications")? | BOOT_TO_SETTINGS;
    write("OsIndications", &bits.to_le_bytes())?;
    restart()
}

pub fn partition_on_disk(disk: u32, sector: u64, guid: &str) -> Result<Partition, String> {
    let guid = load_option::guid_bytes(guid).ok_or_else(|| t!(L10N, "drive-guid-unreadable"))?;
    let (header, table) = RawDisk::open(disk, sector as u32)?.table()?;
    gpt::find(&header, &table, &guid).ok_or_else(|| t!(L10N, "drive-start-partition-not-listed"))
}

pub struct Nvram;

impl Variables for Nvram {
    fn read(&self, name: &str) -> Result<Option<Vec<u8>>, String> {
        read(name)
    }

    fn write(&self, name: &str, data: &[u8]) -> Result<(), String> {
        write(name, data)
    }
}

pub fn restart() -> Result<(), String> {
    enable(SE_SHUTDOWN_NAME)?;
    unsafe {
        InitiateSystemShutdownExW(
            None,
            None,
            0,
            false,
            true,
            SHTDN_REASON_MAJOR_OTHER | SHTDN_REASON_FLAG_PLANNED,
        )
    }
    .map_err(|error| {
        t!(
            L10N,
            "helper-windows-restart-failed",
            error = error.to_string()
        )
    })
}
