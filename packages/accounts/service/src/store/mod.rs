mod keyring;
mod records;
mod secret;

pub use keyring::Keyring;
pub use records::{Record, Records};
pub use secret::Secret;

pub fn new_id() -> String {
    use rand::RngExt;
    let bytes: [u8; 6] = rand::rng().random();
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}
