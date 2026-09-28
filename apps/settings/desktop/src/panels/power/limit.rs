use serde::Serialize;
use zbus::blocking::Connection;

use super::battery::{self, DESTINATION, DEVICE, Pack};
use super::failed;

const FULL: u32 = 100;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChargeLimit {
    adjustable: bool,
    enabled: bool,
    stops_at: Option<u32>,
    applied: Option<u32>,
    elsewhere: bool,
}

struct PackLimit {
    supported: bool,
    enabled: bool,
    end: Option<u32>,
    written: Option<u32>,
}

fn percentage(value: u32) -> Option<u32> {
    (value <= FULL).then_some(value)
}

impl PackLimit {
    fn of(pack: &Pack) -> Self {
        Self {
            supported: pack.properties.get::<bool>("ChargeThresholdSupported") == Some(true),
            enabled: pack.properties.get::<bool>("ChargeThresholdEnabled") == Some(true),
            end: pack
                .properties
                .get::<u32>("ChargeEndThreshold")
                .and_then(percentage),
            written: pack.sysfs_number("charge_control_end_threshold"),
        }
    }

    fn applied(&self) -> Option<u32> {
        self.written.filter(|end| (1..FULL).contains(end))
    }

    fn elsewhere(&self) -> bool {
        let Some(written) = self.written else {
            return false;
        };
        let limited = self.applied().is_some();
        match (self.supported, self.enabled, self.end) {
            (true, true, Some(end)) => written != end,
            (true, true, None) => false,
            _ => limited,
        }
    }
}

pub fn read(packs: &[Pack]) -> Option<ChargeLimit> {
    let limits: Vec<PackLimit> = packs.iter().map(PackLimit::of).collect();
    let supported: Vec<&PackLimit> = limits.iter().filter(|limit| limit.supported).collect();
    let applied = limits.iter().find_map(PackLimit::applied);
    if supported.is_empty() && applied.is_none() {
        return None;
    }
    Some(ChargeLimit {
        adjustable: !supported.is_empty(),
        enabled: !supported.is_empty() && supported.iter().all(|limit| limit.enabled),
        stops_at: supported.iter().find_map(|limit| limit.end),
        applied,
        elsewhere: limits.iter().any(PackLimit::elsewhere),
    })
}

pub fn set(connection: &Connection, enabled: bool) -> Result<(), String> {
    let devices = battery::devices(connection)?;
    battery::packs(&devices)
        .iter()
        .filter(|pack| PackLimit::of(pack).supported)
        .try_for_each(|pack| {
            connection
                .call_method(
                    Some(DESTINATION),
                    pack.path.as_str(),
                    Some(DEVICE),
                    "EnableChargeThreshold",
                    &enabled,
                )
                .map(|_| ())
                .map_err(failed)
        })
}
