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
}

impl Protection {
    fn key(self) -> &'static str {
        match self {
            Self::HostAndTpm => "host+tpm2",
            Self::Host => "host",
            Self::Tpm => "tpm2",
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

pub fn unseal(name: &str, path: &Path) -> Result<Secret> {
    Tool::new("systemd-creds")
        .arg("decrypt")
        .arg(format!("--name={name}"))
        .arg(path)
        .arg("-")
        .output_bytes()
        .map(Secret::new)
}
