use serde::Serialize;

use super::properties::{Map, Service, absent, failed, get};

const FWUPD: Service = Service {
    name: "org.freedesktop.fwupd",
    path: "/",
    interface: "org.freedesktop.fwupd",
};

const SUCCESS: u64 = 1 << 0;
const OBSOLETED: u64 = 1 << 1;
const RUNTIME_ISSUE: u64 = 1 << 10;
const CONTACT_MAKER: u64 = 1 << 11;
const FIRMWARE_SETTING: u64 = 1 << 12;
const SYSTEM_SETTING: u64 = 1 << 13;
const HIGHEST_LEVEL: u32 = 5;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
enum Fix {
    Maker,
    Firmware,
    System,
    Unknown,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Protection {
    id: String,
    name: String,
    fix: Fix,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostSecurity {
    level: u32,
    highest: u32,
    missing: Vec<Protection>,
    runtime: Vec<Protection>,
}

struct Attribute {
    level: u32,
    flags: u64,
    protection: Protection,
}

fn attribute(map: &Map) -> Option<Attribute> {
    let flags: u64 = get(map, "Flags").unwrap_or_default();
    let fix = if flags & CONTACT_MAKER != 0 {
        Fix::Maker
    } else if flags & FIRMWARE_SETTING != 0 {
        Fix::Firmware
    } else if flags & SYSTEM_SETTING != 0 {
        Fix::System
    } else {
        Fix::Unknown
    };
    let name = get::<String>(map, "Summary")
        .filter(|summary| !summary.is_empty())
        .or_else(|| get(map, "Name"))?;
    Some(Attribute {
        level: get(map, "HsiLevel").unwrap_or_default(),
        flags,
        protection: Protection {
            id: get(map, "AppstreamId").unwrap_or_default(),
            name,
            fix,
        },
    })
}

fn level(id: &str) -> Option<u32> {
    id.strip_prefix("HSI:")?.chars().next()?.to_digit(10)
}

pub fn read() -> Result<Option<HostSecurity>, String> {
    let proxy = FWUPD.proxy()?;
    let id: String = match proxy.get_property("HostSecurityId") {
        Ok(id) => id,
        Err(error) if absent(&error) => return Ok(None),
        Err(error) => return Err(failed(error)),
    };
    let Some(level) = level(&id) else {
        return Ok(None);
    };
    let attributes: Vec<Map> = match proxy.call("GetHostSecurityAttrs", &()) {
        Ok(attributes) => attributes,
        Err(error) if absent(&error) => return Ok(None),
        Err(error) => return Err(failed(error)),
    };
    let failing = attributes
        .iter()
        .filter_map(attribute)
        .filter(|attribute| attribute.flags & (SUCCESS | OBSOLETED) == 0);
    let (runtime, levelled): (Vec<_>, Vec<_>) =
        failing.partition(|attribute| attribute.flags & RUNTIME_ISSUE != 0);
    Ok(Some(HostSecurity {
        level,
        highest: HIGHEST_LEVEL,
        missing: levelled
            .into_iter()
            .filter(|attribute| attribute.level == level + 1)
            .map(|attribute| attribute.protection)
            .collect(),
        runtime: runtime
            .into_iter()
            .map(|attribute| attribute.protection)
            .collect(),
    }))
}
