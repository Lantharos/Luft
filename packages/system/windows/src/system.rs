use anyhow::Result;

use crate::registry::Registry;

pub const SYSTEM_HIVE: &str = r"Windows\System32\config\SYSTEM";

pub(crate) const POWER: &str = r"Control\Session Manager\Power";
pub(crate) const FAST_STARTUP: &str = "HiberbootEnabled";
const HIBERNATION: &str = r"Control\Power";
const HIBERNATION_ENABLED: &str = "HibernateEnabled";
pub(crate) const TIME_ZONE: &str = r"Control\TimeZoneInformation";
pub(crate) const UNIVERSAL_CLOCK: &str = "RealTimeIsUniversal";

pub struct System<'a> {
    registry: Registry<'a>,
    control_set: Option<String>,
}

pub fn settled(hive: &[u8]) -> bool {
    hive.len() >= 12 && hive[4..8] == hive[8..12]
}

fn control_set_name(number: u32) -> String {
    format!("ControlSet{number:03}")
}

impl<'a> System<'a> {
    pub fn new(hive: &'a [u8]) -> Result<Self> {
        let registry = Registry::new(hive)?;
        let control_set = registry.dword("Select", "Current")?.map(control_set_name);
        Ok(Self {
            registry,
            control_set,
        })
    }

    pub fn registry(&self) -> &Registry<'a> {
        &self.registry
    }

    pub fn control_set(&self) -> Option<&str> {
        self.control_set.as_deref()
    }

    pub(crate) fn control_sets(&self) -> Result<Vec<String>> {
        let mut sets = Vec::new();
        for slot in ["Current", "Default"] {
            if let Some(number) = self.registry.dword("Select", slot)? {
                let name = control_set_name(number);
                if !sets.contains(&name) {
                    sets.push(name);
                }
            }
        }
        Ok(sets)
    }

    pub(crate) fn number(&self, control_set: &str, path: &str, name: &str) -> Result<Option<u64>> {
        let Some(data) = self
            .registry
            .binary(&format!(r"{control_set}\{path}"), name)?
        else {
            return Ok(None);
        };
        let mut bytes = [0u8; 8];
        let length = data.len().min(bytes.len());
        bytes[..length].copy_from_slice(&data[..length]);
        Ok(Some(u64::from_le_bytes(bytes)))
    }

    fn current(&self, path: &str, name: &str) -> Result<Option<u64>> {
        match &self.control_set {
            Some(control_set) => self.number(control_set, path, name),
            None => Ok(None),
        }
    }

    pub fn fast_startup(&self) -> Result<bool> {
        Ok(self.current(POWER, FAST_STARTUP)? != Some(0)
            && self.current(HIBERNATION, HIBERNATION_ENABLED)? != Some(0))
    }

    pub fn universal_clock(&self) -> Result<bool> {
        Ok(self.current(TIME_ZONE, UNIVERSAL_CLOCK)? == Some(1))
    }
}
