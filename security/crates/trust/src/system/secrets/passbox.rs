use anyhow::{Result, anyhow};
use argon2::{Algorithm, Argon2, Params, Version};
use chacha20poly1305::aead::{Aead, KeyInit, Payload};
use chacha20poly1305::{XChaCha20Poly1305, XNonce};

use super::secret::Secret;

const MEMORY_KIB: u32 = 1024 * 1024;
const PASSES: u32 = 4;
const LANES: u32 = 4;
const COSTS: usize = 3 * 4;
const SALT: usize = 16;
const NONCE: usize = 24;

struct Costs {
    memory_kib: u32,
    passes: u32,
    lanes: u32,
}

impl Costs {
    fn for_this_computer() -> Self {
        Self {
            memory_kib: MEMORY_KIB.min(half_the_memory_kib()),
            passes: PASSES,
            lanes: LANES,
        }
    }

    fn bytes(&self) -> [u8; COSTS] {
        let mut bytes = [0u8; COSTS];
        bytes[..4].copy_from_slice(&self.memory_kib.to_le_bytes());
        bytes[4..8].copy_from_slice(&self.passes.to_le_bytes());
        bytes[8..].copy_from_slice(&self.lanes.to_le_bytes());
        bytes
    }

    fn read(bytes: &[u8]) -> Option<Self> {
        let number = |at: usize| Some(u32::from_le_bytes(bytes.get(at..at + 4)?.try_into().ok()?));
        let costs = Self {
            memory_kib: number(0)?,
            passes: number(4)?,
            lanes: number(8)?,
        };
        (costs.memory_kib <= MEMORY_KIB && costs.passes <= PASSES && costs.lanes <= LANES)
            .then_some(costs)
    }
}

fn half_the_memory_kib() -> u32 {
    std::fs::read_to_string("/proc/meminfo")
        .ok()
        .and_then(|info| {
            info.lines()
                .find_map(|line| line.strip_prefix("MemTotal:"))?
                .trim()
                .strip_suffix("kB")?
                .trim()
                .parse::<u64>()
                .ok()
        })
        .map_or(MEMORY_KIB, |total| {
            u32::try_from(total / 2).unwrap_or(MEMORY_KIB)
        })
}

fn derive(passphrase: &Secret, salt: &[u8], costs: &Costs) -> Result<[u8; 32]> {
    let params = Params::new(costs.memory_kib, costs.passes, costs.lanes, Some(32))
        .map_err(|error| anyhow!("{error}"))?;
    let mut key = [0u8; 32];
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
        .hash_password_into(passphrase.bytes(), salt, &mut key)
        .map_err(|error| anyhow!("{error}"))?;
    Ok(key)
}

fn cipher(passphrase: &Secret, salt: &[u8], costs: &Costs) -> Result<XChaCha20Poly1305> {
    let mut key = derive(passphrase, salt, costs)?;
    let cipher = XChaCha20Poly1305::new(&key.into());
    key.fill(0);
    Ok(cipher)
}

pub fn close(secret: &Secret, passphrase: &Secret, bound_to: &[u8]) -> Result<Vec<u8>> {
    close_with(secret, passphrase, bound_to, &Costs::for_this_computer())
}

fn close_with(
    secret: &Secret,
    passphrase: &Secret,
    bound_to: &[u8],
    costs: &Costs,
) -> Result<Vec<u8>> {
    let mut salt = [0u8; SALT];
    let mut nonce = [0u8; NONCE];
    getrandom::fill(&mut salt)?;
    getrandom::fill(&mut nonce)?;
    let header = [costs.bytes().as_slice(), &salt, &nonce].concat();
    let sealed = cipher(passphrase, &salt, costs)?
        .encrypt(
            &XNonce::from(nonce),
            Payload {
                msg: secret.bytes(),
                aad: &[header.as_slice(), bound_to].concat(),
            },
        )
        .map_err(|_| anyhow!("The key couldn't be protected."))?;
    Ok([header, sealed].concat())
}

pub fn open(contents: &[u8], passphrase: &Secret, bound_to: &[u8]) -> Option<Secret> {
    let (header, sealed) = contents.split_at_checked(COSTS + SALT + NONCE)?;
    let (costs, rest) = header.split_at(COSTS);
    let (salt, nonce) = rest.split_at(SALT);
    let costs = Costs::read(costs)?;
    let nonce: [u8; NONCE] = nonce.try_into().ok()?;
    cipher(passphrase, salt, &costs)
        .ok()?
        .decrypt(
            &XNonce::from(nonce),
            Payload {
                msg: sealed,
                aad: &[header, bound_to].concat(),
            },
        )
        .ok()
        .map(Secret::new)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_the_chosen_passphrase_and_binding_open_the_box() {
        let recovery = Secret::from("cbdefghi-jklnrtuv");
        let light = Costs {
            memory_kib: 64,
            passes: 1,
            lanes: 1,
        };
        let sealed =
            close_with(&recovery, &Secret::from("correct horse"), b"plan", &light).unwrap();
        assert_eq!(
            open(&sealed, &Secret::from("correct horse"), b"plan"),
            Some(recovery)
        );
        assert_eq!(open(&sealed, &Secret::from("wrong horse"), b"plan"), None);
        assert_eq!(
            open(&sealed, &Secret::from("correct horse"), b"other"),
            None
        );
    }
}
