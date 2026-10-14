use std::fs::{self, DirBuilder, OpenOptions};
use std::io::Write;
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::{Path, PathBuf};

use anyhow::Result;

use super::keyfile::KeyFile;
use super::{Key, Keys, LongTermKey, Pairing};

pub const STORAGE: &str = "/var/lib/bluetooth";

const UNAUTHENTICATED_COMBINATION: u8 = 4;
const PERIPHERAL_GROUPS: [&str; 2] = ["PeripheralLongTermKey", "SlaveLongTermKey"];
const CENTRAL_GROUP: &str = "LongTermKey";

fn info_path(storage: &Path, pairing: &Pairing) -> PathBuf {
    storage
        .join(pairing.adapter.to_string())
        .join(pairing.device.to_string())
        .join("info")
}

fn hex(key: &Key) -> String {
    key.iter().map(|byte| format!("{byte:02X}")).collect()
}

fn current(path: &Path) -> Option<String> {
    fs::read_to_string(path).ok()
}

fn updated(existing: Option<&str>, pairing: &Pairing) -> String {
    let mut info = existing.map(KeyFile::parse).unwrap_or_default();
    if existing.is_none() {
        info.set("General", "Trusted", "true");
        info.set("General", "Blocked", "false");
        info.set(
            "General",
            "SupportedTechnologies",
            if pairing.low_energy() {
                "LE;"
            } else {
                "BR/EDR;"
            },
        );
    }
    if info.get("General", "Name").is_none()
        && let Some(name) = &pairing.name
    {
        info.set("General", "Name", name);
    }
    if info.get("General", "Class").is_none()
        && let Some(class) = pairing.class
    {
        info.set("General", "Class", format!("0x{class:06X}"));
    }
    match &pairing.keys {
        Keys::Classic { link_key } => {
            info.set("LinkKey", "Key", hex(link_key));
            if info.get("LinkKey", "Type").is_none() {
                info.set("LinkKey", "Type", UNAUTHENTICATED_COMBINATION);
            }
            if info.get("LinkKey", "PINLength").is_none() {
                info.set("LinkKey", "PINLength", 0);
            }
        }
        Keys::LowEnergy {
            random_address,
            long_term_key,
            identity_key,
        } => {
            info.set(
                "General",
                "AddressType",
                if *random_address { "static" } else { "public" },
            );
            if let Some(long_term_key) = long_term_key {
                set_long_term_key(&mut info, long_term_key);
            }
            if let Some(identity_key) = identity_key {
                info.set("IdentityResolvingKey", "Key", hex(identity_key));
            }
        }
    }
    info.render()
}

fn set_long_term_key(info: &mut KeyFile, key: &LongTermKey) {
    let (groups, kind): (&[&str], u8) = if key.secure_connections() {
        info.remove_group(CENTRAL_GROUP);
        (&PERIPHERAL_GROUPS, 2 + u8::from(key.authenticated))
    } else {
        for group in PERIPHERAL_GROUPS {
            info.remove_group(group);
        }
        (&[CENTRAL_GROUP], u8::from(key.authenticated))
    };
    for group in groups {
        info.set(group, "Key", hex(&key.key));
        info.set(group, "Authenticated", kind);
        info.set(group, "EncSize", key.size);
        info.set(group, "EDiv", key.ediv);
        info.set(group, "Rand", key.rand);
    }
}

pub fn waiting<'a>(storage: &Path, pairings: &'a [Pairing]) -> Vec<&'a Pairing> {
    pairings
        .iter()
        .filter(|pairing| {
            let existing = current(&info_path(storage, pairing));
            existing.as_deref() != Some(updated(existing.as_deref(), pairing).as_str())
        })
        .collect()
}

pub fn import(storage: &Path, pairings: &[Pairing]) -> Result<usize> {
    let waiting = waiting(storage, pairings);
    for pairing in &waiting {
        let path = info_path(storage, pairing);
        let device = path.parent().expect("info lives in a device folder");
        DirBuilder::new()
            .recursive(true)
            .mode(0o700)
            .create(device)?;
        let existing = current(&path);
        let staged = device.join(".info.new");
        let mut file = OpenOptions::new()
            .write(true)
            .create(true)
            .truncate(true)
            .mode(0o600)
            .open(&staged)?;
        file.write_all(updated(existing.as_deref(), pairing).as_bytes())?;
        file.sync_all()?;
        fs::rename(&staged, &path)?;
    }
    Ok(waiting.len())
}
