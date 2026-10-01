mod binary;
mod v1;

use std::collections::BTreeMap;

use zeroize::Zeroizing;

pub const HEADER: &[u8; 16] = b"GnomeKeyring\n\r\0\n";

pub struct OldItem {
    pub label: String,
    pub attributes: BTreeMap<String, String>,
    pub secret: Zeroizing<Vec<u8>>,
    pub created: u64,
    pub modified: u64,
}

#[derive(Debug, PartialEq, Eq)]
pub enum ReadError {
    WrongPassword,
    Damaged(&'static str),
}

pub fn read(file: &[u8], password: &[u8]) -> Result<Vec<OldItem>, ReadError> {
    let rest = file
        .strip_prefix(HEADER.as_slice())
        .ok_or(ReadError::Damaged("not a keyring file"))?;
    match rest.split_first_chunk::<2>() {
        Some(([0, 0], body)) => binary::read(body, password),
        Some(([1, 0], body)) => v1::read(body, password),
        _ => Err(ReadError::Damaged("an unknown keyring version")),
    }
}
