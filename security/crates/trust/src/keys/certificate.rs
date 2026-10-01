use std::path::Path;

use anyhow::Result;

use crate::system::command::Tool;
use crate::system::secret::Secret;

const VALID_DAYS: &str = "7300";

pub fn new_key() -> Result<Secret> {
    Tool::new("openssl")
        .args([
            "genpkey",
            "-quiet",
            "-algorithm",
            "RSA",
            "-pkeyopt",
            "rsa_keygen_bits:2048",
        ])
        .output_bytes()
        .map(Secret::new)
}

fn host_name() -> String {
    std::fs::read_to_string("/etc/hostname")
        .ok()
        .map(|name| name.trim().to_owned())
        .filter(|name| !name.is_empty())
        .unwrap_or_else(|| "this computer".to_owned())
}

pub fn self_signed(key: &Path, pem: &Path, der: &Path) -> Result<()> {
    let subject = format!("/O=Luft/OU={}/CN=Luft Secure Boot key", host_name());
    Tool::new("openssl")
        .args([
            "req", "-new", "-x509", "-sha256", "-days", VALID_DAYS, "-subj", &subject,
        ])
        .args(["-addext", "basicConstraints=critical,CA:FALSE"])
        .args(["-addext", "keyUsage=critical,digitalSignature"])
        .args(["-addext", "extendedKeyUsage=codeSigning"])
        .arg("-key")
        .arg(key)
        .arg("-out")
        .arg(pem)
        .status()?;
    Tool::new("openssl")
        .args(["x509", "-outform", "DER", "-in"])
        .arg(pem)
        .arg("-out")
        .arg(der)
        .status()
}

pub fn public_key(key: &Path, public: &Path) -> Result<()> {
    Tool::new("openssl")
        .args(["pkey", "-pubout", "-in"])
        .arg(key)
        .arg("-out")
        .arg(public)
        .status()
}
