use std::collections::{BTreeMap, HashMap};

use aes::Aes128;
use cbc::cipher::block_padding::Pkcs7;
use cbc::cipher::{BlockModeDecrypt, KeyIvInit};
use hmac::{Hmac, KeyInit, Mac};
use serde::Deserialize;
use sha2::Sha256;
use zeroize::Zeroizing;
use zgvariant::serialized::{Context, Data};
use zgvariant::{LE, Type};

use super::{OldItem, ReadError};

const DAMAGED: ReadError = ReadError::Damaged("the old keyring is damaged");
const TAG: usize = 32;
const IV: usize = 16;

#[derive(Deserialize, Type)]
struct File {
    _salt_size: u32,
    salt: Vec<u8>,
    iterations: u32,
    _modified: u64,
    _usage: u32,
    items: Vec<Encrypted>,
}

#[derive(Deserialize, Type)]
struct Encrypted {
    _hashed: HashMap<String, Vec<u8>>,
    blob: Vec<u8>,
}

#[derive(Deserialize, Type)]
struct Plain {
    attributes: HashMap<String, String>,
    label: String,
    created: u64,
    modified: u64,
    secret: Vec<u8>,
}

fn context() -> Context {
    Context::new(LE, 0)
}

pub fn read(body: &[u8], password: &[u8]) -> Result<Vec<OldItem>, ReadError> {
    let (file, _): (File, _) = Data::new(body, context())
        .deserialize()
        .map_err(|_| DAMAGED)?;
    let mut key = Zeroizing::new([0; 16]);
    pbkdf2::pbkdf2_hmac::<Sha256>(password, &file.salt, file.iterations, key.as_mut());
    file.items
        .iter()
        .map(|item| decrypt(&item.blob, &key))
        .collect()
}

fn decrypt(blob: &[u8], key: &[u8; 16]) -> Result<OldItem, ReadError> {
    let sealed_length = blob.len().checked_sub(TAG).ok_or(DAMAGED)?;
    let (sealed, tag) = blob.split_at(sealed_length);
    let mut mac = <Hmac<Sha256> as KeyInit>::new_from_slice(key).map_err(|_| DAMAGED)?;
    mac.update(sealed);
    mac.verify_slice(tag)
        .map_err(|_| ReadError::WrongPassword)?;
    let (ciphertext, iv) = sealed.split_at(sealed.len().checked_sub(IV).ok_or(DAMAGED)?);
    let iv: [u8; IV] = iv.try_into().map_err(|_| DAMAGED)?;
    let plaintext = Zeroizing::new(
        cbc::Decryptor::<Aes128>::new(&(*key).into(), &iv.into())
            .decrypt_padded_vec::<Pkcs7>(ciphertext)
            .map_err(|_| DAMAGED)?,
    );
    let (item, _): (Plain, _) = Data::new(plaintext.as_slice(), context())
        .deserialize()
        .map_err(|_| DAMAGED)?;
    Ok(OldItem {
        label: item.label,
        attributes: item.attributes.into_iter().collect::<BTreeMap<_, _>>(),
        secret: Zeroizing::new(item.secret),
        created: item.created,
        modified: item.modified,
    })
}
