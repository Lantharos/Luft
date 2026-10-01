use argon2::{Algorithm, Argon2, Params, Version};
use serde::{Deserialize, Serialize};
use zeroize::Zeroizing;

use crate::key::{CHIP_KEY_SIZE, KEY_SIZE, MasterKey};
use crate::{Error, cipher};

const MEMORY_KIB: u32 = 64 * 1024;
const PASSES: u32 = 3;
const LANES: u32 = 4;
const PASSWORD_CONTEXT: &[u8] = b"luft-keyring password wrap";
const CHIP_CONTEXT: &[u8] = b"luft-keyring chip wrap";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PasswordWrap {
    salt: [u8; 16],
    memory: u32,
    passes: u32,
    lanes: u32,
    sealed: Vec<u8>,
}

impl PasswordWrap {
    pub fn create(key: &MasterKey, password: &[u8]) -> Result<Self, Error> {
        let mut salt = [0; 16];
        cipher::random(&mut salt);
        let wrap_key = stretch(password, &salt, MEMORY_KIB, PASSES, LANES)?;
        Ok(Self {
            salt,
            memory: MEMORY_KIB,
            passes: PASSES,
            lanes: LANES,
            sealed: cipher::seal(&wrap_key, key.bytes(), PASSWORD_CONTEXT),
        })
    }

    pub fn open(&self, password: &[u8]) -> Result<MasterKey, Error> {
        let wrap_key = stretch(password, &self.salt, self.memory, self.passes, self.lanes)?;
        let key =
            cipher::open(&wrap_key, &self.sealed, PASSWORD_CONTEXT).ok_or(Error::WrongPassword)?;
        MasterKey::from_slice(&key)
    }

    pub fn is_current(&self) -> bool {
        self.memory >= MEMORY_KIB && self.passes >= PASSES
    }
}

fn stretch(
    password: &[u8],
    salt: &[u8],
    memory: u32,
    passes: u32,
    lanes: u32,
) -> Result<Zeroizing<[u8; KEY_SIZE]>, Error> {
    let params = Params::new(memory, passes, lanes, Some(KEY_SIZE))
        .map_err(|_| Error::Corrupt("unusable password parameters"))?;
    let mut output = Zeroizing::new([0; KEY_SIZE]);
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
        .hash_password_into(password, salt, output.as_mut())
        .map_err(|_| Error::Corrupt("unusable password parameters"))?;
    Ok(output)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChipWrap {
    sealed: Vec<u8>,
}

impl ChipWrap {
    pub fn create(key: &MasterKey, chip_key: &[u8]) -> Result<Self, Error> {
        Ok(Self {
            sealed: cipher::seal(chip_key_array(chip_key)?, key.bytes(), CHIP_CONTEXT),
        })
    }

    pub fn open(&self, chip_key: &[u8]) -> Result<MasterKey, Error> {
        let key = cipher::open(chip_key_array(chip_key)?, &self.sealed, CHIP_CONTEXT)
            .ok_or(Error::WrongKey)?;
        MasterKey::from_slice(&key)
    }
}

fn chip_key_array(chip_key: &[u8]) -> Result<&[u8; CHIP_KEY_SIZE], Error> {
    chip_key.try_into().map_err(|_| Error::WrongKey)
}
