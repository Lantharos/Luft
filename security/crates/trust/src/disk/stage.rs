use std::path::Path;

use anyhow::{Context, Result};
use argon2::{Algorithm, Argon2, Params, Version};
use chacha20poly1305::aead::{Aead, KeyInit};
use chacha20poly1305::{XChaCha20Poly1305, XNonce};

use super::state::Plan;
use crate::keys;
use crate::paths::{self, STAGE};
use crate::system::creds;
use crate::system::secret::Secret;

const PLAN: &str = "plan.json";
const SEALED: &str = "recovery-key.cred";
const BOXED: &str = "recovery-key.box";
const SEALED_NAME: &str = "trustd.stage";
const SALT: usize = 16;
const NONCE: usize = 24;

fn derive(passphrase: &Secret, salt: &[u8]) -> Result<[u8; 32]> {
    let params =
        Params::new(256 * 1024, 3, 1, Some(32)).map_err(|error| anyhow::anyhow!("{error}"))?;
    let mut key = [0u8; 32];
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
        .hash_password_into(passphrase.bytes(), salt, &mut key)
        .map_err(|error| anyhow::anyhow!("{error}"))?;
    Ok(key)
}

pub fn boxed(recovery: &Secret, passphrase: &Secret) -> Result<Vec<u8>> {
    let mut salt = [0u8; SALT];
    let mut nonce = [0u8; NONCE];
    getrandom::fill(&mut salt)?;
    getrandom::fill(&mut nonce)?;
    let mut key = derive(passphrase, &salt)?;
    let cipher = XChaCha20Poly1305::new(&key.into());
    key.fill(0);
    let sealed = cipher
        .encrypt(&XNonce::from(nonce), recovery.bytes())
        .map_err(|_| anyhow::anyhow!("The recovery key couldn't be protected."))?;
    Ok([salt.as_slice(), nonce.as_slice(), &sealed].concat())
}

pub fn unbox(contents: &[u8], passphrase: &Secret) -> Option<Secret> {
    let (salt, rest) = contents.split_at_checked(SALT)?;
    let (nonce, sealed) = rest.split_at_checked(NONCE)?;
    let mut key = derive(passphrase, salt).ok()?;
    let cipher = XChaCha20Poly1305::new(&key.into());
    key.fill(0);
    let nonce: [u8; NONCE] = nonce.try_into().ok()?;
    cipher
        .decrypt(&XNonce::from(nonce), sealed)
        .ok()
        .map(Secret::new)
}

pub fn write(plan: &Plan, recovery: &Secret, passphrase: Option<&Secret>) -> Result<()> {
    paths::ensure_private(STAGE)?;
    match passphrase {
        Some(passphrase) => {
            paths::write_private(&paths::stage(BOXED), &boxed(recovery, passphrase)?)?
        }
        None => creds::seal_for_startup(
            SEALED_NAME,
            recovery,
            &keys::pcr_public_key(),
            &paths::stage(SEALED),
        )?,
    }
    paths::write_private(&paths::stage(PLAN), serde_json::to_string(plan)?.as_bytes())?;
    Ok(())
}

pub fn write_plan(plan: &Plan) -> Result<()> {
    paths::ensure_private(STAGE)?;
    paths::write_private(&paths::stage(PLAN), serde_json::to_string(plan)?.as_bytes())?;
    Ok(())
}

pub fn remove() {
    let _ = std::fs::remove_dir_all(STAGE);
}

pub fn plan_in(folder: &Path) -> Option<Plan> {
    let text = std::fs::read_to_string(folder.join(PLAN)).ok()?;
    serde_json::from_str(&text).ok()
}

pub fn open_sealed(folder: &Path) -> Result<Secret> {
    creds::unseal(SEALED_NAME, &folder.join(SEALED)).context(crate::system::journal::STAGE_REFUSED)
}

pub fn open_boxed(folder: &Path, passphrase: &Secret) -> Option<Secret> {
    unbox(&std::fs::read(folder.join(BOXED)).ok()?, passphrase)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_the_chosen_passphrase_opens_the_box() {
        let recovery = Secret::from("cbdefghi-jklnrtuv");
        let sealed = boxed(&recovery, &Secret::from("correct horse")).unwrap();
        assert_eq!(
            unbox(&sealed, &Secret::from("correct horse")),
            Some(recovery)
        );
        assert_eq!(unbox(&sealed, &Secret::from("wrong horse")), None);
    }
}
