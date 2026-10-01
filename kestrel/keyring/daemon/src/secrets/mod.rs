mod collection;
mod error;
mod item;
mod prompt;
mod service;
mod session;
mod sync;
mod transfer;

use std::collections::HashMap;

use zbus::zvariant::{ObjectPath, OwnedObjectPath, OwnedValue};

pub use error::SecretError;
pub use service::Service;
pub use session::Sessions;
pub use sync::sync;

pub const ROOT: &str = "/org/freedesktop/secrets";
const COLLECTIONS: &str = "/org/freedesktop/secrets/collection/";
const ALIASES: &str = "/org/freedesktop/secrets/aliases/";

pub type Secret = (OwnedObjectPath, Vec<u8>, Vec<u8>, String);
pub type Properties = HashMap<String, OwnedValue>;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum Target {
    Collection(String),
    Alias(String),
    Item(String, u64),
}

pub fn collection_path(id: &str) -> OwnedObjectPath {
    owned(&format!("{COLLECTIONS}{}", escape(id)))
}

pub fn alias_path(alias: &str) -> OwnedObjectPath {
    owned(&format!("{ALIASES}{}", escape(alias)))
}

pub fn item_path(collection: &str, item: u64) -> OwnedObjectPath {
    owned(&format!("{COLLECTIONS}{}/{item}", escape(collection)))
}

pub fn none() -> OwnedObjectPath {
    owned("/")
}

fn owned(path: &str) -> OwnedObjectPath {
    OwnedObjectPath::try_from(path.to_owned()).expect("escaped paths are valid")
}

pub fn parse(path: &ObjectPath<'_>) -> Option<Target> {
    if let Some(alias) = path.as_str().strip_prefix(ALIASES) {
        return Some(Target::Alias(unescape(alias)));
    }
    let rest = path.as_str().strip_prefix(COLLECTIONS)?;
    match rest.split_once('/') {
        Some((collection, item)) => Some(Target::Item(unescape(collection), item.parse().ok()?)),
        None => Some(Target::Collection(unescape(rest))),
    }
}

fn escape(name: &str) -> String {
    name.bytes()
        .map(|byte| {
            if byte.is_ascii_alphanumeric() {
                char::from(byte).to_string()
            } else {
                format!("_{byte:02x}")
            }
        })
        .collect()
}

fn unescape(escaped: &str) -> String {
    let mut bytes = Vec::with_capacity(escaped.len());
    let mut rest = escaped.as_bytes();
    while let Some((&byte, tail)) = rest.split_first() {
        if byte == b'_'
            && let Some(hex) = tail.get(..2).and_then(|hex| std::str::from_utf8(hex).ok())
            && let Ok(value) = u8::from_str_radix(hex, 16)
        {
            bytes.push(value);
            rest = &tail[2..];
        } else {
            bytes.push(byte);
            rest = tail;
        }
    }
    String::from_utf8_lossy(&bytes).into_owned()
}
