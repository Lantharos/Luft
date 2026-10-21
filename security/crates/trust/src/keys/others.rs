use anyhow::{Result, bail};

use super::CERTIFICATE;
use super::mok;
use crate::boot::files;
use crate::errors::Unsupported;
use crate::system::firmware::efi;
use crate::system::host::command::Tool;
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;

const NAME_FIELDS: [&str; 3] = ["commonName", "organizationName", "organizationalUnitName"];

fn shipped() -> Vec<Vec<u8>> {
    let mut shipped = files::shim_certificates();
    shipped.extend(std::fs::read(CERTIFICATE));
    shipped
}

pub fn enrolled() -> Vec<Vec<u8>> {
    let shipped = shipped();
    efi::enrolled_certificates()
        .into_iter()
        .filter(|certificate| !shipped.contains(certificate))
        .collect()
}

pub fn removal_requested() -> bool {
    !efi::removal_requested_certificates().is_empty()
}

fn field<'a>(subject: &'a str, wanted: &str) -> Option<&'a str> {
    subject.lines().find_map(|line| {
        let (key, value) = line.split_once('=')?;
        (key.trim() == wanted).then(|| value.trim())
    })
}

pub fn name(certificate: &[u8]) -> String {
    let subject = Tool::new("openssl")
        .args([
            "x509",
            "-inform",
            "DER",
            "-noout",
            "-subject",
            "-nameopt",
            "multiline,utf8",
        ])
        .input(&Secret::new(certificate.to_vec()))
        .output()
        .unwrap_or_default();
    NAME_FIELDS
        .iter()
        .find_map(|wanted| field(&subject, wanted))
        .unwrap_or("A key without a name")
        .to_owned()
}

pub fn request_removal() -> Result<String> {
    let others = enrolled();
    if others.is_empty() {
        bail!(Unsupported(
            "Every key added to this computer is from Luft.".to_owned()
        ));
    }
    if removal_requested() {
        withdraw_removal()?;
    }
    let code = mok::one_time_code()?;
    let scratch = Scratch::empty()?;
    let keys = others
        .into_iter()
        .enumerate()
        .map(|(index, certificate)| {
            scratch.write(&format!("key-{index}.der"), &Secret::new(certificate))
        })
        .collect::<Result<Vec<_>>>()?;
    Tool::new("mokutil")
        .arg("--delete")
        .args(&keys)
        .arg("--hash-file")
        .arg(mok::hash_file(&scratch, &code)?)
        .status()?;
    Ok(code)
}

pub fn withdraw_removal() -> Result<()> {
    if removal_requested() {
        Tool::new("mokutil").arg("--revoke-delete").status()?;
    }
    Ok(())
}
