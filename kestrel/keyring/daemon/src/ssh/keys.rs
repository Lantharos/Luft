use base64::Engine;
use base64::engine::general_purpose::{STANDARD, STANDARD_NO_PAD};
use ed25519_dalek::{Signer, SigningKey};
use luft_keyring_vault::{Secret, SshKey, SshPrivate, now};
use luft_keyring_wire::{Reply, Request, TpmKey};
use p256::ecdsa::signature::Signer as _;
use p256::ecdsa::{Signature, SigningKey as EcdsaKey};
use sha2::{Digest, Sha256};

use super::wire::{Reader, Writer};
use crate::unlocking::link;

pub const ED25519: &str = "ssh-ed25519";
pub const ECDSA: &str = "ecdsa-sha2-nistp256";
const CURVE: &str = "nistp256";
const POINT: usize = 32;

pub fn kind(public: &[u8]) -> &'static str {
    match Reader::new(public).string() {
        Some(name) if name == ED25519.as_bytes() => "ed25519",
        Some(name) if name == ECDSA.as_bytes() => "ecdsa",
        _ => "unknown",
    }
}

pub fn fingerprint(public: &[u8]) -> String {
    format!("SHA256:{}", STANDARD_NO_PAD.encode(Sha256::digest(public)))
}

pub fn openssh_line(key: &SshKey) -> String {
    let name = Reader::new(&key.public)
        .string()
        .map(String::from_utf8_lossy)
        .unwrap_or_default();
    format!("{name} {} {}", STANDARD.encode(&key.public), key.comment)
}

fn ed25519_public(signing: &SigningKey) -> Vec<u8> {
    Writer::default()
        .string(ED25519.as_bytes())
        .string(signing.verifying_key().as_bytes())
        .bytes
}

fn ecdsa_public(x: &[u8], y: &[u8]) -> Vec<u8> {
    let mut point = vec![4];
    for coordinate in [x, y] {
        point.extend(std::iter::repeat_n(
            0,
            POINT.saturating_sub(coordinate.len()),
        ));
        point.extend_from_slice(coordinate);
    }
    Writer::default()
        .string(ECDSA.as_bytes())
        .string(CURVE.as_bytes())
        .string(&point)
        .bytes
}

pub fn generate_software(comment: String) -> SshKey {
    let mut seed = [0; 32];
    getrandom::fill(&mut seed).expect("the kernel's random generator is always available");
    let signing = SigningKey::from_bytes(&seed);
    let key = SshKey {
        comment,
        public: ed25519_public(&signing),
        private: SshPrivate::Software(Secret::copy_of(&seed)),
        confirm: true,
        added: now(),
    };
    seed.fill(0);
    key
}

pub async fn generate_in_chip(comment: String) -> Result<SshKey, String> {
    let mut auth = vec![0; 32];
    getrandom::fill(&mut auth).map_err(|error| error.to_string())?;
    let auth = Secret::new(auth);
    let Ok(Reply::Key(TpmKey {
        public,
        private,
        point,
    })) = link::request(Request::CreateKey { auth: auth.clone() }).await
    else {
        return Err("the security chip couldn't make a key".into());
    };
    Ok(SshKey {
        comment,
        public: ecdsa_public(&point.0, &point.1),
        private: SshPrivate::Chip {
            public,
            private,
            auth,
        },
        confirm: true,
        added: now(),
    })
}

pub fn parse_added(body: &[u8]) -> Option<(SshKey, Reader<'_>)> {
    let mut reader = Reader::new(body);
    let name = reader.string()?;
    let (public, private) = if name == ED25519.as_bytes() {
        reader.string()?;
        let pair = reader.string()?;
        let seed: [u8; 32] = pair.get(..32)?.try_into().ok()?;
        let signing = SigningKey::from_bytes(&seed);
        (ed25519_public(&signing), Secret::copy_of(&seed))
    } else if name == ECDSA.as_bytes() {
        (reader.string()? == CURVE.as_bytes()).then_some(())?;
        let point = reader.string()?;
        let scalar = reader.mpint()?;
        let mut padded = vec![0; POINT.saturating_sub(scalar.len())];
        padded.extend_from_slice(scalar);
        EcdsaKey::from_slice(&padded).ok()?;
        let coordinates = point.strip_prefix(&[4])?;
        let (x, y) = coordinates.split_at_checked(POINT)?;
        (ecdsa_public(x, y), Secret::new(padded))
    } else {
        return None;
    };
    let comment = String::from_utf8_lossy(reader.string()?).into_owned();
    let key = SshKey {
        comment,
        public,
        private: SshPrivate::Software(private),
        confirm: false,
        added: now(),
    };
    Some((key, reader))
}

pub async fn sign(key: &SshKey, data: &[u8]) -> Option<Vec<u8>> {
    match &key.private {
        SshPrivate::Software(secret) if kind(&key.public) == "ed25519" => {
            let seed: [u8; 32] = secret.expose().try_into().ok()?;
            let signature = SigningKey::from_bytes(&seed).sign(data);
            Some(
                Writer::default()
                    .string(ED25519.as_bytes())
                    .string(&signature.to_bytes())
                    .bytes,
            )
        }
        SshPrivate::Software(secret) => {
            let signature: Signature = EcdsaKey::from_slice(secret.expose()).ok()?.sign(data);
            let (r, s) = signature.split_bytes();
            Some(ecdsa_signature(&r, &s))
        }
        SshPrivate::Chip {
            public,
            private,
            auth,
        } => {
            let digest = Sha256::digest(data).to_vec();
            let key = TpmKey {
                public: public.clone(),
                private: private.clone(),
                point: (Vec::new(), Vec::new()),
            };
            match link::request(Request::Sign {
                key,
                auth: auth.clone(),
                digest,
            })
            .await
            {
                Ok(Reply::Signature { r, s }) => Some(ecdsa_signature(&r, &s)),
                _ => None,
            }
        }
    }
}

fn ecdsa_signature(r: &[u8], s: &[u8]) -> Vec<u8> {
    let inner = Writer::default().mpint(r).mpint(s).bytes;
    Writer::default()
        .string(ECDSA.as_bytes())
        .string(&inner)
        .bytes
}
