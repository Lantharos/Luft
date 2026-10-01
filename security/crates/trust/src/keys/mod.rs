mod certificate;
pub mod mok;
mod unsealed;

use std::path::PathBuf;

use anyhow::{Context, Result, bail};

use crate::paths::{self, STATE};
use crate::system::creds::{self, Protection};
use crate::system::secret::Secret;
use crate::system::tpm;

pub use unsealed::Unsealed;

const SIGNING_KEY: &str = "secure-boot.key.cred";
const PCR_KEY: &str = "pcr.key.cred";
const SIGNING_NAME: &str = "luft-trust.secure-boot";
const PCR_NAME: &str = "luft-trust.pcr";
const PROTECTION: &str = "protection";
const DKMS: &str = "/etc/dkms/framework.conf.d";

pub fn certificate() -> PathBuf {
    paths::state("secure-boot.crt")
}

pub fn certificate_der() -> PathBuf {
    paths::state("secure-boot.der")
}

pub fn pcr_public_key() -> PathBuf {
    paths::state("pcr-public-key.pem")
}

pub fn has_signing_key() -> bool {
    paths::state(SIGNING_KEY).exists() && certificate_der().exists()
}

pub fn has_pcr_key() -> bool {
    paths::state(PCR_KEY).exists() && pcr_public_key().exists()
}

pub fn protection(disk_encrypted: bool) -> Result<Protection, &'static str> {
    if tpm::detect().usable {
        Ok(Protection::Tpm)
    } else if disk_encrypted {
        Ok(Protection::Disk)
    } else {
        Err(
            "A signing key needs the TPM or an encrypted disk to keep it safe, and this computer has neither.",
        )
    }
}

pub fn stored_protection() -> Option<Protection> {
    match std::fs::read_to_string(paths::state(PROTECTION))
        .ok()?
        .trim()
    {
        "tpm" => Some(Protection::Tpm),
        "disk" => Some(Protection::Disk),
        _ => None,
    }
}

pub fn create(disk_encrypted: bool) -> Result<()> {
    if has_signing_key() {
        return Ok(());
    }
    let protection = match protection(disk_encrypted) {
        Ok(protection) => protection,
        Err(reason) => bail!(reason),
    };
    paths::ensure_private(STATE)?;
    let scratch = Unsealed::empty()?;
    let signing = certificate::new_key()?;
    let signing_path = scratch.write("secure-boot.key", &signing)?;
    certificate::self_signed(&signing_path, &certificate(), &certificate_der())?;
    creds::seal(
        SIGNING_NAME,
        &signing,
        protection,
        &paths::state(SIGNING_KEY),
    )?;
    if protection == Protection::Tpm {
        let pcr = certificate::new_key()?;
        let pcr_path = scratch.write("pcr.key", &pcr)?;
        certificate::public_key(&pcr_path, &pcr_public_key())?;
        creds::seal(PCR_NAME, &pcr, protection, &paths::state(PCR_KEY))?;
    }
    paths::write_private(&paths::state(PROTECTION), protection.name().as_bytes())?;
    sign_modules_built_by_dkms()
}

fn sign_modules_built_by_dkms() -> Result<()> {
    let folder = std::path::Path::new(DKMS);
    if !folder.parent().is_some_and(std::path::Path::exists) {
        return Ok(());
    }
    std::fs::create_dir_all(folder)?;
    let settings = format!(
        "mok_signing_key={}\nmok_certificate={}\nsign_file=/usr/libexec/luft-trust/sign-module\n",
        paths::state(SIGNING_KEY).display(),
        certificate_der().display()
    );
    std::fs::write(folder.join("luft-trust.conf"), settings)?;
    Ok(())
}

pub fn unseal() -> Result<Unsealed> {
    let keys = Unsealed::empty()?;
    let signing = creds::unseal(SIGNING_NAME, &paths::state(SIGNING_KEY))
        .context("The signing key couldn't be opened. If the TPM was cleared, make a new key.")?;
    keys.write("secure-boot.key", &signing)?;
    if has_pcr_key() {
        let pcr: Secret = creds::unseal(PCR_NAME, &paths::state(PCR_KEY))?;
        keys.write("pcr.key", &pcr)?;
    }
    Ok(keys)
}
