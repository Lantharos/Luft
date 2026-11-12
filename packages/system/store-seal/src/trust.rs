use base64::Engine;
use base64::engine::general_purpose::STANDARD;
use chrono::{DateTime, Utc};
use ed25519_dalek::{Signature, VerifyingKey};
use serde::Deserialize;
use sha2::{Digest, Sha256};

const ROOT: &str = "kP/cqtRR3PN+8X1gMdRBXRsfqLq0l5Lsbv54K6FnqJg=";
const UNTRUSTED: &str = "Schelf couldn't confirm this came from schelf.store.";

/// The `.sig` file next to every signed document.
#[derive(Deserialize)]
pub struct Seal {
    key: String,
    sig: String,
}

impl Seal {
    pub fn read(bytes: &[u8]) -> Result<Self, String> {
        serde_json::from_slice(bytes).map_err(|_| UNTRUSTED.to_owned())
    }
}

struct Key {
    id: String,
    key: VerifyingKey,
}

impl Key {
    /// A public key and its id: the first 16 hex digits of its SHA-256.
    fn read(text: &str) -> Result<Self, String> {
        let bytes: [u8; 32] = STANDARD
            .decode(text)
            .ok()
            .and_then(|bytes| bytes.try_into().ok())
            .ok_or(UNTRUSTED)?;
        let id = Sha256::digest(bytes)
            .iter()
            .take(8)
            .map(|byte| format!("{byte:02x}"))
            .collect();
        let key = VerifyingKey::from_bytes(&bytes).map_err(|_| UNTRUSTED.to_owned())?;
        Ok(Self { id, key })
    }
}

fn check(key: &VerifyingKey, bytes: &[u8], seal: &Seal) -> Result<(), String> {
    let signature: [u8; 64] = STANDARD
        .decode(&seal.sig)
        .ok()
        .and_then(|bytes| bytes.try_into().ok())
        .ok_or(UNTRUSTED)?;
    key.verify_strict(bytes, &Signature::from_bytes(&signature))
        .map_err(|_| UNTRUSTED.to_owned())
}

#[derive(Deserialize)]
struct StoreKeys {
    keys: Vec<StoreKey>,
    #[serde(default)]
    revoked: Vec<String>,
}

#[derive(Deserialize)]
struct StoreKey {
    id: String,
    public_key: String,
    not_before: DateTime<Utc>,
    expires: DateTime<Utc>,
}

/// The store's signing keys the built-in root vouches for, minus those it
/// revoked and those not yet or no longer valid.
pub struct Keys(Vec<Key>);

impl Keys {
    pub fn read(document: &[u8], seal: &Seal) -> Result<Self, String> {
        Self::read_under(ROOT, document, seal, Utc::now())
    }

    fn read_under(
        root: &str,
        document: &[u8],
        seal: &Seal,
        now: DateTime<Utc>,
    ) -> Result<Self, String> {
        let root = Key::read(root)?;
        if seal.key != root.id {
            return Err(UNTRUSTED.into());
        }
        check(&root.key, document, seal)?;
        let listed: StoreKeys = serde_json::from_slice(document).map_err(|_| UNTRUSTED)?;
        let keys = listed
            .keys
            .into_iter()
            .filter(|key| key.not_before <= now && now < key.expires)
            .filter(|key| !listed.revoked.contains(&key.id))
            .filter_map(|key| {
                Key::read(&key.public_key)
                    .ok()
                    .filter(|read| read.id == key.id)
            })
            .collect();
        Ok(Self(keys))
    }

    pub fn verify(&self, bytes: &[u8], seal: &Seal) -> Result<(), String> {
        let key = self
            .0
            .iter()
            .find(|key| key.id == seal.key)
            .ok_or(UNTRUSTED)?;
        check(&key.key, bytes, seal)
    }
}

#[cfg(test)]
mod tests;
