use std::collections::BTreeMap;

use aes::Aes128;
use cbc::cipher::block_padding::NoPadding;
use cbc::cipher::{BlockModeDecrypt, KeyIvInit};
use md5::{Digest as _, Md5};
use sha2::Sha256;
use zeroize::Zeroizing;

use super::{OldItem, ReadError};

const DAMAGED: ReadError = ReadError::Damaged("the old keyring is damaged");

struct Reader<'a> {
    rest: &'a [u8],
}

impl<'a> Reader<'a> {
    fn bytes(&mut self, count: usize) -> Result<&'a [u8], ReadError> {
        if count > self.rest.len() {
            return Err(DAMAGED);
        }
        let (taken, rest) = self.rest.split_at(count);
        self.rest = rest;
        Ok(taken)
    }

    fn u8(&mut self) -> Result<u8, ReadError> {
        Ok(self.bytes(1)?[0])
    }

    fn u32(&mut self) -> Result<u32, ReadError> {
        Ok(u32::from_be_bytes(
            self.bytes(4)?.try_into().expect("four bytes"),
        ))
    }

    fn time(&mut self) -> Result<u64, ReadError> {
        Ok((u64::from(self.u32()?) << 32) | u64::from(self.u32()?))
    }

    fn blob(&mut self) -> Result<Option<&'a [u8]>, ReadError> {
        match self.u32()? {
            u32::MAX => Ok(None),
            length => self.bytes(length as usize).map(Some),
        }
    }

    fn text(&mut self) -> Result<String, ReadError> {
        Ok(String::from_utf8_lossy(self.blob()?.unwrap_or_default()).into_owned())
    }

    fn attribute_value(&mut self) -> Result<String, ReadError> {
        match self.u32()? {
            0 => self.text(),
            1 => Ok(self.u32()?.to_string()),
            _ => Err(DAMAGED),
        }
    }
}

pub fn read(body: &[u8], password: &[u8]) -> Result<Vec<OldItem>, ReadError> {
    let mut reader = Reader { rest: body };
    if reader.u8()? != 0 || reader.u8()? != 0 {
        return Err(ReadError::Damaged("an unknown keyring cipher"));
    }
    reader.text()?;
    reader.time()?;
    reader.time()?;
    reader.u32()?;
    reader.u32()?;
    let iterations = reader.u32()?;
    let salt = reader.bytes(8)?;
    reader.bytes(16)?;
    let count = reader.u32()?;
    for _ in 0..count {
        reader.u32()?;
        reader.u32()?;
        for _ in 0..reader.u32()? {
            reader.text()?;
            match reader.u32()? {
                0 => drop(reader.blob()?),
                1 => drop(reader.u32()?),
                _ => return Err(DAMAGED),
            }
        }
    }
    let length = reader.u32()? as usize;
    let encrypted = reader.bytes(length.min(reader.rest.len()) / 16 * 16)?;

    let (key, iv) = derive(password, salt, iterations);
    let mut decrypted = Zeroizing::new(encrypted.to_vec());
    cbc::Decryptor::<Aes128>::new(&(*key).into(), &iv.into())
        .decrypt_padded::<NoPadding>(&mut decrypted)
        .map_err(|_| DAMAGED)?;
    let (checksum, content) = decrypted.split_at_checked(16).ok_or(DAMAGED)?;
    if Md5::digest(content).as_slice() != checksum {
        return Err(ReadError::WrongPassword);
    }
    items(content, count)
}

fn derive(password: &[u8], salt: &[u8], iterations: u32) -> (Zeroizing<[u8; 16]>, [u8; 16]) {
    let mut digest = Sha256::new_with_prefix(password)
        .chain_update(salt)
        .finalize();
    for _ in 1..iterations {
        digest = Sha256::digest(digest);
    }
    let mut key = Zeroizing::new([0; 16]);
    key.copy_from_slice(&digest[..16]);
    (key, digest[16..].try_into().expect("sixteen bytes"))
}

fn items(content: &[u8], count: u32) -> Result<Vec<OldItem>, ReadError> {
    let mut reader = Reader { rest: content };
    let mut items = Vec::new();
    for _ in 0..count {
        let label = reader.text()?;
        let secret = Zeroizing::new(reader.blob()?.unwrap_or_default().to_vec());
        let created = reader.time()?;
        let modified = reader.time()?;
        reader.blob()?;
        reader.bytes(16)?;
        let mut attributes = BTreeMap::new();
        for _ in 0..reader.u32()? {
            let name = reader.text()?;
            attributes.insert(name, reader.attribute_value()?);
        }
        for _ in 0..reader.u32()? {
            reader.u32()?;
            reader.blob()?;
            reader.blob()?;
            reader.blob()?;
            reader.u32()?;
        }
        items.push(OldItem {
            label,
            attributes,
            secret,
            created,
            modified,
        });
    }
    Ok(items)
}
