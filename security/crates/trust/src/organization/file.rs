use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};
use serde::Deserialize;

use crate::system::host::command::Tool;
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;

/// What an organization hands its computers to switch them to its own image: where the image
/// is, the key its images are signed with, and the keys its startup images are signed with.
#[derive(Deserialize)]
#[serde(rename_all = "kebab-case", deny_unknown_fields)]
struct Description {
    name: String,
    image: String,
    signing_key: String,
    secure_boot_certificate: String,
    tpm_policy_keys: BTreeMap<String, String>,
}

pub struct Organization {
    pub name: String,
    pub image: String,
    pub signing_key: PathBuf,
    pub certificate: Vec<u8>,
    pub certificate_file: PathBuf,
    pub policy_keys: Vec<(u32, PathBuf)>,
    _files: Scratch,
}

fn checked(tool: Tool, what: &str) -> Result<Vec<u8>> {
    tool.output_bytes()
        .with_context(|| format!("The organization's {what} isn't one Luft can read."))
}

fn tagged(image: &str) -> bool {
    image
        .rsplit_once('/')
        .is_some_and(|(_, name)| name.contains(':') && !name.contains('@'))
}

impl Organization {
    pub fn read(path: &Path) -> Result<Self> {
        let text =
            std::fs::read_to_string(path).with_context(|| format!("Reading {}", path.display()))?;
        let description: Description =
            toml::from_str(&text).with_context(|| format!("Reading {}", path.display()))?;
        if !tagged(&description.image) {
            bail!(
                "{} names no tag of the organization's image, such as :1.",
                path.display()
            );
        }
        if description.tpm_policy_keys.is_empty() {
            bail!("{} names no TPM policy key.", path.display());
        }
        let files = Scratch::empty()?;
        let signing_key = files.write("signing.pub", &Secret::from(description.signing_key))?;
        checked(
            Tool::new("openssl")
                .args(["pkey", "-pubin", "-noout", "-in"])
                .arg(&signing_key),
            "signing key",
        )?;
        let certificate = checked(
            Tool::new("openssl")
                .args(["x509", "-outform", "DER"])
                .input(&Secret::from(description.secure_boot_certificate)),
            "Secure Boot certificate",
        )?;
        let certificate_file = files.write("secure-boot.der", &Secret::new(certificate.clone()))?;
        let policy_keys = description
            .tpm_policy_keys
            .into_iter()
            .map(|(generation, key)| {
                let generation: u32 = generation.parse().with_context(|| {
                    format!("“{generation}” isn't a TPM policy key generation.")
                })?;
                let file = files.write(&format!("pcr-{generation}.pem"), &Secret::from(key))?;
                checked(
                    Tool::new("openssl")
                        .args(["pkey", "-pubin", "-noout", "-in"])
                        .arg(&file),
                    "TPM policy key",
                )?;
                Ok((generation, file))
            })
            .collect::<Result<_>>()?;
        Ok(Self {
            name: description.name,
            image: description.image,
            signing_key,
            certificate,
            certificate_file,
            policy_keys,
            _files: files,
        })
    }

    /// The image's repository, which its signing key is trusted for.
    pub fn repository(&self) -> &str {
        let name = self.image.rfind('/').map_or(0, |slash| slash + 1);
        self.image[name..]
            .rfind(':')
            .map_or(self.image.as_str(), |colon| &self.image[..name + colon])
    }
}

#[cfg(test)]
mod tests {
    use super::tagged;

    #[test]
    fn only_a_tag_follows_new_builds() {
        assert!(tagged("ghcr.io/acme/luft:1"));
        assert!(tagged("10.0.2.2:5000/acme/luft:1-pilot"));
        assert!(!tagged("10.0.2.2:5000/acme/luft"));
        assert!(!tagged("ghcr.io/acme/luft@sha256:21b3"));
    }
}
