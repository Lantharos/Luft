use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use super::luks::{self, Header};
use super::{keys, seal, without_key};
use crate::disk::SystemDisk;
use crate::paths;
use crate::system::secrets::secret::Secret;

const KEYS: &str = "/usr/lib/luft/pcr-keys";
const CURRENT: &str = "current";
const RECORD: &str = "tpm-generations.json";

#[derive(Serialize, Deserialize, Clone, PartialEq, Eq, Debug)]
struct Deployment {
    id: String,
    generations: BTreeSet<u32>,
}

#[derive(Serialize, Deserialize, Default, PartialEq, Eq, Debug)]
struct Record {
    slots: BTreeMap<u32, u32>,
    retired: BTreeSet<u32>,
    booted: Option<Deployment>,
    before: Option<Deployment>,
}

pub fn public_key(generation: u32) -> PathBuf {
    Path::new(KEYS).join(format!("{generation}.pem"))
}

pub fn shipped() -> BTreeSet<u32> {
    std::fs::read_dir(KEYS)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| {
            let path = entry.path();
            (path.extension()? == "pem")
                .then(|| path.file_stem()?.to_str()?.parse().ok())
                .flatten()
        })
        .collect()
}

pub fn current() -> Option<u32> {
    let generation = std::fs::read_to_string(Path::new(KEYS).join(CURRENT))
        .ok()?
        .trim()
        .parse()
        .ok()?;
    public_key(generation).exists().then_some(generation)
}

fn deployment_id() -> Option<String> {
    std::fs::read_to_string("/proc/cmdline")
        .ok()?
        .split_whitespace()
        .find_map(|argument| argument.strip_prefix("composefs="))
        .map(str::to_owned)
}

impl Record {
    fn load(state: &Path) -> Self {
        std::fs::read(state.join(RECORD))
            .ok()
            .and_then(|bytes| serde_json::from_slice(&bytes).ok())
            .unwrap_or_default()
    }

    fn save(&self, state: &Path) -> Result<()> {
        paths::ensure_private(state)?;
        paths::write_private(&state.join(RECORD), &serde_json::to_vec(self)?)?;
        Ok(())
    }

    fn started(&mut self, id: String, generations: BTreeSet<u32>) {
        if self.booted.as_ref().is_some_and(|booted| booted.id == id) {
            return;
        }
        self.before = self.booted.replace(Deployment { id, generations });
    }

    fn linkable(&self, shipped: &BTreeSet<u32>) -> BTreeSet<u32> {
        shipped.difference(&self.retired).copied().collect()
    }

    fn missing(&self, shipped: &BTreeSet<u32>) -> Vec<u32> {
        self.linkable(shipped)
            .into_iter()
            .filter(|generation| !self.slots.contains_key(generation))
            .collect()
    }

    fn unused(&self) -> Vec<u32> {
        let (Some(booted), Some(before)) = (&self.booted, &self.before) else {
            return Vec::new();
        };
        self.slots
            .keys()
            .copied()
            .filter(|generation| {
                !booted.generations.contains(generation) && !before.generations.contains(generation)
            })
            .collect()
    }
}

fn signed_slots(header: &Header) -> BTreeSet<u32> {
    header
        .tokens
        .iter()
        .filter(|(_, token)| token.kind == luks::TPM2 && !without_key::sealed_here(token))
        .flat_map(|(_, token)| token.keyslots.iter().filter_map(|slot| slot.parse().ok()))
        .collect()
}

fn read(device: &Path) -> Result<Header> {
    luks::read(device, None, 0)?.context("The disk lost its encryption")
}

fn enroll(
    device: &Path,
    unlock: &Secret,
    pin: &Secret,
    secure_boot_pcr: &str,
    generation: u32,
    replace: bool,
) -> Result<u32> {
    let before = signed_slots(&read(device)?);
    keys::enroll_tpm(
        device,
        unlock,
        pin,
        secure_boot_pcr,
        &public_key(generation),
        replace,
    )?;
    signed_slots(&read(device)?)
        .into_iter()
        .find(|slot| replace || !before.contains(slot))
        .context("The TPM's key didn't get a keyslot")
}

pub fn retired_here() -> bool {
    Record::load(Path::new(paths::STATE))
        .linkable(&shipped())
        .is_empty()
}

pub fn link(
    device: &Path,
    unlock: &Secret,
    pin: &Secret,
    secure_boot_pcr: &str,
    state: &Path,
) -> Result<()> {
    let mut record = Record::load(state);
    record.slots.clear();
    for (index, generation) in record.linkable(&shipped()).into_iter().enumerate() {
        let slot = enroll(device, unlock, pin, secure_boot_pcr, generation, index == 0)?;
        record.slots.insert(generation, slot);
    }
    record.save(state)
}

fn remove(device: &Path, slot: u32) -> Result<()> {
    let header = read(device)?;
    keys::remove_slot(device, &header, slot)
}

pub fn follow_up() -> Result<()> {
    let Some(id) = deployment_id() else {
        return Ok(());
    };
    let state = Path::new(paths::STATE);
    let shipped = shipped();
    let mut record = Record::load(state);
    let known = Record::load(state);
    record.started(id, shipped.clone());
    let Some(secure_boot_pcr) = seal::settled() else {
        return if record == known {
            Ok(())
        } else {
            record.save(state)
        };
    };
    let Ok(disk) = SystemDisk::find() else {
        return Ok(());
    };
    let device = disk.device();
    let Some(header) = disk.header()? else {
        return record.save(state);
    };
    let signed = signed_slots(&header);
    if signed.is_empty() {
        record.slots.clear();
    }
    if signed.is_empty() || header.tpm_pin() {
        return record.save(state);
    }
    if record.slots.values().copied().collect::<BTreeSet<_>>() != signed {
        record.save(state)?;
        let (device, unlock) = seal::unlockable().context(
            "The TPM's disk keys aren't the ones Luft keeps track of, and nothing here opens the disk to link them again",
        )?;
        return link(
            &device,
            &unlock,
            &Secret::default(),
            &secure_boot_pcr,
            state,
        );
    }
    for generation in record.missing(&shipped) {
        let (_, unlock) = seal::unlockable()
            .context("Nothing here opens the disk to link the TPM for newer startup images")?;
        let slot = enroll(
            &device,
            &unlock,
            &Secret::default(),
            &secure_boot_pcr,
            generation,
            false,
        )?;
        record.slots.insert(generation, slot);
        record.save(state)?;
        eprintln!(
            "The TPM now also unlocks the disk for startup images signed with policy key {generation}"
        );
    }
    record.retired.extend(record.unused());
    record.save(state)?;
    for generation in record.retired.clone() {
        if let Some(slot) = record.slots.remove(&generation) {
            remove(&device, slot)?;
            record.save(state)?;
            eprintln!(
                "Startup images signed with policy key {generation} no longer unlock the disk"
            );
        }
    }
    record.save(state)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn started(record: &mut Record, id: &str, generations: &[u32]) {
        record.started(id.to_owned(), generations.iter().copied().collect());
    }

    #[test]
    fn an_older_key_stops_unlocking_once_no_installed_version_is_signed_with_it() {
        let mut record = Record::default();
        record.slots.insert(1, 1);
        started(&mut record, "old", &[1]);
        assert!(record.unused().is_empty());
        started(&mut record, "both", &[1, 2]);
        assert_eq!(record.missing(&[1, 2].into()), vec![2]);
        record.slots.insert(2, 2);
        started(&mut record, "both", &[1, 2]);
        assert!(record.unused().is_empty());
        started(&mut record, "new", &[2]);
        assert!(record.unused().is_empty());
        started(&mut record, "newer", &[2]);
        assert_eq!(record.unused(), vec![1]);
        record.slots.remove(&1);
        record.retired.insert(1);
        started(&mut record, "old", &[1]);
        assert!(record.missing(&[1].into()).is_empty());
        assert!(record.linkable(&[1].into()).is_empty());
        assert_eq!(record.linkable(&[1, 2].into()), [2].into());
    }
}
