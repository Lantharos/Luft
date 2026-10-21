mod disk;
mod private_mount;

use anyhow::{Context, Result, bail, ensure};
use regf_rs::{Hive, RegError, RegValue};
use serde::{Deserialize, Serialize};

use crate::system::{FAST_STARTUP, POWER, System, TIME_ZONE, UNIVERSAL_CLOCK};

pub use disk::apply;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Change {
    FastStartupOff,
    UniversalClock,
}

impl Change {
    fn setting(self) -> (&'static str, &'static str, u32) {
        match self {
            Self::FastStartupOff => (POWER, FAST_STARTUP, 0),
            Self::UniversalClock => (TIME_ZONE, UNIVERSAL_CLOCK, 1),
        }
    }

    fn holds(self, system: &System, control_set: &str) -> Result<bool> {
        let (path, name, wanted) = self.setting();
        Ok(system.number(control_set, path, name)? == Some(u64::from(wanted)))
    }
}

pub fn edited(original: &[u8], changes: &[Change]) -> Result<Option<Vec<u8>>> {
    let system = System::new(original)?;
    let control_sets = system.control_sets()?;
    ensure!(
        !control_sets.is_empty(),
        "Windows' settings have no control set"
    );

    let mut pending = Vec::new();
    for control_set in &control_sets {
        for change in changes {
            if !change.holds(&system, control_set)? {
                pending.push((control_set.as_str(), *change));
            }
        }
    }
    if pending.is_empty() {
        return Ok(None);
    }

    let mut hive = match Hive::from_bytes(original.to_vec()) {
        Ok(hive) => hive,
        Err(error) => bail!("Windows' settings couldn't be opened: {error}"),
    };
    for (control_set, change) in &pending {
        let (path, name, value) = change.setting();
        match hive.set_value(
            &format!(r"{control_set}\{path}"),
            name,
            RegValue::Dword(value),
        ) {
            Ok(()) => {}
            Err(RegError::DirtyHive) => {
                bail!(
                    "Windows didn't finish saving its settings. Start Windows and shut it down fully first."
                )
            }
            Err(error) => bail!("Windows' settings couldn't be changed: {error}"),
        }
    }
    let updated = hive.to_bytes();
    check(&updated, &control_sets, changes).context("The changed settings didn't read back")?;
    Ok(Some(updated))
}

fn check(updated: &[u8], control_sets: &[String], changes: &[Change]) -> Result<()> {
    if let Err(error) = Hive::from_bytes(updated.to_vec()) {
        bail!("{error}");
    }
    let system = System::new(updated)?;
    for control_set in control_sets {
        for change in changes {
            ensure!(
                change.holds(&system, control_set)?,
                "{change:?} in {control_set}"
            );
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests;
