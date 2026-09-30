use std::collections::HashMap;
use std::ffi::CStr;
use std::fs;
use std::net::{Ipv4Addr, Ipv6Addr};
use std::path::Path;

use serde::Serialize;

use super::procfile::{ProcFile, link_name, read_number, read_text, udev_property};

const NET: &str = "/sys/class/net";

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NetworkInfo {
    pub id: String,
    name: String,
    kind: &'static str,
    #[serde(rename = "virtual")]
    is_virtual: bool,
    model: Option<String>,
    vendor: Option<String>,
    driver: Option<String>,
    mac: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NetworkSample {
    id: String,
    received: f64,
    sent: f64,
    received_total: u64,
    sent_total: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    link: Option<Link>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Link {
    connected: bool,
    speed: Option<u32>,
    mtu: Option<u32>,
    signal: Option<f32>,
    addresses: Vec<String>,
}

struct Interface {
    info: NetworkInfo,
    received: Option<ProcFile>,
    sent: Option<ProcFile>,
    previous: Option<(u64, u64)>,
}

pub struct Networks {
    names: Vec<String>,
    interfaces: Vec<Interface>,
}

impl Networks {
    pub fn new() -> Self {
        let mut networks = Self {
            names: Vec::new(),
            interfaces: Vec::new(),
        };
        networks.refresh();
        networks
    }

    pub fn infos(&self) -> Vec<NetworkInfo> {
        self.interfaces
            .iter()
            .map(|interface| interface.info.clone())
            .collect()
    }

    pub fn refresh(&mut self) -> bool {
        let names = interface_names();
        if names == self.names {
            return false;
        }
        let mut previous: HashMap<String, Interface> = self
            .interfaces
            .drain(..)
            .map(|interface| (interface.info.name.clone(), interface))
            .collect();
        self.interfaces = names
            .iter()
            .filter_map(|name| previous.remove(name).or_else(|| Interface::open(name)))
            .collect();
        self.names = names;
        true
    }

    pub fn sample(&mut self, elapsed: f64, detailed: Option<&str>) -> Vec<NetworkSample> {
        self.interfaces
            .iter_mut()
            .map(|interface| {
                let now = (
                    interface
                        .received
                        .as_mut()
                        .and_then(ProcFile::number)
                        .unwrap_or(0),
                    interface
                        .sent
                        .as_mut()
                        .and_then(ProcFile::number)
                        .unwrap_or(0),
                );
                let before = interface.previous.replace(now).unwrap_or(now);
                let rate = |now: u64, before: u64| now.saturating_sub(before) as f64 / elapsed;
                NetworkSample {
                    id: interface.info.id.clone(),
                    received: rate(now.0, before.0),
                    sent: rate(now.1, before.1),
                    received_total: now.0,
                    sent_total: now.1,
                    link: (detailed == Some(interface.info.id.as_str()))
                        .then(|| link(&interface.info.name)),
                }
            })
            .collect()
    }
}

impl Interface {
    fn open(name: &str) -> Option<Self> {
        let path = Path::new(NET).join(name);
        let kind = kind(name, &path)?;
        let physical = path.join("device").exists();
        let index = read_text(path.join("ifindex")).unwrap_or_default();
        let udev = format!("n{index}");
        let statistic = |file: &str| ProcFile::open(path.join("statistics").join(file)).ok();
        Some(Self {
            info: NetworkInfo {
                id: format!("net:{name}"),
                name: name.to_owned(),
                kind,
                is_virtual: !physical,
                model: udev_property(&udev, "ID_MODEL_FROM_DATABASE"),
                vendor: udev_property(&udev, "ID_VENDOR_FROM_DATABASE"),
                driver: link_name(path.join("device/driver")),
                mac: read_text(path.join("address")).filter(|mac| mac != "00:00:00:00:00:00"),
            },
            received: statistic("rx_bytes"),
            sent: statistic("tx_bytes"),
            previous: None,
        })
    }
}

fn interface_names() -> Vec<String> {
    let Ok(entries) = fs::read_dir(NET) else {
        return Vec::new();
    };
    let mut names: Vec<String> = entries
        .flatten()
        .filter_map(|entry| entry.file_name().into_string().ok())
        .filter(|name| name != "lo")
        .collect();
    names.sort_unstable();
    names
}

fn kind(name: &str, path: &Path) -> Option<&'static str> {
    let kind = read_number::<u32>(path.join("type"))?;
    Some(match kind {
        772 => return None,
        _ if path.join("wireless").exists() || path.join("phy80211").exists() => "wifi",
        _ if path.join("bridge").exists() => "bridge",
        _ if path.join("tun_flags").exists() || kind == 65534 => "vpn",
        _ if name.starts_with("wwan") || kind == 519 => "mobile",
        _ if !path.join("device").exists() => "virtual",
        _ => "ethernet",
    })
}

fn link(name: &str) -> Link {
    let path = Path::new(NET).join(name);
    Link {
        connected: read_text(path.join("operstate"))
            .is_some_and(|state| state == "up" || state == "unknown")
            && read_number::<u8>(path.join("carrier")) == Some(1),
        speed: read_number::<i64>(path.join("speed"))
            .filter(|speed| *speed > 0)
            .map(|speed| speed as u32),
        mtu: read_number(path.join("mtu")),
        signal: signal(name),
        addresses: addresses(name),
    }
}

fn signal(name: &str) -> Option<f32> {
    let text = fs::read_to_string("/proc/net/wireless").ok()?;
    text.lines().find_map(|line| {
        let (interface, values) = line.trim_start().split_once(':')?;
        if interface != name {
            return None;
        }
        values
            .split_ascii_whitespace()
            .nth(2)?
            .trim_end_matches('.')
            .parse()
            .ok()
    })
}

fn addresses(name: &str) -> Vec<String> {
    let mut list: *mut libc::ifaddrs = std::ptr::null_mut();
    if unsafe { libc::getifaddrs(&mut list) } != 0 {
        return Vec::new();
    }
    let mut addresses = Vec::new();
    let mut cursor = list;
    while let Some(entry) = unsafe { cursor.as_ref() } {
        cursor = entry.ifa_next;
        let matches = !entry.ifa_name.is_null()
            && unsafe { CStr::from_ptr(entry.ifa_name) }.to_bytes() == name.as_bytes();
        if !matches || entry.ifa_addr.is_null() {
            continue;
        }
        let family = unsafe { (*entry.ifa_addr).sa_family } as i32;
        let address = match family {
            libc::AF_INET => {
                let address = unsafe { &*(entry.ifa_addr as *const libc::sockaddr_in) };
                let prefix = prefix_of(entry.ifa_netmask, family);
                format!(
                    "{}/{prefix}",
                    Ipv4Addr::from(u32::from_be(address.sin_addr.s_addr))
                )
            }
            libc::AF_INET6 => {
                let address = unsafe { &*(entry.ifa_addr as *const libc::sockaddr_in6) };
                let prefix = prefix_of(entry.ifa_netmask, family);
                format!("{}/{prefix}", Ipv6Addr::from(address.sin6_addr.s6_addr))
            }
            _ => continue,
        };
        addresses.push(address);
    }
    unsafe { libc::freeifaddrs(list) };
    addresses
}

fn prefix_of(mask: *const libc::sockaddr, family: i32) -> u32 {
    if mask.is_null() {
        return 0;
    }
    match family {
        libc::AF_INET => {
            unsafe { (*(mask as *const libc::sockaddr_in)).sin_addr.s_addr }.count_ones()
        }
        _ => unsafe { (*(mask as *const libc::sockaddr_in6)).sin6_addr.s6_addr }
            .iter()
            .map(|byte| byte.count_ones())
            .sum(),
    }
}
