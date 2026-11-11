use std::fs;
use std::path::PathBuf;

use luft_store_seal::Stamp;

use crate::store::device;

const OLDER: &str = "schelf.store sent an older copy of its list than the one Schelf has.";

fn last_accepted(document: &str) -> PathBuf {
    device::folder().join("serials").join(document)
}

/// Takes a copy schelf.store just sent: it has to count still and be no
/// older than the last one taken, which is then remembered.
pub fn accept(stamp: &Stamp, document: &str) -> Result<(), String> {
    stamp.current()?;
    let path = last_accepted(document);
    let known = fs::read_to_string(&path)
        .ok()
        .and_then(|serial| serial.trim().parse::<u64>().ok());
    match known {
        Some(known) if stamp.serial < known => Err(OLDER.to_owned()),
        Some(known) if stamp.serial == known => Ok(()),
        _ => luft_app::files::replace(&path, stamp.serial.to_string().as_bytes())
            .map_err(|error| error.to_string()),
    }
}
