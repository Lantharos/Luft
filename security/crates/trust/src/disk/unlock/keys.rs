use std::path::Path;

use anyhow::{Result, bail};
use luft_recovery_key::Reading;

use super::luks::{self, Header};
use crate::errors::{MistypedKey, NeedsKey, Unsupported, WrongKey};
use crate::keys as signing;
use crate::paths;
use crate::system::firmware::efi::{self, SecureBoot};
use crate::system::firmware::tpm::{self, Tpm};
use crate::system::host::command::Tool;
use crate::system::secrets::creds::{self, Protection};
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;

pub const SHORTEST_PASSPHRASE: usize = 8;
const ESCROW: &str = "recovery-key.cred";
const ESCROW_NAME: &str = "trustd.recovery-key";
const NEW_PIN_CREDENTIAL: &str = "cryptenroll.new-tpm2-pin";

pub fn generate_recovery_key() -> Result<Secret> {
    Ok(Secret::new(luft_recovery_key::generate()?))
}

pub fn normalize(typed: &Secret) -> Result<Secret> {
    match luft_recovery_key::read(typed.bytes()) {
        Reading::Key(key) => Ok(Secret::new(key)),
        Reading::Mistyped => Err(MistypedKey.into()),
        Reading::NotAKey => Ok(typed.clone()),
    }
}

pub fn recovery_key(typed: &Secret) -> Result<Secret> {
    match luft_recovery_key::read(typed.bytes()) {
        Reading::Key(key) => Ok(Secret::new(key)),
        Reading::Mistyped => Err(MistypedKey.into()),
        Reading::NotAKey => bail!(Unsupported(
            "That isn't a recovery key made by this computer.".to_owned()
        )),
    }
}

pub fn is_recovery_key(key: &Secret) -> bool {
    matches!(luft_recovery_key::read(key.bytes()), Reading::Key(_))
}

pub fn escrow_in(state: &Path, key: &Secret) -> Result<()> {
    paths::ensure_private(state)?;
    creds::seal(ESCROW_NAME, key, Protection::Tpm, &state.join(ESCROW))
}

pub fn escrow(key: &Secret) -> Result<()> {
    escrow_in(Path::new(paths::STATE), key)
}

pub fn escrowed() -> Option<Secret> {
    creds::unseal(ESCROW_NAME, &paths::state(ESCROW)).ok()
}

pub fn has_escrow() -> bool {
    paths::state(ESCROW).exists()
}

pub fn opens(device: &Path, header: Option<&Path>, key: &Secret) -> bool {
    let check = Tool::new("cryptsetup").args(["open", "--test-passphrase", "--key-file", "-"]);
    let check = match header {
        Some(header) => check.arg("--header").arg(header),
        None => check,
    };
    check.arg(device).input(key).succeeds()
}

pub fn opens_slot(device: &Path, slot: u32, key: &Secret) -> bool {
    Tool::new("cryptsetup")
        .args(["open", "--test-passphrase", "--key-file", "-", "--key-slot"])
        .arg(slot.to_string())
        .arg(device)
        .input(key)
        .succeeds()
}

pub fn unlock_key(device: &Path, header: Option<&Path>, typed: &Secret) -> Result<Secret> {
    let key = if typed.is_empty() {
        escrowed().ok_or(NeedsKey)?
    } else {
        normalize(typed)?
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
    let scratch = Scratch::empty()?;
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
    unavailable_reason(&tpm::detect())
}

pub fn unavailable_reason(tpm: &Tpm) -> Option<String> {
    if !tpm.usable {
        return Some(tpm.reason.clone());
    }
    if matches!(efi::secure_boot(), SecureBoot::Off | SecureBoot::Setup) {
        return Some("Secure Boot is off, so anything can start this computer and the TPM can't tell Luft from something made to look like it. Turn Secure Boot on in the firmware settings, and the TPM can unlock the disk.".to_owned());
    }
    if !signing::shipped() || !efi::measured_uki() {
        return Some("Restart through Luft's signed startup first, so the TPM can check how the computer started.".to_owned());
    }
    None
}

pub fn remove_slot(device: &Path, header: &Header, slot: u32) -> Result<()> {
    Tool::new("cryptsetup")
        .args(["luksKillSlot", "--batch-mode"])
        .arg(device)
        .arg(slot.to_string())
        .status()?;
    let holders = header
        .tokens
        .iter()
        .filter(|(_, token)| token.keyslots.contains(&slot.to_string()));
    for (id, _) in holders {
        Tool::new("cryptsetup")
            .args(["token", "remove", "--token-id"])
            .arg(id.to_string())
            .arg(device)
            .status()?;
    }
    Ok(())
}

pub fn enroll_tpm(
    device: &Path,
    unlock: &Secret,
    pin: &Secret,
    secure_boot_pcr: &str,
    public_key: &Path,
    replace: bool,
) -> Result<()> {
    let credentials = Scratch::empty()?;
    if !pin.is_empty() {
        credentials.write(NEW_PIN_CREDENTIAL, pin)?;
    }
    Tool::new("systemd-cryptenroll")
        .arg("--unlock-key-file=/dev/stdin")
        .args(replace.then_some("--wipe-slot=tpm2"))
        .arg("--tpm2-device=auto")
        .arg(format!("--tpm2-pcrs=7:sha256={secure_boot_pcr}"))
        .arg(format!("--tpm2-public-key={}", public_key.display()))
        .arg("--tpm2-public-key-pcrs=11")
        .arg("--tpm2-pcrlock=")
        .arg(format!(
            "--tpm2-with-pin={}",
            if pin.is_empty() { "no" } else { "yes" }
        ))
        .env("CREDENTIALS_DIRECTORY", credentials.directory())
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
