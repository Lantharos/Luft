pub mod encryption;
pub mod layout;
pub mod unlock;

use std::path::PathBuf;

use anyhow::{Context, Result};

use crate::system::host::blocks::{self, Mount};
use crate::system::host::journal;
use unlock::luks::{self, Header};
use unlock::{keys, seal};

const PHYSICAL_ROOTS: [&str; 2] = ["/sysroot", "/"];

pub struct SystemDisk {
    pub partition: String,
    pub mapping: Option<String>,
    pub root: Mount,
}

impl SystemDisk {
    pub fn find() -> Result<Self> {
        let root = PHYSICAL_ROOTS
            .iter()
            .find_map(|path| {
                blocks::mount_at(path).filter(|mount| mount.source.starts_with("/dev"))
            })
            .context("The system disk couldn't be found.")?;
        let name =
            blocks::kernel_name(&root.source).context("The system disk couldn't be found.")?;
        let crypt = blocks::dm_uuid(&name).is_some_and(|uuid| uuid.starts_with("CRYPT-LUKS2"));
        let (partition, mapping) = if crypt {
            let partition = blocks::partition_under(&name)
                .context("The encrypted disk has no partition under it.")?;
            (partition, blocks::dm_name(&name))
        } else {
            (name, None)
        };
        Ok(Self {
            partition,
            mapping,
            root,
        })
    }

    pub fn device(&self) -> PathBuf {
        blocks::device(&self.partition)
    }

    pub fn size(&self) -> u64 {
        blocks::size_bytes(&self.partition)
    }

    pub fn header(&self) -> Result<Option<Header>> {
        luks::read(&self.device(), None, self.size())
    }
}

pub struct DiskStatus {
    pub device: String,
    pub encrypted: bool,
    pub unlock: Vec<&'static str>,
    pub recovery_key_stored: bool,
    pub tpm_refused: bool,
    pub secure_boot_changed: bool,
}

fn unlock_methods(header: &Header) -> Vec<&'static str> {
    let mut methods = Vec::new();
    if header.has(luks::TPM2) {
        methods.push("tpm");
        if header.tpm_pin() {
            methods.push("pin");
        }
    }
    if header.has(luks::FIDO2) {
        methods.push("security-key");
    }
    if !header.passphrase_slots().is_empty() {
        methods.push("passphrase");
    }
    if header.has(luks::RECOVERY) {
        methods.push("recovery-key");
    }
    methods
}

pub fn status() -> Option<DiskStatus> {
    let disk = SystemDisk::find().ok()?;
    let header = disk.header().ok().flatten();
    Some(DiskStatus {
        device: disk.device().display().to_string(),
        encrypted: header.is_some(),
        unlock: header.as_ref().map(unlock_methods).unwrap_or_default(),
        recovery_key_stored: keys::has_escrow(),
        tpm_refused: header.as_ref().is_some_and(|header| header.has(luks::TPM2))
            && journal::tpm_refused_this_boot(),
        secure_boot_changed: seal::secure_boot_changed(),
    })
}
