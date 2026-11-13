use chrono::{DateTime, Utc};
use serde::Deserialize;

const STALE: &str =
    "Schelf's copy of the store is out of date. Connect to the internet so it can get a new one.";
const UNSTAMPED: &str = "Schelf couldn't confirm this is schelf.store's current list.";

/// What every signed document says about itself: the path it was signed
/// for, a number that only grows from one version to the next, and the day
/// it stops counting.
#[derive(Deserialize)]
pub struct Stamp {
    path: String,
    pub serial: u64,
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

impl Stamp {
    /// The stamp of the document asked for at `document`, so one signed
    /// document can't be served in place of another.
    pub fn read(body: &[u8], document: &str, expiry: Expiry) -> Result<Self, String> {
        serde_json::from_slice::<Self>(body)
            .ok()
            .filter(|stamp| stamp.path == document)
            .filter(|stamp| stamp.expires.is_some() || matches!(expiry, Expiry::WhenGiven))
            .ok_or_else(|| UNSTAMPED.to_owned())
    }

    /// The stamp of a listing of `id`, which has to say when it stops
    /// counting: its own listing, or the one for people invited to one of
    /// its channels.
    pub fn listing(body: &[u8], id: &str) -> Result<Self, String> {
        serde_json::from_slice::<Self>(body)
            .ok()
            .filter(|stamp| stamp.expires.is_some() && crate::lists(&stamp.path, id))
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
}

#[cfg(test)]
mod tests {
    use super::{Expiry, Stamp};

    const CATALOG: &str = "index/v1/catalog.json";
    const KEYS: &str = "trust/v1/store-keys.json";

    #[test]
    fn a_document_counts_until_it_expires() {
        let read = |expires: &str, expiry| {
            Stamp::read(
                format!(r#"{{"path":"{CATALOG}","serial":7,"expires":"{expires}","apps":[]}}"#)
                    .as_bytes(),
                CATALOG,
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
            assert!(Stamp::read(br#"{"keys":[]}"#, CATALOG, expiry).is_err());
        }
    }

    #[test]
    fn only_the_key_list_may_leave_its_expiry_out() {
        let unexpiring = br#"{"path":"trust/v1/store-keys.json","serial":7,"keys":[]}"#;
        assert!(Stamp::read(unexpiring, KEYS, Expiry::Required).is_err());
        let keys = Stamp::read(unexpiring, KEYS, Expiry::WhenGiven).unwrap();
        assert!(keys.current().is_ok());
    }

    #[test]
    fn a_document_only_counts_at_the_path_it_was_signed_for() {
        let listing = br#"{"path":"index/v1/apps/com.example.App.json","serial":9,"expires":"2999-01-01T00:00:00Z"}"#;
        let read = |document| Stamp::read(listing, document, Expiry::Required);
        assert!(read("index/v1/apps/com.example.App.json").is_ok());
        assert!(read("index/v1/apps/com.example.Other.json").is_err());
        assert!(read("/index/v1/apps/com.example.App.json").is_err());
        assert!(read(CATALOG).is_err());
    }
}
