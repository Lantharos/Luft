pub mod bluez;
mod keyfile;
mod windows;

use std::fmt;

use serde::Serialize;

pub use windows::pairings;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct Address([u8; 6]);

impl Address {
    fn from_hex(text: &str) -> Option<Self> {
        let text = text.trim_start_matches("0x");
        if text.len() != 12 {
            return None;
        }
        let mut bytes = [0u8; 6];
        for (byte, pair) in bytes.iter_mut().zip(text.as_bytes().chunks(2)) {
            *byte = u8::from_str_radix(std::str::from_utf8(pair).ok()?, 16).ok()?;
        }
        Some(Self(bytes))
    }

    fn from_number(number: u64) -> Self {
        let bytes = number.to_be_bytes();
        Self([bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7]])
    }
}

impl fmt::Display for Address {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        let [a, b, c, d, e, f] = self.0;
        write!(formatter, "{a:02X}:{b:02X}:{c:02X}:{d:02X}:{e:02X}:{f:02X}")
    }
}

impl Serialize for Address {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.collect_str(self)
    }
}

pub type Key = [u8; 16];

#[derive(Clone, PartialEq, Eq, Debug)]
pub enum Keys {
    Classic {
        link_key: Key,
    },
    LowEnergy {
        random_address: bool,
        long_term_key: Option<LongTermKey>,
        identity_key: Option<Key>,
    },
}

#[derive(Clone, PartialEq, Eq, Debug)]
pub struct LongTermKey {
    pub key: Key,
    pub size: u8,
    pub ediv: u16,
    pub rand: u64,
    pub authenticated: bool,
}

impl LongTermKey {
    fn secure_connections(&self) -> bool {
        self.ediv == 0 && self.rand == 0
    }
}

#[derive(Clone, PartialEq, Eq, Debug, Serialize)]
pub struct Pairing {
    pub adapter: Address,
    pub device: Address,
    pub name: Option<String>,
    pub class: Option<u32>,
    #[serde(skip)]
    pub keys: Keys,
}

impl Pairing {
    pub fn low_energy(&self) -> bool {
        matches!(self.keys, Keys::LowEnergy { .. })
    }
}

#[cfg(test)]
mod tests;
