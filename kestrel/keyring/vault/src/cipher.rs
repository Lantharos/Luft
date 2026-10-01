use chacha20poly1305::aead::{Aead, KeyInit, Payload};
use chacha20poly1305::{XChaCha20Poly1305, XNonce};
use zeroize::Zeroizing;

const NONCE: usize = 24;

pub fn seal(key: &[u8; 32], plaintext: &[u8], aad: &[u8]) -> Vec<u8> {
    let cipher = XChaCha20Poly1305::new(key.into());
    let mut nonce = XNonce::default();
    random(&mut nonce);
    let ciphertext = cipher
        .encrypt(
            &nonce,
            Payload {
                msg: plaintext,
                aad,
            },
        )
        .expect("XChaCha20-Poly1305 encryption can't fail for in-memory buffers");
    let mut sealed = Vec::with_capacity(NONCE + ciphertext.len());
    sealed.extend_from_slice(&nonce);
    sealed.extend_from_slice(&ciphertext);
    sealed
}

pub fn open(key: &[u8; 32], sealed: &[u8], aad: &[u8]) -> Option<Zeroizing<Vec<u8>>> {
    if sealed.len() < NONCE {
        return None;
    }
    let (nonce, ciphertext) = sealed.split_at(NONCE);
    let nonce = XNonce::try_from(nonce).ok()?;
    XChaCha20Poly1305::new(key.into())
        .decrypt(
            &nonce,
            Payload {
                msg: ciphertext,
                aad,
            },
        )
        .ok()
        .map(Zeroizing::new)
}

pub fn random(buffer: &mut [u8]) {
    getrandom::fill(buffer).expect("the kernel's random generator is always available");
}
