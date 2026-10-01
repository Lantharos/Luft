mod auth_data;
pub mod authenticator;
pub mod cbor;
pub mod hid;
pub mod model;
mod pin;
pub mod platform;
pub mod status;

pub use authenticator::Authenticator;
pub use model::{Credential, NewCredential, Protection, PublicKey, RelyingParty, User};
pub use platform::{Consent, Platform, Prompt};
pub use status::Status;

pub fn random<const N: usize>() -> [u8; N] {
    let mut bytes = [0; N];
    getrandom::fill(&mut bytes).expect("the system random number generator is available");
    bytes
}
