use std::fs;
use std::path::Path;

use luft_store_seal::Stamp;

use crate::store::device;

const OLDER: &str = "schelf.store sent an older copy of its list than the one Schelf has.";

/// Takes a copy schelf.store just sent: it has to count still and be no
/// older than the last one taken, which is then remembered.
pub fn accept(stamp: &Stamp, document: &str) -> Result<(), String> {
    accept_in(&device::folder().join("serials"), stamp, document)
}

fn accept_in(serials: &Path, stamp: &Stamp, document: &str) -> Result<(), String> {
    stamp.current()?;
    let path = serials.join(document);
    let known = fs::read_to_string(&path)
        .ok()
        .and_then(|serial| serial.trim().parse::<u64>().ok());
    match known {
        Some(known) if stamp.serial < known => Err(OLDER.to_owned()),
        Some(known) if stamp.serial == known => Ok(()),
        _ => crate::disk::replace(&path, stamp.serial.to_string().as_bytes())
            .map_err(|error| error.to_string()),
    }
}

#[cfg(test)]
mod tests {
    use luft_store_seal::{Expiry, Stamp};

    use super::accept_in;

    const CATALOG: &str = "index/v1/catalog.json";

    fn stamp(serial: u64, expires: &str) -> Stamp {
        let body =
            format!(r#"{{"path":"{CATALOG}","serial":{serial},"expires":"{expires}","apps":[]}}"#);
        Stamp::read(body.as_bytes(), CATALOG, Expiry::Required).unwrap()
    }

    #[test]
    fn an_older_list_than_the_last_one_taken_is_refused() {
        let serials = tempfile::tempdir().unwrap();
        let accept = |serial| {
            accept_in(
                serials.path(),
                &stamp(serial, "2999-01-01T00:00:00Z"),
                CATALOG,
            )
        };
        assert!(accept(7).is_ok());
        assert!(accept(7).is_ok());
        assert!(accept(6).is_err());
        assert!(accept(8).is_ok());
        assert!(accept(7).is_err());
        assert!(accept_in(serials.path(), &stamp(9, "2020-01-01T00:00:00Z"), CATALOG).is_err());
        assert!(accept(8).is_ok());
    }
}
