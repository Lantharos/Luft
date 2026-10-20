mod problems;
mod sample;
mod systems;

use std::ffi::CString;
use std::fs;

use gio::prelude::*;
use luft_app::dbus::{self, failed};
use luft_app::launch::{self, Token};
use luft_app::{Commands, Events};
use luft_i18n::t;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::Proxy;

use crate::L10N;

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

async fn hostnamed() -> Result<Proxy<'static>, String> {
    Proxy::new(
        dbus::system().await?,
        "org.freedesktop.hostname1",
        "/org/freedesktop/hostname1",
        "org.freedesktop.hostname1",
    )
    .await
    .map_err(failed)
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
    let root = CString::new(gio::glib::home_dir().into_os_string().into_encoded_bytes()).ok()?;
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

async fn about(_: Value) -> Result<About, String> {
    let hostnamed = hostnamed().await?;
    let hostname: String = hostnamed
        .get_property("StaticHostname")
        .await
        .unwrap_or_default();
    let pretty: String = hostnamed
        .get_property("PrettyHostname")
        .await
        .unwrap_or_default();
    let device_name = if pretty.is_empty() {
        hostname.clone()
    } else {
        pretty
    };
    if luft_app::sample_system() {
        return Ok(sample::about(device_name, hostname));
    }
    tokio::task::spawn_blocking(move || About {
        device_name,
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
    .await
    .map_err(failed)
}

fn launch_disks(argument: &str, token: Option<&str>) -> Result<(), String> {
    let disks = gio_unix::DesktopAppInfo::new(DISKS)
        .ok_or_else(|| t!(L10N, "desktop-about-disks-missing"))?;
    launch::start(disks.upcast_ref(), &[argument], token).map_err(|error| error.to_string())
}

const HOSTNAME_LENGTH: usize = 63;

fn hostname_for(name: &str) -> String {
    let mut hostname = String::new();
    for character in deunicode::deunicode(name)
        .chars()
        .flat_map(char::to_lowercase)
    {
        if character.is_ascii_alphanumeric() {
            hostname.push(character);
        } else if (character.is_whitespace() || character == '-' || character == '_')
            && !hostname.is_empty()
            && !hostname.ends_with('-')
        {
            hostname.push('-');
        }
    }
    hostname.truncate(HOSTNAME_LENGTH);
    hostname.trim_end_matches('-').to_owned()
}

async fn rename(Rename { name }: Rename) -> Result<(), String> {
    let name = name.trim();
    let hostnamed = hostnamed().await?;
    hostnamed
        .call_method("SetPrettyHostname", &(name, true))
        .await
        .map_err(failed)?;
    let hostname = hostname_for(name);
    if hostname.is_empty() {
        return Ok(());
    }
    hostnamed
        .call_method("SetStaticHostname", &(hostname, true))
        .await
        .map(|_| ())
        .map_err(failed)
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window
        .command_async("about", about)
        .command_async("about_rename", rename)
        .command("about_open_disks", |Token { token }| {
            launch_disks("file:///", token.as_deref())
        })
        .command_async("about_other_systems", |_: Value| systems::list())
        .command("about_remove_system", systems::remove)
        .command("about_problems", |_: Value| problems::problems())
        .command_async("about_firmware_restart", |_: Value| {
            problems::restart_to_firmware()
        })
}
