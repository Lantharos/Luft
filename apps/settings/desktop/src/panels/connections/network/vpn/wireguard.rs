use std::collections::HashMap;
use std::net::IpAddr;

use gio::glib;
use luft_app::dbus;
use luft_app::dbus::objects::failed;
use serde::{Deserialize, Serialize};
use x25519_dalek::{X25519_BASEPOINT_BYTES, x25519};
use zbus::blocking::Proxy;
use zbus::proxy::MethodFlags;
use zbus::zvariant::{OwnedObjectPath, OwnedValue, Value};

use super::super::profile::settings::{Group, Settings, put};
use super::super::profile::{explain, ip, owner};
use super::super::{SERVICE, SETTINGS, SETTINGS_PATH};

const TYPE: &str = "wireguard";
const TO_DISK: u32 = 0x1;
const INTERFACE_LENGTH: usize = 15;

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Peer {
    public_key: String,
    preshared_key: String,
    endpoint: String,
    allowed_ips: Vec<String>,
    keepalive: Option<u32>,
}

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct WireGuard {
    name: String,
    private_key: String,
    addresses: Vec<String>,
    dns: Vec<String>,
    mtu: Option<u32>,
    listen_port: Option<u32>,
    peers: Vec<Peer>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Keys {
    private_key: String,
    public_key: String,
}

fn key(text: &str, what: &str) -> Result<[u8; 32], String> {
    let text = text.trim();
    let bytes = glib::base64_decode(text);
    let invalid = || format!("The {what} isn't a valid WireGuard key");
    if glib::base64_encode(&bytes) != text {
        return Err(invalid());
    }
    bytes.try_into().map_err(|_| invalid())
}

fn encode(bytes: [u8; 32]) -> String {
    glib::base64_encode(&bytes).to_string()
}

pub fn generate() -> Result<Keys, String> {
    let mut secret = [0_u8; 32];
    getrandom::fill(&mut secret).map_err(failed)?;
    secret[0] &= 248;
    secret[31] &= 127;
    secret[31] |= 64;
    Ok(Keys {
        private_key: encode(secret),
        public_key: encode(x25519(secret, X25519_BASEPOINT_BYTES)),
    })
}

pub fn public_key(private_key: &str) -> Result<String, String> {
    Ok(encode(x25519(
        key(private_key, "private key")?,
        X25519_BASEPOINT_BYTES,
    )))
}

pub fn is_config(text: &str) -> bool {
    text.lines()
        .any(|line| line.trim().eq_ignore_ascii_case("[interface]"))
}

fn list(value: &str) -> Vec<String> {
    value
        .split(',')
        .map(str::trim)
        .filter(|item| !item.is_empty())
        .map(str::to_owned)
        .collect()
}

fn number(value: &str, key: &str) -> Result<Option<u32>, String> {
    value
        .parse()
        .map(Some)
        .map_err(|_| format!("“{value}” isn't a valid {key}"))
}

pub fn parse(text: &str, name: String) -> Result<WireGuard, String> {
    let mut config = WireGuard {
        name,
        ..WireGuard::default()
    };
    let mut in_peer = false;
    for line in text.lines() {
        let line = line.split('#').next().unwrap_or_default().trim();
        if line.eq_ignore_ascii_case("[interface]") {
            in_peer = false;
        } else if line.eq_ignore_ascii_case("[peer]") {
            in_peer = true;
            config.peers.push(Peer::default());
        } else if let Some((key, value)) = line.split_once('=') {
            let value = value.trim();
            match (in_peer, config.peers.last_mut()) {
                (true, Some(peer)) => read_peer(peer, key.trim(), value)?,
                _ => read_interface(&mut config, key.trim(), value)?,
            }
        }
    }
    Ok(config)
}

fn read_interface(config: &mut WireGuard, key: &str, value: &str) -> Result<(), String> {
    match key.to_ascii_lowercase().as_str() {
        "privatekey" => config.private_key = value.to_owned(),
        "address" => config.addresses.extend(list(value)),
        "dns" => config.dns.extend(list(value)),
        "mtu" => config.mtu = number(value, "MTU")?,
        "listenport" => config.listen_port = number(value, "port")?,
        _ => {}
    }
    Ok(())
}

fn read_peer(peer: &mut Peer, key: &str, value: &str) -> Result<(), String> {
    match key.to_ascii_lowercase().as_str() {
        "publickey" => peer.public_key = value.to_owned(),
        "presharedkey" => peer.preshared_key = value.to_owned(),
        "endpoint" => peer.endpoint = value.to_owned(),
        "allowedips" => peer.allowed_ips.extend(list(value)),
        "persistentkeepalive" => peer.keepalive = number(value, "keepalive interval")?,
        _ => {}
    }
    Ok(())
}

fn interface(name: &str) -> String {
    let clean: String = name
        .chars()
        .filter(|ch| ch.is_ascii_alphanumeric() || *ch == '-' || *ch == '_')
        .take(INTERFACE_LENGTH)
        .collect();
    if clean.is_empty() {
        "wg0".to_owned()
    } else {
        clean
    }
}

fn peer(peer: &Peer) -> Result<HashMap<String, Value<'static>>, String> {
    key(&peer.public_key, "server's public key")?;
    let mut entry = HashMap::from([
        (
            "public-key".to_owned(),
            Value::from(peer.public_key.trim().to_owned()),
        ),
        (
            "allowed-ips".to_owned(),
            Value::from(peer.allowed_ips.clone()),
        ),
    ]);
    if !peer.endpoint.is_empty() {
        entry.insert("endpoint".to_owned(), Value::from(peer.endpoint.clone()));
    }
    if !peer.preshared_key.is_empty() {
        key(&peer.preshared_key, "preshared key")?;
        entry.insert(
            "preshared-key".to_owned(),
            Value::from(peer.preshared_key.trim().to_owned()),
        );
        entry.insert("preshared-key-flags".to_owned(), Value::from(0_u32));
    }
    if let Some(keepalive) = peer.keepalive {
        entry.insert("persistent-keepalive".to_owned(), Value::from(keepalive));
    }
    Ok(entry)
}

fn family(config: &WireGuard, v6: bool) -> Result<Group, String> {
    let is_family = |text: &String| text.contains(':') == v6;
    let addresses: Vec<String> = config
        .addresses
        .iter()
        .filter(|text| is_family(text))
        .cloned()
        .collect();
    let servers: Vec<String> = config
        .dns
        .iter()
        .filter(|server| {
            server
                .parse::<IpAddr>()
                .is_ok_and(|address| address.is_ipv6() == v6)
        })
        .cloned()
        .collect();
    let mut group = Group::new();
    put(
        &mut group,
        "method",
        if addresses.is_empty() {
            "disabled"
        } else {
            "manual"
        },
    );
    put(&mut group, "address-data", ip::address_data(&addresses)?);
    put(&mut group, "dns-data", servers);
    if !v6 {
        let domains: Vec<String> = config
            .dns
            .iter()
            .filter(|entry| entry.parse::<IpAddr>().is_err())
            .cloned()
            .collect();
        put(&mut group, "dns-search", domains);
    }
    Ok(group)
}

fn settings(config: &WireGuard) -> Result<Settings, String> {
    let name = config.name.trim();
    if name.is_empty() {
        return Err("Give this VPN a name".to_owned());
    }
    key(&config.private_key, "private key")?;
    if config.peers.is_empty() {
        return Err("This configuration has no server".to_owned());
    }
    let mut general = Group::new();
    put(&mut general, "id", name.to_owned());
    put(&mut general, "uuid", glib::uuid_string_random().to_string());
    put(&mut general, "type", TYPE);
    put(&mut general, "interface-name", interface(name));
    put(&mut general, "autoconnect", false);
    put(&mut general, "permissions", owner());
    let mut wireguard = Group::new();
    put(
        &mut wireguard,
        "private-key",
        config.private_key.trim().to_owned(),
    );
    put(&mut wireguard, "private-key-flags", 0_u32);
    put(
        &mut wireguard,
        "peers",
        config
            .peers
            .iter()
            .map(peer)
            .collect::<Result<Vec<_>, _>>()?,
    );
    if let Some(port) = config.listen_port {
        put(&mut wireguard, "listen-port", port);
    }
    if let Some(mtu) = config.mtu {
        put(&mut wireguard, "mtu", mtu);
    }
    Ok(Settings::from([
        ("connection".to_owned(), general),
        (TYPE.to_owned(), wireguard),
        ("ipv4".to_owned(), family(config, false)?),
        ("ipv6".to_owned(), family(config, true)?),
    ]))
}

pub fn add(config: WireGuard) -> Result<(), String> {
    let settings = settings(&config)?;
    let arguments: HashMap<&str, Value> = HashMap::new();
    Proxy::new(dbus::system()?, SERVICE, SETTINGS_PATH, SETTINGS)
        .map_err(failed)?
        .call_with_flags::<_, _, (OwnedObjectPath, HashMap<String, OwnedValue>)>(
            "AddConnection2",
            MethodFlags::AllowInteractiveAuth.into(),
            &(settings, TO_DISK, arguments),
        )
        .map_err(explain)?;
    Ok(())
}
