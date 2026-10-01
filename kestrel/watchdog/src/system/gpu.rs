use std::fs;
use std::path::PathBuf;

use crate::incident::Gpu;

const DEVICES: &str = "/sys/bus/pci/devices";
const PCI_IDS: &str = "/usr/share/hwdata/pci.ids";
pub const NVIDIA: u16 = 0x10de;
const DISPLAY_CLASS: u32 = 0x03;
const MIB: u64 = 1024 * 1024;

pub struct Device {
    pub address: String,
    pub path: PathBuf,
    pub vendor: u16,
    pub device: u16,
}

fn read_hex(path: PathBuf) -> Option<u32> {
    let text = fs::read_to_string(path).ok()?;
    u32::from_str_radix(text.trim().trim_start_matches("0x"), 16).ok()
}

pub fn displays() -> Vec<Device> {
    let Ok(entries) = fs::read_dir(DEVICES) else {
        return Vec::new();
    };
    let mut devices: Vec<Device> = entries
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            let class = read_hex(path.join("class"))?;
            (class >> 16 == DISPLAY_CLASS).then_some(())?;
            Some(Device {
                address: entry.file_name().to_string_lossy().into_owned(),
                vendor: read_hex(path.join("vendor"))? as u16,
                device: read_hex(path.join("device"))? as u16,
                path,
            })
        })
        .collect();
    devices.sort_by(|first, second| first.address.cmp(&second.address));
    devices
}

fn catalog_name(vendor: u16, device: u16) -> Option<(String, String)> {
    let ids = fs::read_to_string(PCI_IDS).ok()?;
    let vendor_prefix = format!("{vendor:04x}  ");
    let device_prefix = format!("\t{device:04x}  ");
    let mut lines = ids
        .lines()
        .skip_while(|line| !line.starts_with(&vendor_prefix));
    let vendor_name = lines.next()?[vendor_prefix.len()..].to_owned();
    let device_name = lines
        .take_while(|line| line.starts_with('\t') || line.starts_with('#') || line.is_empty())
        .find_map(|line| line.strip_prefix(&device_prefix))?
        .to_owned();
    Some((vendor_name, device_name))
}

pub fn name(device: &Device) -> String {
    let Some((vendor, model)) = catalog_name(device.vendor, device.device) else {
        return format!("Graphics card {:04x}:{:04x}", device.vendor, device.device);
    };
    let brand = vendor
        .split_whitespace()
        .next()
        .unwrap_or(&vendor)
        .to_owned();
    match model
        .split_once('[')
        .and_then(|(_, rest)| rest.split_once(']'))
    {
        Some((marketing, _)) => format!("{brand} {marketing}"),
        None => format!("{brand} {model}"),
    }
}

pub fn bar_size(device: &Device, index: usize) -> Option<u64> {
    let resources = fs::read_to_string(device.path.join("resource")).ok()?;
    let mut fields = resources.lines().nth(index)?.split_whitespace();
    let start = u64::from_str_radix(fields.next()?.trim_start_matches("0x"), 16).ok()?;
    let end = u64::from_str_radix(fields.next()?.trim_start_matches("0x"), 16).ok()?;
    (end > start).then(|| end - start + 1)
}

fn driver_version(device: &Device) -> Option<String> {
    let driver = fs::read_link(device.path.join("driver")).ok()?;
    let module = driver.file_name()?.to_string_lossy().into_owned();
    let version = fs::read_to_string(format!("/sys/module/{module}/version")).ok();
    Some(match version {
        Some(version) => format!("{module} {}", version.trim()),
        None => module,
    })
}

pub fn describe() -> Vec<Gpu> {
    displays()
        .iter()
        .map(|device| Gpu {
            name: name(device),
            pci: device.address.clone(),
            driver: driver_version(device),
            bar1_mib: (device.vendor == NVIDIA)
                .then(|| bar_size(device, 1))
                .flatten()
                .map(|size| size / MIB),
        })
        .collect()
}
