use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use anyhow::Result;

use super::secret::Secret;
use crate::system::host::command::Tool;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Protection {
    HostAndTpm,
    Host,
    Tpm,
    TpmWhileSecureBootUnchanged,
    Unencrypted,
}

impl Protection {
    fn key(self) -> &'static str {
        match self {
            Self::HostAndTpm => "host+tpm2",
            Self::Host => "host",
            Self::Tpm | Self::TpmWhileSecureBootUnchanged => "tpm2",
            Self::Unencrypted => "null",
        }
    }

    fn pcrs(self) -> &'static str {
        match self {
            Self::TpmWhileSecureBootUnchanged => "7",
            _ => "",
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
        .arg(format!("--tpm2-pcrs={}", protection.pcrs()))
        .arg("--tpm2-public-key-pcrs=")
        .arg("-")
        .arg(path)
        .input(secret)
        .status()?;
    private(path)
}

fn decrypt(name: &str, path: &Path, allow_null: bool) -> Result<Secret> {
    Tool::new("systemd-creds")
        .arg("decrypt")
        .arg(format!("--name={name}"))
        .args(allow_null.then_some("--allow-null"))
        .arg(path)
        .arg("-")
        .output_bytes()
        .map(Secret::new)
}

pub fn unseal(name: &str, path: &Path) -> Result<Secret> {
    decrypt(name, path, false)
}

pub fn unseal_allowing_null(name: &str, path: &Path) -> Result<Secret> {
    decrypt(name, path, true)
}
