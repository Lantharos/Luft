use luft_app::dbus::objects::Objects;
use serde::Serialize;

use super::{ATA, NVME};

const KELVIN: f64 = 273.15;
const FAILING_WARNINGS: &[&str] = &["degraded", "readonly", "volatile_mem", "pmr_readonly"];

#[derive(Serialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum State {
    Good,
    Warning,
    Failing,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Health {
    pub state: State,
    pub temperature: Option<f64>,
    pub power_on_hours: Option<u64>,
    pub bad_sectors: i64,
    pub warnings: Vec<String>,
    pub selftest: Selftest,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Selftest {
    pub status: String,
    pub remaining: Option<i32>,
}

pub fn read(objects: &Objects, drive: &str) -> Option<Health> {
    if let Some(ata) = objects.get(drive, ATA) {
        if !ata.flag("SmartSupported")
            || !ata.flag("SmartEnabled")
            || ata.get::<u64>("SmartUpdated").unwrap_or(0) == 0
        {
            return None;
        }
        let bad_sectors = ata.get::<i64>("SmartNumBadSectors").unwrap_or(0);
        let attributes_failing = ata.get::<i32>("SmartNumAttributesFailing").unwrap_or(0);
        let state = if ata.flag("SmartFailing") {
            State::Failing
        } else if bad_sectors > 0 || attributes_failing > 0 {
            State::Warning
        } else {
            State::Good
        };
        return Some(Health {
            state,
            temperature: ata
                .get::<f64>("SmartTemperature")
                .filter(|kelvin| *kelvin > 0.0)
                .map(|kelvin| kelvin - KELVIN),
            power_on_hours: ata
                .get::<u64>("SmartPowerOnSeconds")
                .filter(|seconds| *seconds > 0)
                .map(|seconds| seconds / 3600),
            bad_sectors,
            warnings: Vec::new(),
            selftest: selftest(
                ata.get("SmartSelftestStatus"),
                ata.get("SmartSelftestPercentRemaining"),
            ),
        });
    }
    let nvme = objects.get(drive, NVME)?;
    if nvme.get::<u64>("SmartUpdated").unwrap_or(0) == 0 {
        return None;
    }
    let warnings = nvme
        .get::<Vec<String>>("SmartCriticalWarning")
        .unwrap_or_default();
    let state = if warnings
        .iter()
        .any(|warning| FAILING_WARNINGS.contains(&warning.as_str()))
    {
        State::Failing
    } else if warnings.is_empty() {
        State::Good
    } else {
        State::Warning
    };
    Some(Health {
        state,
        temperature: nvme
            .get::<u16>("SmartTemperature")
            .filter(|kelvin| *kelvin > 0)
            .map(|kelvin| f64::from(kelvin) - KELVIN),
        power_on_hours: nvme.get("SmartPowerOnHours"),
        bad_sectors: 0,
        warnings,
        selftest: selftest(
            nvme.get("SmartSelftestStatus"),
            nvme.get("SmartSelftestPercentRemaining"),
        ),
    })
}

fn selftest(status: Option<String>, remaining: Option<i32>) -> Selftest {
    let status = status.unwrap_or_default();
    Selftest {
        remaining: (status == "inprogress")
            .then_some(remaining)
            .flatten()
            .filter(|value| *value >= 0),
        status,
    }
}
