use hmac::{Hmac, KeyInit, Mac};
use luft_keyring_wire::{Problem, Reply, Request, Secret};
use p256::ecdsa::signature::Signer;
use p256::ecdsa::{DerSignature, Signature, SigningKey};
use sha2::{Digest, Sha256};
use zeroize::Zeroizing;

use super::record::Private;
use crate::unlocking::link;

const AUTH_SIZE: usize = 32;
const RANDOM_SIZE: usize = 64;

pub struct Created {
    pub private: Private,
    pub x: Vec<u8>,
    pub y: Vec<u8>,
}

fn random<const N: usize>() -> Result<Secret, Problem> {
    let mut bytes = vec![0; N];
    getrandom::fill(&mut bytes).map_err(|error| Problem::Failed(error.to_string()))?;
    Ok(Secret::new(bytes))
}

pub fn credential_random() -> Result<Secret, Problem> {
    random::<RANDOM_SIZE>()
}

pub async fn create(on_chip: bool) -> Result<Created, Problem> {
    if on_chip {
        let auth = random::<AUTH_SIZE>()?;
        let Reply::Key(key) = link::request(Request::CreateKey { auth: auth.clone() }).await?
        else {
            return Err(Problem::Failed("the security chip made no key".into()));
        };
        let (x, y) = key.point.clone();
        return Ok(Created {
            private: Private::Chip { key, auth },
            x: pad(&x),
            y: pad(&y),
        });
    }
    let key = generate()?;
    let point = key.verifying_key().to_encoded_point(false);
    let bytes = point.as_bytes();
    Ok(Created {
        private: Private::Software(Secret::copy_of(&key.to_bytes())),
        x: bytes[1..33].to_vec(),
        y: bytes[33..65].to_vec(),
    })
}

fn generate() -> Result<SigningKey, Problem> {
    loop {
        let scalar = random::<32>()?;
        if let Ok(key) = SigningKey::from_slice(scalar.expose()) {
            return Ok(key);
        }
    }
}

fn pad(coordinate: &[u8]) -> Vec<u8> {
    let mut padded = vec![0; 32usize.saturating_sub(coordinate.len())];
    padded.extend_from_slice(coordinate);
    padded
}

pub async fn sign(private: &Private, message: &[u8]) -> Result<Vec<u8>, Problem> {
    match private {
        Private::Software(scalar) => {
            let key = SigningKey::from_slice(scalar.expose())
                .map_err(|error| Problem::Failed(error.to_string()))?;
            let signature: DerSignature = key.sign(message);
            Ok(signature.as_bytes().to_vec())
        }
        Private::Chip { key, auth } => {
            let digest = Sha256::digest(message).to_vec();
            let request = Request::Sign {
                key: key.clone(),
                auth: auth.clone(),
                digest,
            };
            let Reply::Signature { r, s } = link::request(request).await? else {
                return Err(Problem::Failed("the security chip didn't sign".into()));
            };
            let r = <[u8; 32]>::try_from(pad(&r)).map_err(failed)?;
            let s = <[u8; 32]>::try_from(pad(&s)).map_err(failed)?;
            let signature = Signature::from_scalars(r, s)
                .map_err(|error| Problem::Failed(error.to_string()))?;
            Ok(signature.to_der().as_bytes().to_vec())
        }
    }
}

fn failed(bytes: Vec<u8>) -> Problem {
    Problem::Failed(format!(
        "the security chip returned a {}-byte value",
        bytes.len()
    ))
}

pub fn hmac_secret(random: &Secret, verified: bool, salts: &[u8]) -> Zeroizing<Vec<u8>> {
    let half = RANDOM_SIZE / 2;
    let key = if verified {
        &random.expose()[half..]
    } else {
        &random.expose()[..half]
    };
    let mut output = Zeroizing::new(Vec::with_capacity(salts.len()));
    for salt in salts.chunks(32) {
        let mut mac = Hmac::<Sha256>::new_from_slice(key).expect("HMAC accepts any key length");
        mac.update(salt);
        output.extend_from_slice(&mac.finalize().into_bytes());
    }
    output
}
