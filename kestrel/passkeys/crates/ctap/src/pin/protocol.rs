use aes::Aes256;
use cbc::cipher::{BlockModeDecrypt, BlockModeEncrypt, KeyIvInit, block_padding::NoPadding};
use hkdf::Hkdf;
use hmac::{Hmac, KeyInit, Mac};
use p256::{NonZeroScalar, elliptic_curve::Generate};
use sha2::{Digest, Sha256};
use zeroize::{Zeroize, ZeroizeOnDrop, Zeroizing};

use crate::model::PublicKey;
use crate::status::{Result, Status};

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Protocol {
    One,
    Two,
}

impl Protocol {
    pub fn from_number(number: i64) -> Result<Self> {
        match number {
            1 => Ok(Self::One),
            2 => Ok(Self::Two),
            _ => Err(Status::InvalidParameter),
        }
    }

    #[cfg(test)]
    pub fn authenticate(self, key: &[u8], message: &[u8]) -> Vec<u8> {
        let mut mac = HmacSha256::new_from_slice(key).expect("HMAC accepts any key length");
        mac.update(message);
        let tag = mac.finalize().into_bytes();
        match self {
            Self::One => tag[..16].to_vec(),
            Self::Two => tag.to_vec(),
        }
    }

    pub fn verify(self, key: &[u8], message: &[u8], signature: &[u8]) -> bool {
        let expected = match self {
            Self::One => 16,
            Self::Two => 32,
        };
        if signature.len() != expected {
            return false;
        }
        let mut mac = HmacSha256::new_from_slice(key).expect("HMAC accepts any key length");
        mac.update(message);
        mac.verify_truncated_left(signature).is_ok()
    }
}

#[derive(Zeroize, ZeroizeOnDrop)]
pub struct KeyAgreement(NonZeroScalar);

impl KeyAgreement {
    pub fn generate() -> Self {
        Self(NonZeroScalar::generate())
    }

    pub fn public_key(&self) -> PublicKey {
        PublicKey::from_p256(&p256::PublicKey::from_secret_scalar(&self.0))
    }

    pub fn shared_secret(&self, protocol: Protocol, peer: &PublicKey) -> Result<SharedSecret> {
        let peer = peer.to_p256().map_err(|_| Status::InvalidParameter)?;
        let point = p256::ecdh::diffie_hellman(self.0, peer.as_affine());
        let z = point.raw_secret_bytes();
        Ok(match protocol {
            Protocol::One => {
                let key: [u8; 32] = Sha256::digest(z).into();
                SharedSecret {
                    protocol,
                    hmac_key: key,
                    aes_key: key,
                }
            }
            Protocol::Two => {
                let hkdf = Hkdf::<Sha256>::new(Some(&[0; 32]), z);
                let mut hmac_key = [0; 32];
                let mut aes_key = [0; 32];
                hkdf.expand(b"CTAP2 HMAC key", &mut hmac_key)
                    .expect("32 bytes is a valid HKDF length");
                hkdf.expand(b"CTAP2 AES key", &mut aes_key)
                    .expect("32 bytes is a valid HKDF length");
                SharedSecret {
                    protocol,
                    hmac_key,
                    aes_key,
                }
            }
        })
    }
}

#[derive(Zeroize, ZeroizeOnDrop)]
pub struct SharedSecret {
    #[zeroize(skip)]
    protocol: Protocol,
    hmac_key: [u8; 32],
    aes_key: [u8; 32],
}

impl SharedSecret {
    pub fn encrypt(&self, plaintext: &[u8]) -> Vec<u8> {
        let iv = match self.protocol {
            Protocol::One => [0; 16],
            Protocol::Two => crate::random(),
        };
        let ciphertext = cbc::Encryptor::<Aes256>::new(&self.aes_key.into(), &iv.into())
            .encrypt_padded_vec::<NoPadding>(plaintext);
        match self.protocol {
            Protocol::One => ciphertext,
            Protocol::Two => [iv.as_slice(), &ciphertext].concat(),
        }
    }

    pub fn decrypt(&self, message: &[u8]) -> Result<Zeroizing<Vec<u8>>> {
        let (iv, ciphertext) = match self.protocol {
            Protocol::One => ([0; 16], message),
            Protocol::Two if message.len() >= 16 => (
                message[..16].try_into().expect("sixteen bytes"),
                &message[16..],
            ),
            Protocol::Two => return Err(Status::InvalidLength),
        };
        cbc::Decryptor::<Aes256>::new(&self.aes_key.into(), &iv.into())
            .decrypt_padded_vec::<NoPadding>(ciphertext)
            .map(Zeroizing::new)
            .map_err(|_| Status::InvalidLength)
    }

    pub fn verify(&self, message: &[u8], signature: &[u8]) -> bool {
        self.protocol.verify(&self.hmac_key, message, signature)
    }

    #[cfg(test)]
    pub fn authenticate(&self, message: &[u8]) -> Vec<u8> {
        self.protocol.authenticate(&self.hmac_key, message)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn both_sides_derive_the_same_secret_and_decrypt_the_token() {
        let authenticator = KeyAgreement::generate();
        let platform = KeyAgreement::generate();
        for protocol in [Protocol::One, Protocol::Two] {
            let ours = authenticator
                .shared_secret(protocol, &platform.public_key())
                .unwrap();
            let theirs = platform
                .shared_secret(protocol, &authenticator.public_key())
                .unwrap();
            assert_eq!(ours.hmac_key, theirs.hmac_key);
            let token = [7u8; 32];
            let encrypted = ours.encrypt(&token);
            assert_eq!(theirs.decrypt(&encrypted).unwrap().as_slice(), token);
        }
    }

    #[test]
    fn verifies_truncated_and_full_tags() {
        let key = [1u8; 32];
        for protocol in [Protocol::One, Protocol::Two] {
            let tag = protocol.authenticate(&key, b"client data hash");
            assert!(protocol.verify(&key, b"client data hash", &tag));
            assert!(!protocol.verify(&key, b"other", &tag));
        }
        assert!(!Protocol::Two.verify(&key, b"x", &Protocol::One.authenticate(&key, b"x")));
    }
}
