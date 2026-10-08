mod problems;

use std::ffi::CString;
use std::fs;

use gio::prelude::*;
use luft_app::dbus;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::blocking::Proxy;

const DISKS: &str = "com.lantharos.disks.desktop";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct About {
    device_name: String,
    hostname: String,
    system: String,
    kernel: String,
    processor: Option<String>,
    graphics: Vec<String>,
    memory: Option<u64>,
    storage: Option<Storage>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Storage {
    total: u64,
    free: u64,
    manageable: bool,
}

#[derive(Deserialize)]
struct Rename {
    name: String,
}

fn hostnamed() -> Result<Proxy<'static>, String> {
    Proxy::new(
        dbus::system()?,
        "org.freedesktop.hostname1",
        "/org/freedesktop/hostname1",
        "org.freedesktop.hostname1",
    )
    .map_err(|error| error.to_string())
}

fn os_release() -> String {
    let release = fs::read_to_string("/etc/os-release").unwrap_or_default();
    let field = |name: &str| {
        release
            .lines()
            .find_map(|line| line.strip_prefix(name)?.strip_prefix('='))
            .map(|value| value.trim_matches('"').to_owned())
    };
    field("PRETTY_NAME")
        .or_else(|| field("NAME"))
        .unwrap_or_else(|| "Linux".to_owned())
}

fn processor() -> Option<String> {
    let cpuinfo = fs::read_to_string("/proc/cpuinfo").ok()?;
    let model = cpuinfo.lines().find_map(|line| {
        line.strip_prefix("model name")?
            .split_once(':')
            .map(|(_, value)| value.trim().to_owned())
    })?;
    let threads = cpuinfo
        .lines()
        .filter(|line| line.starts_with("processor"))
        .count();
    Some(if threads > 1 {
        format!("{model} × {threads}")
    } else {
        model
    })
}

fn memory() -> Option<u64> {
    let meminfo = fs::read_to_string("/proc/meminfo").ok()?;
    let kilobytes = meminfo
        .lines()
        .find_map(|line| line.strip_prefix("MemTotal:"))?;
    kilobytes
        .trim()
        .trim_end_matches("kB")
        .trim()
        .parse::<u64>()
        .ok()
        .map(|value| value * 1024)
}

fn storage() -> Option<Storage> {
    let root = CString::new("/").ok()?;
    let mut stats = std::mem::MaybeUninit::<libc::statvfs>::uninit();
    if unsafe { libc::statvfs(root.as_ptr(), stats.as_mut_ptr()) } != 0 {
        return None;
    }
    let stats = unsafe { stats.assume_init() };
    Some(Storage {
        total: stats.f_blocks * stats.f_frsize,
        free: stats.f_bavail * stats.f_frsize,
        manageable: gio_unix::DesktopAppInfo::new(DISKS).is_some(),
    })
}

fn graphics() -> Vec<String> {
    let names = fs::read_to_string("/usr/share/hwdata/pci.ids").unwrap_or_default();
    let mut adapters: Vec<String> = fs::read_dir("/sys/class/drm")
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            name.starts_with("card") && !name.contains('-')
        })
        .filter_map(|entry| {
            let device = entry.path().join("device");
            let read = |file: &str| {
                fs::read_to_string(device.join(file))
                    .ok()
                    .map(|id| id.trim().trim_start_matches("0x").to_owned())
            };
            pci_name(&names, &read("vendor")?, &read("device")?)
        })
        .collect();
    adapters.sort();
    adapters.dedup();
    adapters
}

fn pci_name(names: &str, vendor: &str, device: &str) -> Option<String> {
    let mut lines = names.lines().skip_while(|line| !line.starts_with(vendor));
    let vendor_line = lines.next()?;
    let vendor_name = vendor_line[vendor.len()..].trim();
    let device_name = lines
        .take_while(|line| line.starts_with('\t'))
        .find_map(|line| line.strip_prefix('\t')?.strip_prefix(device).map(str::trim))?;
    let short_vendor = vendor_name
        .split(['[', ','])
        .next()
        .unwrap_or(vendor_name)
        .trim();
    let device_name = device_name
        .rsplit_once('[')
        .and_then(|(_, bracket)| bracket.strip_suffix(']'))
        .unwrap_or(device_name);
    Some(format!("{short_vendor} {device_name}"))
}

fn about() -> Result<About, String> {
    let hostnamed = hostnamed()?;
    let hostname: String = hostnamed.get_property("StaticHostname").unwrap_or_default();
    let pretty: String = hostnamed.get_property("PrettyHostname").unwrap_or_default();
    Ok(About {
        device_name: if pretty.is_empty() {
            hostname.clone()
        } else {
            pretty
        },
        hostname,
        system: os_release(),
        kernel: fs::read_to_string("/proc/sys/kernel/osrelease")
            .unwrap_or_default()
            .trim()
            .to_owned(),
        processor: processor(),
        graphics: graphics(),
        memory: memory(),
        storage: storage(),
    })
}

fn open_disks(_: Value) -> Result<(), String> {
    let disks = gio_unix::DesktopAppInfo::new(DISKS).ok_or("Disks isn't installed")?;
    disks
        .launch_uris(&["file:///"], gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

fn rename(Rename { name }: Rename) -> Result<(), String> {
    hostnamed()?
        .call_method("SetPrettyHostname", &(name.trim(), true))
        .map(|_| ())
        .map_err(|error| error.to_string())
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window
        .command("about", |_: Value| about())
        .command("about_rename", rename)
        .command("about_open_disks", open_disks)
        .command("about_problems", |_: Value| problems::problems())
        .command("about_firmware_restart", |_: Value| {
            problems::restart_to_firmware()
        })
}
