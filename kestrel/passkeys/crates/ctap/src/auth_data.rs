use ciborium::Value;
use sha2::{Digest, Sha256};

use crate::cbor;
use crate::model::{ES256, PublicKey};

pub const AAGUID: [u8; 16] = [
    0xe8, 0xcc, 0xe9, 0x42, 0x0d, 0x97, 0x47, 0x3a, 0x85, 0x8a, 0x3e, 0x24, 0xfe, 0x68, 0x4b, 0x14,
];

pub const USER_PRESENT: u8 = 0x01;
pub const USER_VERIFIED: u8 = 0x04;
const ATTESTED: u8 = 0x40;
const EXTENSIONS: u8 = 0x80;

pub struct AuthData<'a> {
    pub rp_id: &'a str,
    pub flags: u8,
    pub counter: u32,
    pub attested: Option<(&'a [u8], PublicKey)>,
    pub extensions: Option<Value>,
}

impl AuthData<'_> {
    pub fn encode(&self) -> Vec<u8> {
        let mut flags = self.flags;
        let mut bytes = rp_id_hash(self.rp_id);
        let mut tail = Vec::new();
        if let Some((id, key)) = self.attested {
            flags |= ATTESTED;
            tail.extend_from_slice(&AAGUID);
            tail.extend_from_slice(
                &u16::try_from(id.len())
                    .expect("credential ids are short")
                    .to_be_bytes(),
            );
            tail.extend_from_slice(id);
            tail.extend_from_slice(&cbor::encode(&key.to_cose(ES256)));
        }
        if let Some(extensions) = &self.extensions {
            flags |= EXTENSIONS;
            tail.extend_from_slice(&cbor::encode(extensions));
        }
        bytes.push(flags);
        bytes.extend_from_slice(&self.counter.to_be_bytes());
        bytes.extend_from_slice(&tail);
        bytes
    }
}

pub fn rp_id_hash(rp_id: &str) -> Vec<u8> {
    Sha256::digest(rp_id.as_bytes()).to_vec()
}
