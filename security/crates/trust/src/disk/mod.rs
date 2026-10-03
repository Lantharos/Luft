mod initrd;
pub mod keys;
pub mod luks;
pub mod mask;
mod preflight;
pub mod reencrypt;
pub mod stage;
pub mod state;
mod turn_off;
mod turn_on;
pub mod worker;

use std::path::PathBuf;

use anyhow::{Context, Result};

use crate::system::blocks::{self, Mount};
use crate::system::journal;
use luks::{Direction, Header};
use state::{Change, Plan};

pub use initrd::run as run_in_initrd;
pub use preflight::{Check, check};
pub use turn_off::turn_off;
pub use turn_on::turn_on;

pub struct SystemDisk {
    pub partition: String,
    pub mapping: Option<String>,
    pub root: Mount,
}

impl SystemDisk {
    pub fn find() -> Result<Self> {
        let root = blocks::mount_at("/").context("The system disk couldn't be found.")?;
        let name =
            blocks::kernel_name(&root.source).context("The system disk couldn't be found.")?;
        let crypt = blocks::dm_uuid(&name).is_some_and(|uuid| uuid.starts_with("CRYPT-LUKS2"));
        let (partition, mapping) = if crypt {
            let partition =
                underneath(&name).context("The encrypted disk has no partition under it.")?;
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
        let detached = Plan::load()
            .filter(|plan| plan.change == Change::Decrypt)
            .and_then(|plan| plan.header);
        luks::read(&self.device(), detached.as_deref(), self.size())
    }
}

fn underneath(name: &str) -> Option<String> {
    let below = blocks::slaves(name).into_iter().next()?;
    if blocks::dm_uuid(&below).is_some() {
        underneath(&below)
    } else {
        Some(below)
    }
}

pub struct DiskStatus {
    pub device: String,
    pub encrypted: bool,
    pub state: &'static str,
    pub progress: f64,
    pub unlock: Vec<&'static str>,
    pub recovery_key_stored: bool,
    pub tpm_refused: bool,
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
    let plan = Plan::load();
    let (state, progress) = match (&plan, &header) {
        (Some(plan), None) if plan.change == Change::Encrypt => ("starting", 0.0),
        (Some(plan), Some(header)) => (
            match plan.change {
                Change::Encrypt => "encrypting",
                Change::Decrypt => "decrypting",
            },
            if header.reencrypting.is_some() {
                header.done
            } else {
                1.0
            },
        ),
        (None, Some(header)) => match header.reencrypting {
            Some(Direction::Encrypt) => ("encrypting", header.done),
            Some(Direction::Decrypt) => ("decrypting", header.done),
            None => ("on", 1.0),
        },
        _ => ("off", 0.0),
    };
    Some(DiskStatus {
        device: disk.device().display().to_string(),
        encrypted: header.is_some(),
        state,
        progress,
        unlock: match (&plan, &header) {
            (Some(plan), Some(_)) if plan.change == Change::Encrypt => vec![
                match plan.mode {
                    state::Mode::Tpm => "tpm",
                    state::Mode::Passphrase => "passphrase",
                },
                "recovery-key",
            ],
            (_, Some(header)) => unlock_methods(header),
            _ => Vec::new(),
        },
        recovery_key_stored: keys::has_escrow(),
        tpm_refused: header
            .as_ref()
            .is_some_and(|header| header.has(luks::TPM2) || plan.is_some())
            && journal::tpm_refused_this_boot(),
    })
}
