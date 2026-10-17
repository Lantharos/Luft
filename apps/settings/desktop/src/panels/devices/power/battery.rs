use std::path::{Path, PathBuf};

use serde::Serialize;
use zbus::{Connection, OwnedObjectPath};

use super::failed;
use super::limit::{self, ChargeLimit};
use super::properties::Properties;

pub const DESTINATION: &str = "org.freedesktop.UPower";
pub const PATH: &str = "/org/freedesktop/UPower";
pub const DEVICE: &str = "org.freedesktop.UPower.Device";
const DISPLAY_DEVICE: &str = "/org/freedesktop/UPower/devices/DisplayDevice";
const POWER_SUPPLIES: &str = "/sys/class/power_supply";

const TYPE_LINE_POWER: u32 = 1;
const TYPE_BATTERY: u32 = 2;
const STATE_CHARGING: u32 = 1;
const PLAUSIBLE_ESTIMATE: std::ops::RangeInclusive<i64> = 60..=24 * 3600;
const SMALLEST_RATE: f64 = 0.1;

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
pub struct Capacity {
    full: f64,
    design: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Battery {
    level: f64,
    charge: Charge,
    until_full: i64,
    until_empty: i64,
    rate: Option<f64>,
    capacity: Option<Capacity>,
    cycles: Vec<i32>,
    limit: Option<ChargeLimit>,
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

pub struct Pack<'a> {
    pub path: &'a OwnedObjectPath,
    pub properties: &'a Properties,
    pub sysfs: PathBuf,
}

impl Pack<'_> {
    pub fn sysfs_number(&self, attribute: &str) -> Option<u32> {
        std::fs::read_to_string(self.sysfs.join(attribute))
            .ok()?
            .trim()
            .parse()
            .ok()
    }

    fn cycles(&self) -> Option<i32> {
        self.properties
            .get::<i32>("ChargeCycles")
            .filter(|cycles| *cycles > 0)
            .or_else(|| {
                self.sysfs_number("cycle_count")
                    .and_then(|cycles| i32::try_from(cycles).ok())
                    .filter(|cycles| *cycles > 0)
            })
    }
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

fn charge(state: u32, on_battery: bool) -> Charge {
    match state {
        1 => Charge::Charging,
        3 => Charge::Empty,
        4 => Charge::Full,
        _ if on_battery => Charge::Discharging,
        _ => Charge::NotCharging,
    }
}

fn estimate(display: &Properties, key: &str) -> i64 {
    display
        .get::<i64>(key)
        .filter(|seconds| PLAUSIBLE_ESTIMATE.contains(seconds))
        .unwrap_or_default()
}

fn is(properties: &Properties, key: &str) -> bool {
    properties.get::<bool>(key) == Some(true)
}

fn sysfs(native_path: &str) -> PathBuf {
    if Path::new(native_path).is_absolute() {
        PathBuf::from(native_path)
    } else {
        Path::new(POWER_SUPPLIES).join(native_path)
    }
}

pub fn packs(devices: &[(OwnedObjectPath, Properties)]) -> Vec<Pack<'_>> {
    devices
        .iter()
        .filter(|(_, device)| {
            is(device, "PowerSupply")
                && is(device, "IsPresent")
                && device.get::<u32>("Type") == Some(TYPE_BATTERY)
        })
        .map(|(path, properties)| Pack {
            path,
            properties,
            sysfs: sysfs(&properties.get::<String>("NativePath").unwrap_or_default()),
        })
        .collect()
}

fn capacity(packs: &[Pack]) -> Option<Capacity> {
    let (full, design) = packs.iter().fold((0.0, 0.0), |(full, design), pack| {
        (
            full + pack.properties.get::<f64>("EnergyFull").unwrap_or_default(),
            design
                + pack
                    .properties
                    .get::<f64>("EnergyFullDesign")
                    .unwrap_or_default(),
        )
    });
    (full > 0.0 && design > 0.0).then_some(Capacity { full, design })
}

fn is_battery(display: &Properties) -> bool {
    is(display, "IsPresent") && display.get::<u32>("Type") == Some(TYPE_BATTERY)
}

pub async fn present(connection: &Connection) -> bool {
    Properties::read(connection, DESTINATION, DISPLAY_DEVICE, DEVICE)
        .await
        .is_ok_and(|display| is_battery(&display))
}

fn battery(display: &Properties, on_battery: bool, packs: &[Pack]) -> Option<Battery> {
    if !is_battery(display) {
        return None;
    }
    let charge = charge(display.get("State").unwrap_or_default(), on_battery);
    Some(Battery {
        level: display.get("Percentage").unwrap_or_default(),
        until_full: match charge {
            Charge::Charging => estimate(display, "TimeToFull"),
            _ => 0,
        },
        until_empty: match charge {
            Charge::Discharging => estimate(display, "TimeToEmpty"),
            _ => 0,
        },
        charge,
        rate: display
            .get::<f64>("EnergyRate")
            .filter(|rate| *rate >= SMALLEST_RATE),
        capacity: capacity(packs),
        cycles: packs.iter().filter_map(Pack::cycles).collect(),
        limit: limit::read(packs),
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

pub async fn devices(
    connection: &Connection,
) -> Result<Vec<(OwnedObjectPath, Properties)>, String> {
    let paths: Vec<OwnedObjectPath> = connection
        .call_method(
            Some(DESTINATION),
            PATH,
            Some(DESTINATION),
            "EnumerateDevices",
            &(),
        )
        .await
        .map_err(failed)?
        .body()
        .deserialize()
        .map_err(failed)?;
    let mut devices = Vec::with_capacity(paths.len());
    for path in paths {
        if let Ok(properties) =
            Properties::read(connection, DESTINATION, path.as_str(), DEVICE).await
        {
            devices.push((path, properties));
        }
    }
    Ok(devices)
}

pub async fn read(connection: &Connection) -> Result<(Option<Battery>, Vec<Device>), String> {
    let devices = devices(connection).await?;
    let display = Properties::read(connection, DESTINATION, DISPLAY_DEVICE, DEVICE).await?;
    let on_battery = Properties::read(connection, DESTINATION, PATH, DESTINATION)
        .await?
        .get::<bool>("OnBattery")
        .unwrap_or(true);
    Ok((
        battery(&display, on_battery, &packs(&devices)),
        devices.iter().filter_map(peripheral).collect(),
    ))
}
