use std::path::PathBuf;

use anyhow::{Context, Result, bail};

use super::state::{Change, Mode, Plan};
use super::turn_on::rebuild_boot_files;
use super::{SystemDisk, keys, luks, stage, state};
use crate::boot::cmdline;
use crate::errors::{Busy, Unsupported};
use crate::system::command::Tool;
use crate::system::secret::Secret;
use crate::system::{blocks, keyring};

const HEADERS: &str = "/boot/luft-trust";

fn boot_filesystem(disk: &SystemDisk) -> Result<String> {
    let boot = blocks::mount_at("/boot")
        .and_then(|boot| blocks::kernel_name(&boot.source))
        .filter(|name| *name != disk.partition)
        .context(Unsupported(
            "/boot needs its own partition to keep the disk readable while it's decrypted."
                .to_owned(),
        ))?;
    blocks::fs_uuid(&boot).context("/boot has no UUID.")
}

pub fn turn_off(typed: &Secret) -> Result<()> {
    if Plan::load().is_some() {
        bail!(Busy);
    }
    let disk = SystemDisk::find()?;
    let device = disk.device();
    let Some(header) = luks::read(&device, None, disk.size())? else {
        bail!(Unsupported("The disk isn't encrypted.".to_owned()));
    };
    let key = keys::unlock_key(&device, None, typed)?;
    let plan = Plan {
        change: Change::Decrypt,
        uuid: header.uuid.clone(),
        partuuid: blocks::partuuid(&disk.partition)
            .context("The system partition has no PARTUUID.")?,
        mode: if header.has(luks::TPM2) {
            Mode::Tpm
        } else {
            Mode::Passphrase
        },
        header: Some(PathBuf::from(HEADERS).join(format!("{}.luks", header.uuid))),
        boot_uuid: Some(boot_filesystem(&disk)?),
    };
    stage::write_plan(&plan)?;
    state::set_crypttab(&plan.mapping(), None)?;
    cmdline::change(&[], &["rd.luks.uuid", "rd.luks.data", "rd.luks.options"])?;
    if let Err(error) = rebuild_boot_files() {
        stage::remove();
        return Err(error);
    }
    let header_file = plan.header.clone().context("The plan has no header file")?;
    std::fs::create_dir_all(HEADERS)?;
    std::fs::set_permissions(HEADERS, std::os::unix::fs::PermissionsExt::from_mode(0o700))?;
    let _ = std::fs::remove_file(&header_file);
    Tool::new("cryptsetup")
        .args([
            "reencrypt",
            "--decrypt",
            "--init-only",
            "--batch-mode",
            "--key-file",
            "-",
            "--header",
        ])
        .arg(&header_file)
        .arg(&device)
        .input(&key)
        .status()
        .context("Decrypting couldn't start.")?;
    rustix::fs::sync();
    plan.save()?;
    keyring::hand_over("recovery-key", &key);
    Ok(())
}
