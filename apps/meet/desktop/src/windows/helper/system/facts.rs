#![allow(non_snake_case, non_camel_case_types)]

use serde::Deserialize;
use windows::Win32::System::SystemInformation::{GetNativeSystemInfo, SYSTEM_INFO};
use windows::Win32::System::SystemInformation::{
    PROCESSOR_ARCHITECTURE_AMD64, PROCESSOR_ARCHITECTURE_ARM64,
};
use wmi::WMIConnection;

use super::{bluetooth, firmware, registry, settings, start_entries};
use crate::check::facts::{Architecture, Device, Encryption, Machine, WindowsFacts};
use crate::check::places::Place;
use crate::plan::layout::{Windows, most_room};
use crate::windows::helper::drive::bitlocker::BitLocker;
use crate::windows::helper::drive::state::Found;
use crate::windows::helper::drive::storage::{Layout, Storage};

const BIOS: &str = r"HARDWARE\DESCRIPTION\System\BIOS";
const NATIVE_WIFI: u32 = 9;

#[derive(Deserialize)]
struct Win32_Tpm {
    SpecVersion: Option<String>,
}

#[derive(Deserialize)]
struct Win32_VideoController {
    Name: Option<String>,
    PNPDeviceID: Option<String>,
}

#[derive(Deserialize)]
struct MSFT_NetAdapter {
    InterfaceDescription: Option<String>,
    PnPDeviceID: Option<String>,
    NdisPhysicalMedium: Option<u32>,
}

fn architecture() -> Architecture {
    let mut info = SYSTEM_INFO::default();
    unsafe { GetNativeSystemInfo(&mut info) };
    match unsafe { info.Anonymous.Anonymous.wProcessorArchitecture } {
        PROCESSOR_ARCHITECTURE_AMD64 => Architecture::X64,
        PROCESSOR_ARCHITECTURE_ARM64 => Architecture::Arm64,
        _ => Architecture::Other,
    }
}

fn connect(namespace: &str) -> Option<WMIConnection> {
    WMIConnection::with_namespace_path(namespace)
        .inspect_err(|error| eprintln!("Couldn't open {namespace}: {error}"))
        .ok()
}

fn tpm() -> Option<String> {
    let wmi = connect(r"ROOT\CIMV2\Security\MicrosoftTpm")?;
    let tpms: Vec<Win32_Tpm> = wmi.raw_query("SELECT SpecVersion FROM Win32_Tpm").ok()?;
    tpms.into_iter().next()?.SpecVersion
}

fn vendor(device: Option<&str>) -> u16 {
    device
        .and_then(|id| {
            let start = id.to_ascii_uppercase().find("VEN_")? + 4;
            u16::from_str_radix(id.get(start..start + 4)?, 16).ok()
        })
        .unwrap_or(0)
}

pub fn graphics() -> Vec<Device> {
    let Some(wmi) = connect(r"ROOT\CIMV2") else {
        return Vec::new();
    };
    let controllers: Vec<Win32_VideoController> = wmi
        .raw_query("SELECT Name, PNPDeviceID FROM Win32_VideoController")
        .unwrap_or_default();
    controllers
        .into_iter()
        .filter(|controller| {
            controller
                .PNPDeviceID
                .as_deref()
                .is_some_and(|id| id.starts_with("PCI\\"))
        })
        .map(|controller| Device {
            vendor: vendor(controller.PNPDeviceID.as_deref()),
            name: controller.Name.unwrap_or_default(),
        })
        .collect()
}

fn wifi() -> Vec<Device> {
    let Some(wmi) = connect(r"ROOT\StandardCimv2") else {
        return Vec::new();
    };
    let adapters: Vec<MSFT_NetAdapter> = wmi
        .raw_query("SELECT InterfaceDescription, PnPDeviceID, NdisPhysicalMedium FROM MSFT_NetAdapter WHERE HardwareInterface = TRUE")
        .unwrap_or_default();
    adapters
        .into_iter()
        .filter(|adapter| adapter.NdisPhysicalMedium == Some(NATIVE_WIFI))
        .map(|adapter| Device {
            vendor: vendor(adapter.PnPDeviceID.as_deref()),
            name: adapter.InterfaceDescription.unwrap_or_default(),
        })
        .collect()
}

pub fn gather(
    storage: &Storage,
    layout: &Layout,
    windows: &Windows,
    drive: &str,
    found: &Found,
    places: Vec<Place>,
) -> WindowsFacts {
    WindowsFacts {
        machine: Machine {
            architecture: architecture(),
            firmware: firmware::firmware(),
            gpt: layout.gpt(),
            secure_boot: firmware::secure_boot(),
            opens_settings: firmware::opens_settings(),
            maker: registry::string(BIOS, "SystemManufacturer"),
            tpm: tpm(),
            graphics: graphics(),
            wifi: wifi(),
        },
        encryption: BitLocker::open()
            .map_or(Encryption::Off, |bitlocker| bitlocker.of_drive(drive)),
        fast_startup: settings::fast_startup(),
        universal_clock: settings::universal_clock(),
        bluetooth: bluetooth::paired(),
        start_entries: start_entries::stale(
            &storage.all_partitions().unwrap_or_default(),
            found.boot_entry,
        ),
        esp_size: layout.esp_size(&found.made),
        windows_size: windows.partition.size,
        windows_used: windows.used,
        most_room: most_room(&layout.plan_disk(), windows),
        places,
    }
}
