use std::path::Path;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use crate::disk::SystemDisk;
use crate::disk::requests::{self, ENCRYPT};
use crate::system::firmware::efi;
use crate::system::host::command::Tool;
use crate::system::secrets::creds::{self, Protection};
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;
use crate::system::secrets::{keyring, passbox};

const SEALED_KEY: &str = "EncryptingSystemDiskKey";
pub const FIRST_KEY: &str = "encrypting";

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
enum First {
    RecoveryKey,
    Passphrase,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub partition: String,
    first: First,
    other_key: Vec<u8>,
}

pub struct Keys {
    pub recovery_key: Secret,
    pub passphrase: Secret,
    first: First,
}

impl Keys {
    pub fn first(&self) -> &Secret {
        match self.first {
            First::RecoveryKey => &self.recovery_key,
            First::Passphrase => &self.passphrase,
        }
    }

    pub fn starts_with_passphrase(&self) -> bool {
        self.first == First::Passphrase
    }

    pub fn keep_in_memory(&self) {
        keyring::keep_for_trust_units(FIRST_KEY, self.first());
    }
}

pub fn sealed_key() -> Option<Secret> {
    let sealed = efi::luft_variable(SEALED_KEY)?;
    let scratch = Scratch::empty().ok()?;
    let path = scratch.write("sealed", &Secret::new(sealed)).ok()?;
    creds::unseal(SEALED_KEY, &path).ok()
}

fn seal_for_startup(recovery_key: &Secret) -> Result<()> {
    let scratch = Scratch::empty()?;
    let path = scratch.directory().join("sealed");
    creds::seal(SEALED_KEY, recovery_key, Protection::SignedStartup, &path)?;
    efi::set_luft_variable(SEALED_KEY, Some(&std::fs::read(path)?))?;
    Ok(())
}

pub fn forget_sealed_key() -> std::io::Result<()> {
    efi::set_luft_variable(SEALED_KEY, None)
}

fn typed_at_start(partition: &str) -> Result<Secret> {
    let typed = Tool::new("systemd-ask-password")
        .arg(format!("--id=trustd:encrypting:{partition}"))
        .arg("--timeout=0")
        .arg("Enter the passphrase you chose for Luft, or nothing to start without encrypting:")
        .unhurried()
        .output_bytes()
        .context("Luft couldn't ask for the passphrase it's being encrypted with")?;
    Ok(Secret::new(
        typed.strip_suffix(b"\n").unwrap_or(&typed).to_vec(),
    ))
}

impl Request {
    pub fn new(
        partition: String,
        recovery_key: &Secret,
        passphrase: &Secret,
        tpm: bool,
    ) -> Result<Self> {
        let (first, other_key) = if tpm {
            (
                First::RecoveryKey,
                passbox::close(passphrase, recovery_key, partition.as_bytes())?,
            )
        } else {
            (
                First::Passphrase,
                passbox::close(recovery_key, passphrase, partition.as_bytes())?,
            )
        };
        Ok(Self {
            partition,
            first,
            other_key,
        })
    }

    pub fn save(&self, top: &Path, recovery_key: &Secret) -> Result<()> {
        if self.first == First::RecoveryKey {
            seal_for_startup(recovery_key)?;
        }
        requests::keep(top, ENCRYPT, self).context("The request to encrypt Luft couldn't be kept")
    }

    pub fn waiting(disk: &SystemDisk) -> Option<Self> {
        requests::waiting(disk, ENCRYPT).map(|waiting| waiting.request)
    }

    pub fn waiting_in(top: &Path) -> Option<Self> {
        requests::waiting_in(top, ENCRYPT).map(|waiting| waiting.request)
    }

    fn opened_with(&self, first_key: &Secret) -> Option<Keys> {
        let other = passbox::open(&self.other_key, first_key, self.partition.as_bytes())?;
        let (recovery_key, passphrase) = match self.first {
            First::RecoveryKey => (first_key.clone(), other),
            First::Passphrase => (other, first_key.clone()),
        };
        Some(Keys {
            recovery_key,
            passphrase,
            first: self.first,
        })
    }

    pub fn open_at_start(&self) -> Result<Option<Keys>> {
        if self.first == First::RecoveryKey {
            return Ok(sealed_key().and_then(|key| self.opened_with(&key)));
        }
        loop {
            let typed = typed_at_start(&self.partition)?;
            if typed.is_empty() {
                return Ok(None);
            }
            if let Some(keys) = self.opened_with(&typed) {
                return Ok(Some(keys));
            }
        }
    }

    pub fn open(&self) -> Option<Keys> {
        let keys = keyring::take(FIRST_KEY)
            .into_iter()
            .chain(keyring::systemd_cached())
            .find_map(|key| self.opened_with(&key))?;
        keys.keep_in_memory();
        Some(keys)
    }
}

pub fn forget(top: &Path) -> Result<()> {
    forget_sealed_key()?;
    keyring::forget(FIRST_KEY);
    requests::forget(top, ENCRYPT)
}
