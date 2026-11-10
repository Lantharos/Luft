use std::fs;
use std::io;
use std::path::Path;

use argon2::{Algorithm, Argon2, Params, Version};
use zeroize::Zeroizing;

use super::Code;

pub const HEADER: &str = "box.seal";
const MAGIC: &[u8; 8] = b"LUFTBOX1";
const SALT: usize = 16;
const MEMORY_KIB: u32 = 64 * 1024;
const PASSES: u32 = 3;
const LANES: u32 = 1;
pub const KEY: usize = 32;

pub type Key = Zeroizing<[u8; KEY]>;

fn derive(code: &Code, salt: &[u8; SALT]) -> Key {
    let params = Params::new(MEMORY_KIB, PASSES, LANES, Some(KEY))
        .expect("the box's key parameters are valid");
    let mut key = Zeroizing::new([0; KEY]);
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
        .hash_password_into(code.bytes(), salt, key.as_mut())
        .expect("a key of this size can always be derived");
    key
}

/// Writes the clear header of a new box and returns the key its code gives.
pub fn create(root: &Path, code: &Code) -> io::Result<Key> {
    let mut salt = [0; SALT];
    getrandom::fill(&mut salt).expect("the system's random generator is always available");
    fs::write(root.join(HEADER), [MAGIC.as_slice(), &salt].concat())?;
    Ok(derive(code, &salt))
}

/// The key `code` gives for the box at `root`, or `None` when the box has no
/// seal.
pub fn open(root: &Path, code: &Code) -> io::Result<Option<Key>> {
    let header = match fs::read(root.join(HEADER)) {
        Ok(header) => header,
        Err(error) if error.kind() == io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(error),
    };
    let salt = header
        .strip_prefix(MAGIC)
        .and_then(|salt| <&[u8; SALT]>::try_from(salt).ok());
    Ok(salt.map(|salt| derive(code, salt)))
}

pub fn is_sealed(root: &Path) -> bool {
    root.join(HEADER).is_file()
}
