use std::path::{Path, PathBuf};

use anyhow::{Context, Result, ensure};
use sha2::{Digest, Sha256};

use super::keys as disk_keys;
use super::state::{Change, Mode, Plan};
use crate::boot::esp;
use crate::keys;
use crate::paths;
use crate::system::journal::STAGE_REFUSED;
use crate::system::secret::Secret;
use crate::system::{creds, efi, passbox};

pub const FOLDER: &str = "EFI/luft/encryption";
const PLAN: &str = "plan.json";
const SEALED: &str = "plan.cred";
const BOXED: &str = "plan.box";
const SEALED_NAME: &str = "trustd.stage";
const DIGEST: usize = 32;

fn digest(text: &[u8]) -> [u8; DIGEST] {
    Sha256::digest(text).into()
}

pub fn folder() -> Result<PathBuf> {
    Ok(esp::find()?.file(FOLDER))
}

pub fn write(plan: &Plan, recovery: &Secret, passphrase: Option<&Secret>) -> Result<()> {
    plan.check()?;
    let folder = folder()?;
    std::fs::create_dir_all(&folder)?;
    let text = serde_json::to_vec(plan)?;
    match (plan.mode, passphrase) {
        (Mode::Tpm, _) => creds::seal_for_startup(
            SEALED_NAME,
            &Secret::new([digest(&text).as_slice(), recovery.bytes()].concat()),
            Path::new(keys::PCR_PUBLIC_KEY),
            &folder.join(SEALED),
        )?,
        (Mode::Passphrase, Some(passphrase)) => paths::write_private(
            &folder.join(BOXED),
            &passbox::close(recovery, passphrase, &text)?,
        )?,
        (Mode::Passphrase, None) => {}
    }
    paths::write_private(&folder.join(PLAN), &text)?;
    Ok(())
}

pub fn arm() -> Result<()> {
    rustix::fs::sync();
    efi::announce_disk_change(true)?;
    Ok(())
}

pub fn remove() {
    if let Ok(folder) = folder() {
        let _ = std::fs::remove_dir_all(folder);
    }
    let _ = efi::announce_disk_change(false);
}

fn well_formed_recovery_key(key: &Secret) -> bool {
    disk_keys::is_recovery_key(key) && disk_keys::normalize(key) == *key
}

pub struct Staged {
    pub plan: Plan,
    text: Vec<u8>,
    folder: PathBuf,
}

pub fn staged_in(folder: &Path) -> Option<Result<Staged>> {
    let text = std::fs::read(folder.join(PLAN)).ok()?;
    Some(Plan::parse(&text).map(|plan| Staged {
        plan,
        text,
        folder: folder.to_owned(),
    }))
}

impl Staged {
    pub fn header(&self) -> Option<PathBuf> {
        self.plan.header_in(&self.folder)
    }

    pub fn open_sealed(&self) -> Result<Secret> {
        let sealed =
            creds::unseal(SEALED_NAME, &self.folder.join(SEALED)).context(STAGE_REFUSED)?;
        let (bound_to, key) = sealed
            .bytes()
            .split_at_checked(DIGEST)
            .context("The TPM's copy of the encryption plan is cut short")?;
        ensure!(
            bound_to == digest(&self.text),
            "The encryption plan isn't the one Luft sealed to the TPM"
        );
        let key = Secret::new(key.to_vec());
        ensure!(
            match self.plan.change {
                Change::Encrypt => well_formed_recovery_key(&key),
                Change::Decrypt => key.is_empty(),
            },
            "The TPM's copy of the encryption plan doesn't hold what Luft seals"
        );
        Ok(key)
    }

    pub fn open_boxed(&self, passphrase: &Secret) -> Option<Secret> {
        let boxed = std::fs::read(self.folder.join(BOXED)).ok()?;
        passbox::open(&boxed, passphrase, &self.text).filter(well_formed_recovery_key)
    }
}
