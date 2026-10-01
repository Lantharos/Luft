use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::Zeroizing;

use crate::locked::LockedBytes;
use crate::{Error, cipher};

pub const KEY_SIZE: usize = 32;
pub const CHIP_KEY_SIZE: usize = 32;

pub struct MasterKey(LockedBytes<KEY_SIZE>);

impl MasterKey {
    pub fn generate() -> Result<Self, Error> {
        let mut locked = LockedBytes::zeroed()?;
        cipher::random(locked.bytes_mut());
        Ok(Self(locked))
    }

    pub fn duplicate(&self) -> Result<Self, Error> {
        Self::from_slice(self.bytes())
    }

    pub(crate) fn from_slice(bytes: &[u8]) -> Result<Self, Error> {
        let bytes: &[u8; KEY_SIZE] = bytes
            .try_into()
            .map_err(|_| Error::Corrupt("the stored key has the wrong size"))?;
        let mut locked = LockedBytes::zeroed()?;
        locked.bytes_mut().copy_from_slice(bytes);
        Ok(Self(locked))
    }

    pub(crate) fn bytes(&self) -> &[u8; KEY_SIZE] {
        self.0.bytes()
    }

    pub(crate) fn derive(&self, purpose: &str) -> Zeroizing<[u8; KEY_SIZE]> {
        let mut derived = Zeroizing::new([0; KEY_SIZE]);
        Hkdf::<Sha256>::new(None, self.bytes())
            .expand(purpose.as_bytes(), derived.as_mut())
            .expect("32 bytes is a valid HKDF-SHA256 output length");
        derived
    }
}
