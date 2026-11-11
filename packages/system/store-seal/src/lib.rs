mod extension;
mod stamp;
mod trust;

pub use extension::{InShell, in_shell};
pub use stamp::{Expiry, Stamp};
pub use trust::{Keys, Seal};

pub const STORE_KEYS: &str = "trust/v1/store-keys.json";

/// Where schelf.store keeps an app's or extension's own listing.
pub fn listing_document(id: &str) -> String {
    format!("index/v1/apps/{id}.json")
}
