use std::fs;
use std::path::{Path, PathBuf};

use crate::mode::{Mode, Rules};
use crate::trust::{Bus, Identity, Known, Trusted};
use crate::usb::Outcome;

const DEVICES: &str = "/sys/bus/thunderbolt/devices";
const SYSTEM_DEVICES: &str = "/sys/devices/";
const PREFIX: &str = "thunderbolt:";
const HOST_ROUTE: &str = "0";
const DOMAIN: &str = "domain";
const ASKING_LEVELS: [&str; 2] = ["user", "secure"];
const UNNAMED: &str = "Thunderbolt device";

/// Names a Thunderbolt device apart from USB devices, whose sysfs names
/// look the same.
pub fn id(name: &str) -> String {
    format!("{PREFIX}{name}")
}

pub fn named(id: &str) -> Option<&str> {
    id.strip_prefix(PREFIX)
}

fn path(name: &str) -> PathBuf {
    Path::new(DEVICES).join(name)
}

fn read(name: &str, attribute: &str) -> Option<String> {
    let value = fs::read_to_string(path(name).join(attribute)).ok()?;
    Some(value.trim().to_owned()).filter(|value| !value.is_empty())
}

fn hex(name: &str, attribute: &str) -> Option<u16> {
    let value = read(name, attribute)?;
    u16::from_str_radix(value.trim_start_matches("0x"), 16).ok()
}

fn is_device(name: &str) -> bool {
    name.split_once('-')
        .is_some_and(|(_, route)| route != HOST_ROUTE)
        && path(name).join("authorized").exists()
}

fn names() -> impl Iterator<Item = String> {
    fs::read_dir(DEVICES)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| entry.file_name().into_string().ok())
        .filter(|name| is_device(name))
}

fn is_authorized(name: &str) -> bool {
    read(name, "authorized").as_deref() != Some("0")
}

fn authorize(name: &str) {
    let file = path(name).join("authorized");
    if let Err(error) = fs::write(&file, "1") {
        eprintln!("Couldn't connect the Thunderbolt device {name}: {error}");
    }
}

/// Whether the kernel waits for someone to let the device in. At lower
/// security levels the firmware or the kernel connects every device itself.
fn asks(name: &str) -> bool {
    let Ok(device) = fs::canonicalize(path(name)) else {
        return false;
    };
    device
        .ancestors()
        .find(|folder| {
            folder
                .file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.starts_with(DOMAIN))
        })
        .and_then(|domain| fs::read_to_string(domain.join("security")).ok())
        .is_some_and(|level| ASKING_LEVELS.contains(&level.trim()))
}

pub fn exists(name: &str) -> bool {
    path(name).exists()
}

pub fn name(name: &str) -> String {
    match (read(name, "vendor_name"), read(name, "device_name")) {
        (Some(maker), Some(device)) => format!("{maker} {device}"),
        (_, Some(device)) => device,
        _ => UNNAMED.to_owned(),
    }
}

pub fn identity(name: &str) -> Option<Identity> {
    Some(Identity::new(
        Bus::Thunderbolt,
        hex(name, "vendor")?,
        hex(name, "device")?,
        &read(name, "unique_id")?,
        [],
    ))
}

pub fn place(name: &str) -> Option<String> {
    let device = fs::canonicalize(path(name)).ok()?;
    Some(device.to_str()?.strip_prefix(SYSTEM_DEVICES)?.to_owned())
}

fn knows(name: &str, trusted: &Trusted) -> bool {
    identity(name)
        .zip(place(name))
        .is_some_and(|(identity, place)| trusted.knows(&identity, &place))
}

pub fn waiting() -> impl Iterator<Item = String> {
    names()
        .filter(|name| !is_authorized(name))
        .map(|name| id(&name))
}

/// In [`Mode::KnownOnly`] this takes over from boltd, which otherwise decides on
/// Thunderbolt devices as it always has.
pub fn admit(name: &str, rules: Rules, trusted: &Trusted) -> Outcome {
    if rules.mode != Mode::KnownOnly || is_authorized(name) || !asks(name) {
        return Outcome::Connected;
    }
    if !knows(name, trusted) {
        return Outcome::WaitsForApproval;
    }
    authorize(name);
    Outcome::Connected
}

pub fn connected() -> impl Iterator<Item = Known> {
    names()
        .filter(|name| is_authorized(name))
        .filter_map(|name| {
            Some(Known::new(
                identity(&name)?,
                &place(&name)?,
                &self::name(&name),
            ))
        })
}
