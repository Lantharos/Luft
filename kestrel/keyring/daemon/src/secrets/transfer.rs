use aes::Aes128;
use cbc::cipher::block_padding::Pkcs7;
use cbc::cipher::{BlockModeDecrypt, BlockModeEncrypt, KeyIvInit};
use crypto_bigint::modular::{FixedMontyForm, FixedMontyParams};
use crypto_bigint::{Odd, U1024};
use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::Zeroizing;

pub const PLAIN: &str = "plain";
pub const DH_AES: &str = "dh-ietf1024-sha256-aes128-cbc-pkcs7";

const GROUP_BYTES: usize = 128;
const PRIME: U1024 = U1024::from_be_hex(concat!(
    "FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DD",
    "EF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7ED",
    "EE386BFB5A899FA5AE9F24117C4B1FE649286651ECE65381FFFFFFFFFFFFFFFF"
));

type Encryptor = cbc::Encryptor<Aes128>;
type Decryptor = cbc::Decryptor<Aes128>;

pub enum Transfer {
    Plain,
    Encrypted(Zeroizing<[u8; 16]>),
}

pub struct Unsupported;

impl Transfer {
    pub fn negotiate(algorithm: &str, input: &[u8]) -> Result<(Self, Vec<u8>), Unsupported> {
        match algorithm {
            PLAIN => Ok((Self::Plain, Vec::new())),
            DH_AES => agree(input),
            _ => Err(Unsupported),
        }
    }

    pub fn wrap(&self, secret: &[u8]) -> (Vec<u8>, Vec<u8>) {
        match self {
            Self::Plain => (Vec::new(), secret.to_vec()),
            Self::Encrypted(key) => {
                let mut iv = [0; 16];
                random(&mut iv);
                let sealed =
                    Encryptor::new(&(**key).into(), &iv.into()).encrypt_padded_vec::<Pkcs7>(secret);
                (iv.to_vec(), sealed)
            }
        }
    }

    pub fn unwrap(&self, parameters: &[u8], value: &[u8]) -> Option<Zeroizing<Vec<u8>>> {
        match self {
            Self::Plain => Some(Zeroizing::new(value.to_vec())),
            Self::Encrypted(key) => {
                let iv: [u8; 16] = parameters.try_into().ok()?;
                Decryptor::new(&(**key).into(), &iv.into())
                    .decrypt_padded_vec::<Pkcs7>(value)
                    .ok()
                    .map(Zeroizing::new)
            }
        }
    }
}

fn agree(peer: &[u8]) -> Result<(Transfer, Vec<u8>), Unsupported> {
    let significant = peer.iter().position(|&byte| byte != 0).unwrap_or(peer.len());
    let peer = &peer[significant..];
    if peer.is_empty() || peer.len() > GROUP_BYTES {
        return Err(Unsupported);
    }
    let mut padded = [0; GROUP_BYTES];
    padded[GROUP_BYTES - peer.len()..].copy_from_slice(peer);
    let peer = U1024::from_be_slice(&padded);
    if peer <= U1024::ONE || peer >= PRIME.wrapping_sub(&U1024::ONE) {
        return Err(Unsupported);
    }

    let params = FixedMontyParams::new(Odd::new(PRIME).expect("the group prime is odd"));
    let mut private_bytes = Zeroizing::new([0; GROUP_BYTES]);
    random(private_bytes.as_mut());
    private_bytes[0] &= 0x7f;
    let private = U1024::from_be_slice(private_bytes.as_ref());

    let public = FixedMontyForm::new(&U1024::from_u8(2), &params)
        .pow(&private)
        .retrieve();
    let mut shared = Zeroizing::new([0; GROUP_BYTES]);
    shared.copy_from_slice(
        FixedMontyForm::new(&peer, &params)
            .pow(&private)
            .retrieve()
            .to_be_bytes()
            .as_ref(),
    );
    let mut key = Zeroizing::new([0; 16]);
    Hkdf::<Sha256>::new(None, shared.as_ref())
        .expand(&[], key.as_mut())
        .expect("16 bytes is a valid HKDF output");
    Ok((Transfer::Encrypted(key), public.to_be_bytes().to_vec()))
}

fn random(buffer: &mut [u8]) {
    getrandom::fill(buffer).expect("the kernel's random generator is always available");
}
