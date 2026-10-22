use std::path::{Path, PathBuf};

use anyhow::{Context, Result, ensure};

use super::unlock::{keys, luks, seal};
use crate::keys as signing;
use crate::system::firmware::tpm;
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;

const MAPPING: &str = "luft-installing";
const SHORTEST_PASSPHRASE: usize = 8;

fn check_recovery_key(recovery_key: &Secret) -> Result<()> {
    ensure!(
        keys::is_recovery_key(recovery_key) && keys::normalize(recovery_key) == *recovery_key,
        "That isn't a recovery key Luft makes"
    );
    Ok(())
}

pub fn tpm_unlocks() -> bool {
    tpm::detect().usable && signing::shipped()
}

pub fn format(partition: &Path, recovery_key: &Secret, passphrase: &Secret) -> Result<PathBuf> {
    check_recovery_key(recovery_key)?;
    ensure!(
        tpm_unlocks() || passphrase.text().chars().count() >= SHORTEST_PASSPHRASE,
        "Without a TPM, the disk needs a passphrase of at least {SHORTEST_PASSPHRASE} characters"
    );
    Tool::new("cryptsetup")
        .args([
            "luksFormat",
            "--batch-mode",
            "--type",
            "luks2",
            "--key-file",
            "-",
        ])
        .arg(partition)
        .input(recovery_key)
        .status()
        .context("The disk couldn't be encrypted")?;
    keys::add_recovery_token(partition, 0)?;
    if !passphrase.is_empty() {
        let header = luks::read(partition, None, 0)?.context("The disk lost its encryption")?;
        keys::add_keyslot(partition, recovery_key, passphrase, &header)?;
    }
    Tool::new("cryptsetup")
        .args(["open", "--allow-discards", "--key-file", "-"])
        .arg(partition)
        .arg(MAPPING)
        .input(recovery_key)
        .status()
        .context("The encrypted disk couldn't be opened")?;
    Ok(Path::new("/dev/mapper").join(MAPPING))
}

pub fn seal(partition: &Path, recovery_key: &Secret, state: &Path) -> Result<()> {
    check_recovery_key(recovery_key)?;
    if !tpm_unlocks() {
        return Ok(());
    }
    seal::enroll_when_installed(partition, recovery_key, state)?;
    keys::escrow_in(state, recovery_key)
}
