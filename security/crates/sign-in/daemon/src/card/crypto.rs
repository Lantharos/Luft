use hkdf::Hkdf;
use p256::elliptic_curve::sec1::ToSec1Point;
use sha2::{Digest, Sha256};
use x509_cert::Certificate;
use x509_cert::der::{Decode, Encode};
use x509_cert::spki::DecodePublicKey;
use zeroize::Zeroizing;

const WRAP_CONTEXT: &[u8] = b"luft-sign-in smart card wrap";

/// The public half of a card's key, as its certificate names it.
pub enum PublicKey {
    Rsa(rsa::PublicKey),
    P256(p256::PublicKey),
    P384(p384::PublicKey),
}

impl PublicKey {
    pub fn of_certificate(certificate: &[u8]) -> Option<Self> {
        let certificate = Certificate::from_der(certificate).ok()?;
        let spki = certificate
            .tbs_certificate()
            .subject_public_key_info()
            .to_der()
            .ok()?;
        rsa::PublicKey::from_public_key_der(&spki)
            .map(Self::Rsa)
            .or_else(|_| p256::PublicKey::from_public_key_der(&spki).map(Self::P256))
            .or_else(|_| p384::PublicKey::from_public_key_der(&spki).map(Self::P384))
            .ok()
    }

    /// Whether `signature` is the card's signature over `challenge`: PKCS #1
    /// v1.5 with SHA-256 for RSA, raw ECDSA over its SHA-256 digest otherwise.
    pub fn verifies(&self, challenge: &[u8], signature: &[u8]) -> bool {
        use rsa::signature::Verifier;
        use rsa::signature::hazmat::PrehashVerifier;
        let digest = Sha256::digest(challenge);
        match self {
            Self::Rsa(key) => {
                rsa::pkcs1v15::Signature::try_from(signature).is_ok_and(|signature| {
                    rsa::pkcs1v15::VerifyingKey::<Sha256>::new(key.clone())
                        .verify(challenge, &signature)
                        .is_ok()
                })
            }
            Self::P256(key) => {
                p256::ecdsa::Signature::from_slice(signature).is_ok_and(|signature| {
                    p256::ecdsa::VerifyingKey::from(key)
                        .verify_prehash(&digest, &signature)
                        .is_ok()
                })
            }
            Self::P384(key) => {
                p384::ecdsa::Signature::from_slice(signature).is_ok_and(|signature| {
                    p384::ecdsa::VerifyingKey::from(key)
                        .verify_prehash(&digest, &signature)
                        .is_ok()
                })
            }
        }
    }

    pub fn is_rsa(&self) -> bool {
        matches!(self, Self::Rsa(_))
    }
}

pub fn random<const N: usize>() -> [u8; N] {
    let mut bytes = [0; N];
    getrandom::fill(&mut bytes).expect("the kernel gives random bytes");
    bytes
}

/// A secret only the card's private key opens again, and what the card is
/// handed to open it: an RSA ciphertext, or the public half of a key the
/// card agrees a secret with.
pub struct Sealed {
    pub secret: Zeroizing<Vec<u8>>,
    pub for_card: Vec<u8>,
}

pub fn seal_for(key: &PublicKey) -> Option<Sealed> {
    match key {
        PublicKey::Rsa(key) => {
            let secret = Zeroizing::new(random::<32>().to_vec());
            let mut rng = Random;
            let for_card = key.encrypt(&mut rng, rsa::Pkcs1v15Encrypt, &secret).ok()?;
            Some(Sealed { secret, for_card })
        }
        PublicKey::P256(card) => {
            let ours = p256::SecretKey::from_slice(&random::<32>()).ok()?;
            let shared = p256::ecdh::diffie_hellman(ours.to_nonzero_scalar(), card.as_affine());
            Some(Sealed {
                secret: stretch(shared.raw_secret_bytes()),
                for_card: ours.public_key().to_sec1_point(false).as_bytes().to_vec(),
            })
        }
        PublicKey::P384(card) => {
            let ours = p384::SecretKey::from_slice(&random::<48>()).ok()?;
            let shared = p384::ecdh::diffie_hellman(ours.to_nonzero_scalar(), card.as_affine());
            Some(Sealed {
                secret: stretch(shared.raw_secret_bytes()),
                for_card: ours.public_key().to_sec1_point(false).as_bytes().to_vec(),
            })
        }
    }
}

pub fn stretch(shared: &[u8]) -> Zeroizing<Vec<u8>> {
    let mut secret = Zeroizing::new(vec![0; 32]);
    Hkdf::<Sha256>::new(None, shared)
        .expand(WRAP_CONTEXT, &mut secret)
        .expect("32 bytes is a valid HKDF-SHA256 output length");
    secret
}

struct Random;

impl rsa::rand_core::TryRng for Random {
    type Error = std::convert::Infallible;

    fn try_next_u32(&mut self) -> Result<u32, Self::Error> {
        Ok(u32::from_le_bytes(random()))
    }

    fn try_next_u64(&mut self) -> Result<u64, Self::Error> {
        Ok(u64::from_le_bytes(random()))
    }

    fn try_fill_bytes(&mut self, bytes: &mut [u8]) -> Result<(), Self::Error> {
        getrandom::fill(bytes).expect("the kernel gives random bytes");
        Ok(())
    }
}

impl rsa::rand_core::TryCryptoRng for Random {}
