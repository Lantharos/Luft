use super::registry;
use crate::protocol::WindowsChoices;

const POWER: &str = r"SYSTEM\CurrentControlSet\Control\Session Manager\Power";
const HIBERNATION: &str = r"SYSTEM\CurrentControlSet\Control\Power";
const TIME_ZONE: &str = r"SYSTEM\CurrentControlSet\Control\TimeZoneInformation";
const FAST_STARTUP: &str = "HiberbootEnabled";
const UNIVERSAL_CLOCK: &str = "RealTimeIsUniversal";

pub fn fast_startup() -> bool {
    registry::dword(POWER, FAST_STARTUP) == Some(1)
        && registry::dword(HIBERNATION, "HibernateEnabled") != Some(0)
}

pub fn universal_clock() -> bool {
    registry::dword(TIME_ZONE, UNIVERSAL_CLOCK) == Some(1)
}

pub fn apply(choices: WindowsChoices) -> Result<(), String> {
    if choices.fast_startup_off {
        registry::set_dword(POWER, FAST_STARTUP, 0)?;
    }
    if choices.universal_clock {
        registry::set_dword(TIME_ZONE, UNIVERSAL_CLOCK, 1)?;
    }
    Ok(())
}
