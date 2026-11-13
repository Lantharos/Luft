pub mod approvals;
pub mod auth;
pub mod credentials;
pub mod dashboard;
pub mod http;
pub mod identity;

use std::fmt::Write;

use serde::Deserialize;
use serde_json::value::RawValue;

pub const API_BASE: &str = "/api/v1";
pub const STORE_ORIGIN: &str = "https://schelf.store";

/// JSON as the store sent it, kept to print unchanged, with the values read from it.
pub struct Reply<T> {
    pub raw: Box<RawValue>,
    pub value: T,
}

impl<'de, T: serde::de::DeserializeOwned> Deserialize<'de> for Reply<T> {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let raw = Box::<RawValue>::deserialize(deserializer)?;
        let value = serde_json::from_str(raw.get()).map_err(serde::de::Error::custom)?;
        Ok(Self { raw, value })
    }
}

/// `text` as `encodeURIComponent` writes it.
pub fn encode(text: &str) -> String {
    let mut encoded = String::new();
    for byte in text.bytes() {
        if byte.is_ascii_alphanumeric() || b"-_.!~*'()".contains(&byte) {
            encoded.push(byte as char);
        } else {
            let _ = write!(encoded, "%{byte:02X}");
        }
    }
    encoded
}

/// The value at `key` of JSON the store sent, as it sent it.
pub fn pick(raw: &RawValue, key: &str) -> Box<RawValue> {
    serde_json::from_str::<std::collections::HashMap<String, Box<RawValue>>>(raw.get())
        .ok()
        .and_then(|mut fields| fields.remove(key))
        .unwrap_or_else(|| RawValue::from_string("null".into()).expect("null is JSON"))
}
