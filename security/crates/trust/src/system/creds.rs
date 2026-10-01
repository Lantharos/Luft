use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use anyhow::Result;

use super::command::Tool;
use super::secret::Secret;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Protection {
    Tpm,
    Disk,
}

impl Protection {
    pub fn name(self) -> &'static str {
        match self {
            Self::Tpm => "tpm",
            Self::Disk => "disk",
        }
    }

    fn key(self) -> &'static str {
        match self {
            Self::Tpm => "host+tpm2",
            Self::Disk => "host",
        }
    }
}

fn private(path: &Path) -> Result<()> {
    std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o600))?;
    Ok(())
}

pub fn seal(name: &str, secret: &Secret, protection: Protection, path: &Path) -> Result<()> {
    Tool::new("systemd-creds")
        .arg("encrypt")
        .arg(format!("--name={name}"))
        .arg(format!("--with-key={}", protection.key()))
        .arg("--tpm2-pcrs=")
        .arg("-")
        .arg(path)
        .input(secret)
        .status()?;
    private(path)
}

pub fn seal_for_startup(
    name: &str,
    secret: &Secret,
    pcr_public_key: &Path,
    path: &Path,
) -> Result<()> {
    Tool::new("systemd-creds")
        .arg("encrypt")
        .arg(format!("--name={name}"))
        .arg("--with-key=tpm2")
        .arg("--tpm2-pcrs=7")
        .arg(format!("--tpm2-public-key={}", pcr_public_key.display()))
        .arg("--tpm2-public-key-pcrs=11")
        .arg("-")
        .arg(path)
        .input(secret)
        .status()?;
    private(path)
}

pub fn unseal(name: &str, path: &Path) -> Result<Secret> {
    Tool::new("systemd-creds")
        .arg("decrypt")
        .arg(format!("--name={name}"))
        .arg(path)
        .arg("-")
        .output_bytes()
        .map(Secret::new)
}
