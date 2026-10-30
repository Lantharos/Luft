use std::path::Path;

use anyhow::{Context, Result};

use crate::paths;
use crate::system::firmware::efi;
use crate::system::secrets::creds::{self, Protection};
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;

const FOLDER: &str = "luft-encrypting";
const RECOVERY_KEY: (&str, &str) = ("recovery-key.cred", "trustd.encrypting-recovery-key");
const PASSPHRASE: (&str, &str) = ("passphrase.cred", "trustd.encrypting-passphrase");
const MARKER: &str = "EncryptingSystemDisk";
const SEALED_KEY: &str = "EncryptingSystemDiskKey";

pub struct Request {
    pub recovery_key: Secret,
    pub passphrase: Secret,
}

pub fn partition() -> Option<String> {
    efi::luft_variable(MARKER).map(|partuuid| String::from_utf8_lossy(&partuuid).into_owned())
}

pub fn sealed_key() -> Option<Secret> {
    let sealed = efi::luft_variable(SEALED_KEY)?;
    let scratch = Scratch::empty().ok()?;
    let path = scratch.write("sealed", &Secret::new(sealed)).ok()?;
    creds::unseal(SEALED_KEY, &path).ok()
}

fn seal_copy(recovery_key: &Secret) -> Result<()> {
    let scratch = Scratch::empty()?;
    let path = scratch.directory().join("sealed");
    creds::seal(
        SEALED_KEY,
        recovery_key,
        Protection::TpmWhileSecureBootUnchanged,
        &path,
    )?;
    efi::set_luft_variable(SEALED_KEY, Some(&std::fs::read(path)?))?;
    Ok(())
}

impl Request {
    pub fn save(&self, top: &Path, partuuid: &str, tpm: bool) -> Result<()> {
        let folder = top.join(FOLDER);
        paths::ensure_private(&folder)?;
        let protection = if tpm {
            Protection::Tpm
        } else {
            Protection::Unencrypted
        };
        let (file, name) = RECOVERY_KEY;
        creds::seal(name, &self.recovery_key, protection, &folder.join(file))?;
        if !self.passphrase.is_empty() {
            let (file, name) = PASSPHRASE;
            creds::seal(name, &self.passphrase, protection, &folder.join(file))?;
        }
        if tpm {
            seal_copy(&self.recovery_key)?;
        }
        efi::set_luft_variable(MARKER, Some(partuuid.as_bytes()))
            .context("The firmware didn't keep the request to encrypt Luft")
    }

    pub fn load(top: &Path) -> Result<Self> {
        let folder = top.join(FOLDER);
        let (file, name) = RECOVERY_KEY;
        let recovery_key = creds::unseal_allowing_null(name, &folder.join(file))
            .context("The recovery key Luft is being encrypted with is missing")?;
        let (file, name) = PASSPHRASE;
        let passphrase = folder
            .join(file)
            .exists()
            .then(|| creds::unseal_allowing_null(name, &folder.join(file)))
            .transpose()?
            .unwrap_or_default();
        Ok(Self {
            recovery_key,
            passphrase,
        })
    }
}

pub fn forget(top: &Path) -> Result<()> {
    efi::set_luft_variable(SEALED_KEY, None)?;
    efi::set_luft_variable(MARKER, None)?;
    match std::fs::remove_dir_all(top.join(FOLDER)) {
        Err(error) if error.kind() != std::io::ErrorKind::NotFound => Err(error.into()),
        _ => Ok(()),
    }
}
