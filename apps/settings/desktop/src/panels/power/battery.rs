use serde::Serialize;
use zbus::blocking::Connection;
use zbus::zvariant::OwnedObjectPath;

use super::failed;
use super::properties::Properties;

const DESTINATION: &str = "org.freedesktop.UPower";
const PATH: &str = "/org/freedesktop/UPower";
const DEVICE: &str = "org.freedesktop.UPower.Device";
const DISPLAY_DEVICE: &str = "/org/freedesktop/UPower/devices/DisplayDevice";

const TYPE_LINE_POWER: u32 = 1;
const TYPE_BATTERY: u32 = 2;
const STATE_CHARGING: u32 = 1;

#[derive(Serialize)]
#[serde(rename_all = "kebab-case")]
enum Charge {
    Charging,
    Discharging,
    Empty,
    Full,
    NotCharging,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Battery {
    level: f64,
    charge: Charge,
    until_full: i64,
    until_empty: i64,
    health: Option<f64>,
}

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
enum Kind {
    Mouse,
    Keyboard,
    Headphones,
    Speaker,
    Gamepad,
    Phone,
    Tablet,
    Pen,
    Touchpad,
    Other,
}

#[derive(Serialize)]
pub struct Device {
    id: String,
    name: Option<String>,
    kind: Kind,
    level: f64,
    charging: bool,
}

fn kind(device_type: u32) -> Kind {
    match device_type {
        5 => Kind::Mouse,
        6 => Kind::Keyboard,
        17 | 19 => Kind::Headphones,
        18 => Kind::Speaker,
        12 => Kind::Gamepad,
        8 => Kind::Phone,
        10 => Kind::Tablet,
        13 => Kind::Pen,
        14 => Kind::Touchpad,
        _ => Kind::Other,
    }
}

fn charge(state: u32) -> Charge {
    match state {
        1 => Charge::Charging,
        2 => Charge::Discharging,
        3 => Charge::Empty,
        4 => Charge::Full,
        _ => Charge::NotCharging,
    }
}

fn is(properties: &Properties, key: &str) -> bool {
    properties.get::<bool>(key) == Some(true)
}

fn battery(display: &Properties, devices: &[(OwnedObjectPath, Properties)]) -> Option<Battery> {
    if !is(display, "IsPresent") || display.get::<u32>("Type") != Some(TYPE_BATTERY) {
        return None;
    }
    let health = devices
        .iter()
        .filter(|(_, device)| {
            is(device, "PowerSupply") && device.get::<u32>("Type") == Some(TYPE_BATTERY)
        })
        .find_map(|(_, device)| {
            device
                .get::<f64>("Capacity")
                .filter(|capacity| *capacity > 0.0)
        });
    Some(Battery {
        level: display.get("Percentage").unwrap_or_default(),
        charge: charge(display.get("State").unwrap_or_default()),
        until_full: display.get("TimeToFull").unwrap_or_default(),
        until_empty: display.get("TimeToEmpty").unwrap_or_default(),
        health,
    })
}

fn peripheral((path, device): &(OwnedObjectPath, Properties)) -> Option<Device> {
    let device_type = device.get::<u32>("Type")?;
    if is(device, "PowerSupply") || !is(device, "IsPresent") || device_type == TYPE_LINE_POWER {
        return None;
    }
    Some(Device {
        id: path.to_string(),
        name: device
            .get::<String>("Model")
            .filter(|model| !model.is_empty()),
        kind: kind(device_type),
        level: device.get("Percentage").unwrap_or_default(),
        charging: device.get::<u32>("State") == Some(STATE_CHARGING),
    })
}

pub fn read(connection: &Connection) -> Result<(Option<Battery>, Vec<Device>), String> {
    let paths: Vec<OwnedObjectPath> = connection
        .call_method(
            Some(DESTINATION),
            PATH,
            Some(DESTINATION),
            "EnumerateDevices",
            &(),
        )
        .map_err(failed)?
        .body()
        .deserialize()
        .map_err(failed)?;
    let devices: Vec<(OwnedObjectPath, Properties)> = paths
        .into_iter()
        .filter_map(|path| {
            let properties =
                Properties::read(connection, DESTINATION, path.as_str(), DEVICE).ok()?;
            Some((path, properties))
        })
        .collect();
    let display = Properties::read(connection, DESTINATION, DISPLAY_DEVICE, DEVICE)?;
    Ok((
        battery(&display, &devices),
        devices.iter().filter_map(peripheral).collect(),
    ))
}
