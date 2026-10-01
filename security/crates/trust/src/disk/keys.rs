use std::path::Path;

use anyhow::{Result, bail};

use super::luks::{self, Header};
use crate::errors::{NeedsKey, Unsupported, WrongKey};
use crate::keys::{self as signing, Unsealed};
use crate::paths;
use crate::system::command::Tool;
use crate::system::creds::{self, Protection};
use crate::system::secret::Secret;
use crate::system::{efi, tpm};

const MODHEX: &[u8; 16] = b"cbdefghijklnrtuv";
const ESCROW: &str = "recovery-key.cred";
const ESCROW_NAME: &str = "luft-trust.recovery-key";
const PIN: &str = "pin.cred";
const PIN_NAME: &str = "luft-trust.pin";

pub fn generate_recovery_key() -> Result<Secret> {
    let mut bytes = [0u8; 32];
    getrandom::fill(&mut bytes)?;
    let mut key = Vec::with_capacity(71);
    for (index, byte) in bytes.iter().enumerate() {
        if index > 0 && index % 4 == 0 {
            key.push(b'-');
        }
        key.push(MODHEX[usize::from(byte >> 4)]);
        key.push(MODHEX[usize::from(byte & 0xf)]);
    }
    bytes.fill(0);
    Ok(Secret::new(key))
}

pub fn normalize(typed: &Secret) -> Secret {
    let letters: Vec<u8> = typed
        .bytes()
        .iter()
        .filter(|byte| !matches!(byte, b'-' | b' '))
        .map(u8::to_ascii_lowercase)
        .collect();
    if letters.len() != 64 || !letters.iter().all(|letter| MODHEX.contains(letter)) {
        return typed.clone();
    }
    let mut key = Vec::with_capacity(71);
    for (index, letter) in letters.iter().enumerate() {
        if index > 0 && index % 8 == 0 {
            key.push(b'-');
        }
        key.push(*letter);
    }
    Secret::new(key)
}

pub fn is_recovery_key(key: &Secret) -> bool {
    let normal = normalize(key);
    normal.bytes().len() == 71
        && normal
            .bytes()
            .iter()
            .all(|byte| *byte == b'-' || MODHEX.contains(byte))
}

pub fn escrow(key: &Secret) -> Result<()> {
    paths::ensure_private(paths::STATE)?;
    creds::seal(ESCROW_NAME, key, Protection::Tpm, &paths::state(ESCROW))
}

pub fn escrowed() -> Option<Secret> {
    creds::unseal(ESCROW_NAME, &paths::state(ESCROW)).ok()
}

pub fn has_escrow() -> bool {
    paths::state(ESCROW).exists()
}

pub fn forget_escrow() {
    let _ = std::fs::remove_file(paths::state(ESCROW));
}

pub fn opens(device: &Path, header: Option<&Path>, key: &Secret) -> bool {
    let check = Tool::new("cryptsetup").args(["open", "--test-passphrase", "--key-file", "-"]);
    let check = match header {
        Some(header) => check.arg("--header").arg(header),
        None => check,
    };
    check.arg(device).input(key).succeeds()
}

pub fn unlock_key(device: &Path, header: Option<&Path>, typed: &Secret) -> Result<Secret> {
    let key = if typed.is_empty() {
        escrowed().ok_or(NeedsKey)?
    } else {
        normalize(typed)
    };
    if !opens(device, header, &key) {
        return Err(if typed.is_empty() {
            NeedsKey.into()
        } else {
            WrongKey.into()
        });
    }
    Ok(key)
}

pub fn add_keyslot(device: &Path, unlock: &Secret, new: &Secret, header: &Header) -> Result<u32> {
    let slot = header.free_slot();
    let scratch = Unsealed::empty()?;
    let new_key = scratch.write("new-key", new)?;
    Tool::new("cryptsetup")
        .args([
            "luksAddKey",
            "--batch-mode",
            "--key-file",
            "-",
            "--new-key-slot",
        ])
        .arg(slot.to_string())
        .arg(device)
        .arg(&new_key)
        .input(unlock)
        .status()?;
    Ok(slot)
}

pub fn add_recovery_token(device: &Path, slot: u32) -> Result<()> {
    let token = Secret::from(format!(
        r#"{{"type":"{}","keyslots":["{slot}"]}}"#,
        luks::RECOVERY
    ));
    Tool::new("cryptsetup")
        .args(["token", "import", "--json-file", "-"])
        .arg(device)
        .input(&token)
        .status()
}

pub fn remove_tokens(device: &Path, header: &Header, kind: &str) -> Result<()> {
    for slot in header.slots_of(kind) {
        Tool::new("cryptsetup")
            .args(["luksKillSlot", "--batch-mode"])
            .arg(device)
            .arg(slot.to_string())
            .status()?;
    }
    for (id, _) in header.tokens.iter().filter(|(_, token)| token.kind == kind) {
        Tool::new("cryptsetup")
            .args(["token", "remove", "--token-id"])
            .arg(id.to_string())
            .arg(device)
            .status()?;
    }
    Ok(())
}

pub fn tpm_unavailable_reason() -> Option<String> {
    let tpm = tpm::detect();
    if !tpm.usable {
        return Some(tpm.reason);
    }
    if !signing::has_pcr_key() || !efi::measured_uki() {
        return Some("Restart through Luft's signed startup first, so the TPM can check how the computer started.".to_owned());
    }
    None
}

pub fn enroll_tpm(device: &Path, unlock: &Secret, pin: &Secret) -> Result<()> {
    if let Some(reason) = tpm_unavailable_reason() {
        bail!(Unsupported(reason));
    }
    Tool::new("systemd-cryptenroll")
        .arg("--unlock-key-file=/dev/stdin")
        .arg("--wipe-slot=tpm2")
        .arg("--tpm2-device=auto")
        .arg("--tpm2-pcrs=7")
        .arg(format!(
            "--tpm2-public-key={}",
            signing::pcr_public_key().display()
        ))
        .arg("--tpm2-public-key-pcrs=11")
        .arg("--tpm2-pcrlock=")
        .arg(format!(
            "--tpm2-with-pin={}",
            if pin.is_empty() { "no" } else { "yes" }
        ))
        .env("NEWPIN", pin.text())
        .arg(device)
        .input(unlock)
        .status()
}

pub fn check_pin(pin: &Secret) -> Result<()> {
    let digits = pin.text();
    if !pin.is_empty()
        && (!(6..=20).contains(&digits.len()) || !digits.bytes().all(|byte| byte.is_ascii_digit()))
    {
        bail!(Unsupported("A PIN is 6 to 20 digits.".to_owned()));
    }
    Ok(())
}

pub fn keep_pin_for_later(pin: &Secret) -> Result<()> {
    paths::ensure_private(paths::STATE)?;
    creds::seal(PIN_NAME, pin, Protection::Tpm, &paths::state(PIN))
}

pub fn pin_kept_for_later() -> Secret {
    creds::unseal(PIN_NAME, &paths::state(PIN)).unwrap_or_default()
}

pub fn forget_kept_pin() {
    let _ = std::fs::remove_file(paths::state(PIN));
}
