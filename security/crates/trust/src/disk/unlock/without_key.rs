use std::path::Path;

use anyhow::Result;
use sha2::{Digest, Sha256};

use super::keys;
use super::luks::{Header, TPM2, Token};
use crate::boot::fallback;
use crate::disk::SystemDisk;
use crate::keys::mok::{self, Enrollment};
use crate::paths;
use crate::system::firmware::efi::{self, SecureBoot};
use crate::system::firmware::{eventlog, tpm};
use crate::system::host::command::Tool;

const PCRS: [u32; 4] = [4, 7, 8, 9];
const GRUB_COMMANDS: u32 = 8;
const GRUB_FILES: u32 = 9;
const SEALED_TO: &str = "tpm-sealed-without-key";

pub fn sealed_here(token: &Token) -> bool {
    token.kind == TPM2 && token.tpm2_pcrs.contains(&GRUB_FILES)
}

fn pcr(index: u32) -> Option<String> {
    std::fs::read_to_string(format!("/sys/class/tpm/tpm0/pcr-sha256/{index}"))
        .ok()
        .map(|value| value.trim().to_ascii_lowercase())
}

fn measured_by_grub(index: u32) -> bool {
    pcr(index).is_some_and(|value| value.bytes().any(|digit| digit != b'0'))
}

fn this_start() -> Option<String> {
    if !measured_by_grub(GRUB_COMMANDS) || !measured_by_grub(GRUB_FILES) {
        return None;
    }
    let values: Vec<String> = PCRS.into_iter().map(pcr).collect::<Option<_>>()?;
    Some(eventlog::hex(&Sha256::digest(values.concat())))
}

fn has_signed_token(header: &Header) -> bool {
    header
        .tokens
        .iter()
        .any(|(_, token)| token.kind == TPM2 && !sealed_here(token))
}

fn has_token_for_this_way(header: &Header) -> bool {
    header.tokens.iter().any(|(_, token)| sealed_here(token))
}

fn remove(device: &Path, header: &Header) -> Result<()> {
    for (id, token) in header.tokens.iter().filter(|(_, token)| sealed_here(token)) {
        for slot in &token.keyslots {
            Tool::new("cryptsetup")
                .args(["luksKillSlot", "--batch-mode"])
                .arg(device)
                .arg(slot)
                .status()?;
        }
        Tool::new("cryptsetup")
            .args(["token", "remove", "--token-id"])
            .arg(id.to_string())
            .arg(device)
            .status()?;
    }
    let _ = std::fs::remove_file(paths::state(SEALED_TO));
    Ok(())
}

fn seal(device: &Path, header: &Header, measured: &str) -> Result<()> {
    let Some(unlock) = keys::escrowed().filter(|key| keys::opens(device, None, key)) else {
        return Ok(());
    };
    remove(device, header)?;
    let pcrs: Vec<String> = PCRS.iter().map(u32::to_string).collect();
    Tool::new("systemd-cryptenroll")
        .arg("--unlock-key-file=/dev/stdin")
        .arg("--tpm2-device=auto")
        .arg(format!("--tpm2-pcrs={}", pcrs.join("+")))
        .arg("--tpm2-public-key=")
        .arg("--tpm2-public-key-pcrs=")
        .arg("--tpm2-pcrlock=")
        .arg("--tpm2-with-pin=no")
        .arg(device)
        .input(&unlock)
        .status()?;
    paths::ensure_private(paths::STATE)?;
    paths::write_private(&paths::state(SEALED_TO), measured.as_bytes())?;
    eprintln!("The disk unlocks by itself again when Luft starts without its key this way");
    Ok(())
}

pub fn follow_up() -> Result<()> {
    let Ok(disk) = SystemDisk::find() else {
        return Ok(());
    };
    let Some(header) = disk.header()? else {
        return Ok(());
    };
    let device = disk.device();
    if !fallback::started_through() {
        if mok::enrollment() == Enrollment::Enrolled && has_token_for_this_way(&header) {
            remove(&device, &header)?;
        }
        return Ok(());
    }
    let sealable = efi::secure_boot() == SecureBoot::On
        && tpm::detect().usable
        && has_signed_token(&header)
        && !header.tpm_pin()
        && header.reencrypting.is_none();
    let Some(measured) = this_start().filter(|_| sealable) else {
        return Ok(());
    };
    let current =
        std::fs::read_to_string(paths::state(SEALED_TO)).is_ok_and(|sealed| sealed == measured);
    if current && has_token_for_this_way(&header) {
        return Ok(());
    }
    seal(&device, &header, &measured)
}
