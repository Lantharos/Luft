use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use anyhow::{Context, Result};

use super::secret::Secret;
use crate::disk::unlock::generations;
use crate::system::host::command::Tool;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Protection {
    HostAndTpm,
    Host,
    Tpm,
    SignedStartup,
}

impl Protection {
    fn key(self) -> &'static str {
        match self {
            Self::HostAndTpm => "host+tpm2",
            Self::Host => "host",
            Self::Tpm | Self::SignedStartup => "tpm2",
        }
    }

    fn pcrs(self) -> &'static str {
        match self {
            Self::SignedStartup => "7",
            _ => "",
        }
    }

    fn signed_policy(self) -> Result<(String, &'static str)> {
        match self {
            Self::SignedStartup => {
                let generation = generations::current().context(
                    "This system doesn't carry the key its startup image is signed with",
                )?;
                Ok((
                    generations::public_key(generation).display().to_string(),
                    "11",
                ))
            }
            _ => Ok((String::new(), "")),
        }
    }
}

fn private(path: &Path) -> Result<()> {
    std::fs::set_permissions(path, std::fs::Permissions::from_mode(0o600))?;
    Ok(())
}

pub fn seal(name: &str, secret: &Secret, protection: Protection, path: &Path) -> Result<()> {
    let (public_key, signed_pcrs) = protection.signed_policy()?;
    Tool::new("systemd-creds")
        .arg("encrypt")
        .arg(format!("--name={name}"))
        .arg(format!("--with-key={}", protection.key()))
        .arg(format!("--tpm2-pcrs={}", protection.pcrs()))
        .arg(format!("--tpm2-public-key={public_key}"))
        .arg(format!("--tpm2-public-key-pcrs={signed_pcrs}"))
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
