use std::path::Path;

use anyhow::{Context, Result};
use luft_dbus::disk_lock::DiskChange;

const ENCRYPTING: &str = "/var/lib/trustd/encryption.json";

pub fn change_unless_encrypting() -> Result<Option<DiskChange>> {
    let change =
        match DiskChange::try_begin().context("The system disk's lock couldn't be taken")? {
            Some(change) => change,
            None => {
                eprintln!("Waiting for other changes to the system disk to finish");
                DiskChange::wait().context("The system disk's lock couldn't be taken")?
            }
        };
    Ok((!Path::new(ENCRYPTING).exists()).then_some(change))
}
