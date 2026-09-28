use std::collections::HashMap;
use std::net::Ipv6Addr;

use serde::Serialize;
use zbus::zvariant::OwnedValue;

use super::objects::{Object, Objects};
use super::saved::{self, Kind, Saved};
use super::{ACCESS_POINT, ACTIVE, DEVICE, MANAGER, MANAGER_PATH, WIRED, WIRELESS};

const ETHERNET: u32 = 1;
const WIFI: u32 = 2;

const UNAVAILABLE: u32 = 20;
const DISCONNECTED: u32 = 30;
const ACTIVATED: u32 = 100;

const ACTIVE_ACTIVATING: u32 = 1;
const ACTIVE_ACTIVATED: u32 = 2;

const AP_PRIVACY: u32 = 0x1;
const KEY_PSK: u32 = 0x100;
const KEY_ENTERPRISE: u32 = 0x200;
const KEY_SAE: u32 = 0x400;
const KEY_OWE: u32 = 0x800;

#[derive(Serialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Link {
    Connected,
    Connecting,
    Disconnected,
    Unplugged,
}

#[derive(Serialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Security {
    Open,
    Owe,
    Wep,
    Psk,
    Sae,
    Enterprise,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Details {
    ipv4: Vec<String>,
    ipv6: Vec<String>,
    gateway: Option<String>,
    dns: Vec<String>,
    mac: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WifiNetwork {
    ssid: String,
    strength: u8,
    security: Security,
    saved: Option<String>,
    state: Link,
    details: Option<Details>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Wifi {
    pub device: String,
    enabled: bool,
    hardware_enabled: bool,
    networks: Vec<WifiNetwork>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Wired {
    device: String,
    name: String,
    state: Link,
    speed: Option<u32>,
    details: Option<Details>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Vpn {
    connection: String,
    name: String,
    active: Option<String>,
    state: Link,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Network {
    pub wifi: Option<Wifi>,
    wired: Vec<Wired>,
    vpns: Vec<Vpn>,
    airplane: Option<super::airplane::Airplane>,
}

fn link(device_state: u32) -> Link {
    match device_state {
        ACTIVATED => Link::Connected,
        UNAVAILABLE => Link::Unplugged,
        state if state > DISCONNECTED && state < ACTIVATED => Link::Connecting,
        _ => Link::Disconnected,
    }
}

fn security(access_point: &Object) -> Security {
    let management = access_point.get::<u32>("WpaFlags").unwrap_or(0)
        | access_point.get::<u32>("RsnFlags").unwrap_or(0);
    if management & KEY_PSK != 0 {
        Security::Psk
    } else if management & KEY_SAE != 0 {
        Security::Sae
    } else if management & KEY_ENTERPRISE != 0 {
        Security::Enterprise
    } else if management & KEY_OWE != 0 {
        Security::Owe
    } else if access_point.get::<u32>("Flags").unwrap_or(0) & AP_PRIVACY != 0 {
        Security::Wep
    } else {
        Security::Open
    }
}

fn addresses(config: Option<Object>) -> Vec<String> {
    config
        .and_then(|config| config.get::<Vec<HashMap<String, OwnedValue>>>("AddressData"))
        .unwrap_or_default()
        .into_iter()
        .filter_map(|address| String::try_from(address.get("address")?.try_clone().ok()?).ok())
        .filter(|address| !address.starts_with("fe80:"))
        .collect()
}

fn details(objects: &Objects, device: &Object) -> Details {
    let ipv4 = device
        .link("Ip4Config")
        .and_then(|path| objects.get(&path, "org.freedesktop.NetworkManager.IP4Config"));
    let ipv6 = device
        .link("Ip6Config")
        .and_then(|path| objects.get(&path, "org.freedesktop.NetworkManager.IP6Config"));
    let gateway = |config: Option<Object>| {
        config
            .and_then(|config| config.get::<String>("Gateway"))
            .filter(|gateway| !gateway.is_empty())
    };
    let mut dns: Vec<String> = ipv4
        .and_then(|config| config.get::<Vec<HashMap<String, OwnedValue>>>("NameserverData"))
        .unwrap_or_default()
        .into_iter()
        .filter_map(|server| String::try_from(server.get("address")?.try_clone().ok()?).ok())
        .collect();
    dns.extend(
        ipv6.and_then(|config| config.get::<Vec<Vec<u8>>>("Nameservers"))
            .unwrap_or_default()
            .into_iter()
            .filter_map(|bytes| <[u8; 16]>::try_from(bytes).ok())
            .map(|bytes| Ipv6Addr::from(bytes).to_string()),
    );
    Details {
        ipv4: addresses(ipv4),
        ipv6: addresses(ipv6),
        gateway: gateway(ipv4).or_else(|| gateway(ipv6)),
        dns,
        mac: device.get("HwAddress").unwrap_or_default(),
    }
}

fn devices<'a>(objects: &'a Objects, kind: u32) -> impl Iterator<Item = Object<'a>> {
    objects.implementing(DEVICE).filter(move |device| {
        device.get::<u32>("DeviceType") == Some(kind)
            && device.flag("Managed")
            && device.flag("Real")
    })
}

fn wifi(objects: &Objects, saved: &[Saved]) -> Option<Wifi> {
    let device = devices(objects, WIFI).min_by_key(|device| device.path)?;
    let manager = objects.get(MANAGER_PATH, MANAGER)?;
    let wireless = objects.get(device.path, WIRELESS)?;
    let state: u32 = device.get("State").unwrap_or(0);
    let active_point = wireless.link("ActiveAccessPoint");
    let active_ssid = active_point
        .as_deref()
        .and_then(|path| objects.get(path, ACCESS_POINT))
        .and_then(|point| point.get::<Vec<u8>>("Ssid"));
    let mut networks: HashMap<Vec<u8>, WifiNetwork> = HashMap::new();
    for point in wireless
        .get::<Vec<zbus::zvariant::OwnedObjectPath>>("AccessPoints")
        .unwrap_or_default()
        .iter()
        .filter_map(|path| objects.get(path, ACCESS_POINT))
    {
        let Some(ssid) = point.get::<Vec<u8>>("Ssid").filter(|ssid| !ssid.is_empty()) else {
            continue;
        };
        let strength: u8 = point.get("Strength").unwrap_or(0);
        if networks
            .get(&ssid)
            .is_some_and(|network| network.strength >= strength)
        {
            continue;
        }
        let current = active_ssid.as_ref() == Some(&ssid);
        let network = WifiNetwork {
            ssid: String::from_utf8_lossy(&ssid).into_owned(),
            strength,
            security: security(&point),
            saved: saved
                .iter()
                .find(|saved| matches!(&saved.kind, Kind::Wifi { ssid: known } if *known == ssid))
                .map(|saved| saved.path.clone()),
            state: if current {
                link(state)
            } else {
                Link::Disconnected
            },
            details: (current && state == ACTIVATED).then(|| details(objects, &device)),
        };
        networks.insert(ssid, network);
    }
    let mut networks: Vec<WifiNetwork> = networks.into_values().collect();
    networks.sort_by(|left, right| {
        (right.state != Link::Disconnected)
            .cmp(&(left.state != Link::Disconnected))
            .then(right.strength.cmp(&left.strength))
    });
    Some(Wifi {
        device: device.path.to_owned(),
        enabled: manager.flag("WirelessEnabled"),
        hardware_enabled: manager.flag("WirelessHardwareEnabled"),
        networks,
    })
}

fn wired(objects: &Objects) -> Vec<Wired> {
    let mut wired: Vec<Wired> = devices(objects, ETHERNET)
        .map(|device| {
            let state = link(device.get("State").unwrap_or(0));
            Wired {
                device: device.path.to_owned(),
                name: device.get("Interface").unwrap_or_default(),
                state,
                speed: objects
                    .get(device.path, WIRED)
                    .and_then(|wired| wired.get::<u32>("Speed"))
                    .filter(|speed| *speed > 0 && state == Link::Connected),
                details: (state == Link::Connected).then(|| details(objects, &device)),
            }
        })
        .collect();
    wired.sort_by(|left, right| left.name.cmp(&right.name));
    wired
}

fn vpns(objects: &Objects, saved: &[Saved]) -> Vec<Vpn> {
    let mut vpns: Vec<Vpn> = saved
        .iter()
        .filter(|saved| matches!(saved.kind, Kind::Vpn))
        .map(|saved| {
            let active = objects
                .implementing(ACTIVE)
                .find(|active| active.link("Connection").as_deref() == Some(saved.path.as_str()));
            Vpn {
                connection: saved.path.clone(),
                name: saved.name.clone(),
                active: active.map(|active| active.path.to_owned()),
                state: match active.and_then(|active| active.get::<u32>("State")) {
                    Some(ACTIVE_ACTIVATED) => Link::Connected,
                    Some(ACTIVE_ACTIVATING) => Link::Connecting,
                    _ => Link::Disconnected,
                },
            }
        })
        .collect();
    vpns.sort_by(|left, right| left.name.cmp(&right.name));
    vpns
}

pub fn names(objects: &Objects) -> HashMap<String, String> {
    objects
        .implementing(ACTIVE)
        .flat_map(|active| {
            let name: String = active.get("Id").unwrap_or_default();
            let devices: Vec<zbus::zvariant::OwnedObjectPath> =
                active.get("Devices").unwrap_or_default();
            let tunnel =
                active.flag("Vpn") || active.get::<String>("Type").as_deref() == Some("wireguard");
            devices
                .into_iter()
                .map(|device| device.to_string())
                .chain(tunnel.then(|| active.path.to_owned()))
                .map(move |path| (path, name.clone()))
        })
        .collect()
}

pub fn build(objects: &Objects) -> Network {
    let saved = saved::all(objects);
    Network {
        wifi: wifi(objects, &saved),
        wired: wired(objects),
        vpns: vpns(objects, &saved),
        airplane: super::airplane::state(),
    }
}
