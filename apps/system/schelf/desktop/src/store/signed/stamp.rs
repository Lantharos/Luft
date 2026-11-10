use std::fs;
use std::path::PathBuf;

use chrono::{DateTime, Utc};
use serde::Deserialize;

use crate::store::device;

const STALE: &str =
    "Schelf's copy of the store is out of date. Connect to the internet so it can get a new one.";
const OLDER: &str = "schelf.store sent an older copy of its list than the one Schelf has.";
const UNSTAMPED: &str = "Schelf couldn't confirm this is schelf.store's current list.";

/// What every signed document says about its own age: a number that only
/// grows from one version to the next, and the day it stops counting.
#[derive(Deserialize)]
pub struct Stamp {
    serial: u64,
    expires: Option<DateTime<Utc>>,
}

/// Whether a document has to say when it stops counting. The store signs
/// its own documents anew all the time, so they do. The list of its keys is
/// signed by hand with the root key, so a renewal missed there would take
/// the whole store away: it only has to carry its number.
#[derive(Clone, Copy)]
pub enum Expiry {
    Required,
    WhenGiven,
}

fn last_accepted(document: &str) -> PathBuf {
    device::folder().join("serials").join(document)
}

impl Stamp {
    pub fn read(body: &[u8], expiry: Expiry) -> Result<Self, String> {
        serde_json::from_slice::<Self>(body)
            .ok()
            .filter(|stamp| stamp.expires.is_some() || matches!(expiry, Expiry::WhenGiven))
            .ok_or_else(|| UNSTAMPED.to_owned())
    }

    /// Whether the document still counts, so an old copy can't be served
    /// forever in place of a newer one.
    pub fn current(&self) -> Result<(), String> {
        if self.expires.is_none_or(|expires| Utc::now() < expires) {
            Ok(())
        } else {
            Err(STALE.to_owned())
        }
    }

    /// Takes a copy schelf.store just sent: it has to count still and be no
    /// older than the last one taken, which is then remembered.
    pub fn accept(&self, document: &str) -> Result<(), String> {
        self.current()?;
        let path = last_accepted(document);
        let known = fs::read_to_string(&path)
            .ok()
            .and_then(|serial| serial.trim().parse::<u64>().ok());
        match known {
            Some(known) if self.serial < known => Err(OLDER.to_owned()),
            Some(known) if self.serial == known => Ok(()),
            _ => luft_app::files::replace(&path, self.serial.to_string().as_bytes())
                .map_err(|error| error.to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{Expiry, Stamp};

    #[test]
    fn a_document_counts_until_it_expires() {
        let read = |expires: &str, expiry| {
            Stamp::read(
                format!(r#"{{"serial":7,"expires":"{expires}","apps":[]}}"#).as_bytes(),
                expiry,
            )
        };
        for expiry in [Expiry::Required, Expiry::WhenGiven] {
            assert!(
                read("2999-01-01T00:00:00Z", expiry)
                    .unwrap()
                    .current()
                    .is_ok()
            );
            assert!(
                read("2020-01-01T00:00:00Z", expiry)
                    .unwrap()
                    .current()
                    .is_err()
            );
            assert!(Stamp::read(br#"{"keys":[]}"#, expiry).is_err());
        }
    }

    #[test]
    fn only_the_key_list_may_leave_its_expiry_out() {
        let unexpiring = br#"{"serial":7,"keys":[]}"#;
        assert!(Stamp::read(unexpiring, Expiry::Required).is_err());
        let keys = Stamp::read(unexpiring, Expiry::WhenGiven).unwrap();
        assert!(keys.current().is_ok());
    }
}
