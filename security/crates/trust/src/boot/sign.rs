use std::path::Path;

use anyhow::{Context, Result};

use crate::keys::{self, Unsealed};
use crate::system::command::Tool;

const MODULE_MAGIC: &[u8] = b"~Module signature appended~\n";
const PKEY_ID_PKCS7: u8 = 2;

pub fn efi_binary(input: &Path, output: &Path, keys: &Unsealed) -> Result<()> {
    if let Some(folder) = output.parent() {
        std::fs::create_dir_all(folder)?;
    }
    let partial = output.with_extension("partial");
    Tool::new("/usr/lib/systemd/systemd-sbsign")
        .arg("sign")
        .arg(format!("--private-key={}", keys.signing_key().display()))
        .arg(format!("--certificate={}", keys::certificate().display()))
        .arg(format!("--output={}", partial.display()))
        .arg(input)
        .status()
        .with_context(|| format!("{} couldn't be signed.", input.display()))?;
    std::fs::rename(&partial, output)?;
    Ok(())
}

fn unsigned(module: &[u8]) -> &[u8] {
    let Some(body) = module.strip_suffix(MODULE_MAGIC) else {
        return module;
    };
    let Some(info) = body.len().checked_sub(12).map(|start| &body[start..]) else {
        return module;
    };
    let signature = u32::from_be_bytes([info[8], info[9], info[10], info[11]]) as usize;
    body.len()
        .checked_sub(12 + signature)
        .map_or(module, |end| &body[..end])
}

pub fn kernel_module(module: &Path, hash: &str, keys: &Unsealed) -> Result<()> {
    let contents = std::fs::read(module)?;
    let body = unsigned(&contents).to_vec();
    let scratch = keys.write("module", &crate::system::secret::Secret::new(body.clone()))?;
    let signature = Tool::new("openssl")
        .args([
            "cms",
            "-sign",
            "-binary",
            "-noattr",
            "-nocerts",
            "-nosmimecap",
            "-outform",
            "DER",
        ])
        .arg("-md")
        .arg(hash)
        .arg("-signer")
        .arg(keys::certificate())
        .arg("-inkey")
        .arg(keys.signing_key())
        .arg("-in")
        .arg(&scratch)
        .output_bytes()?;
    let mut signed = body;
    signed.extend_from_slice(&signature);
    signed.extend_from_slice(&[0, 0, PKEY_ID_PKCS7, 0, 0, 0, 0, 0]);
    signed.extend_from_slice(&(signature.len() as u32).to_be_bytes());
    signed.extend_from_slice(MODULE_MAGIC);
    let partial = module.with_extension("partial");
    std::fs::write(&partial, signed)?;
    std::fs::rename(partial, module)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_an_existing_signature() {
        let mut module = b"module body".to_vec();
        module.extend_from_slice(b"SIG");
        module.extend_from_slice(&[0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3]);
        module.extend_from_slice(MODULE_MAGIC);
        assert_eq!(unsigned(&module), b"module body");
        assert_eq!(unsigned(b"plain"), b"plain");
    }
}
