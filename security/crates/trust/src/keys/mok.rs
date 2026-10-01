use std::path::Path;

use anyhow::Result;

use super::{Unsealed, certificate_der, has_signing_key};
use crate::paths;
use crate::system::command::Tool;
use crate::system::efi;
use crate::system::secret::Secret;

const DRIVER_KEY: &str = "/etc/pki/akmods/certs/public_key.der";
const CODE: &str = "enrollment-code";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Enrollment {
    None,
    Pending,
    Enrolled,
}

impl Enrollment {
    pub fn name(self) -> &'static str {
        match self {
            Self::None => "none",
            Self::Pending => "pending",
            Self::Enrolled => "enrolled",
        }
    }
}

fn listed_in(certificates: Vec<Vec<u8>>, certificate: &Path) -> bool {
    std::fs::read(certificate).is_ok_and(|ours| certificates.contains(&ours))
}

pub fn enrollment() -> Enrollment {
    if !has_signing_key() {
        Enrollment::None
    } else if listed_in(efi::enrolled_certificates(), &certificate_der()) {
        Enrollment::Enrolled
    } else if listed_in(efi::requested_certificates(), &certificate_der()) {
        Enrollment::Pending
    } else {
        Enrollment::None
    }
}

pub fn driver_key_enrolled() -> bool {
    listed_in(efi::enrolled_certificates(), Path::new(DRIVER_KEY))
}

fn one_time_code() -> Result<String> {
    let mut bytes = [0u8; 8];
    getrandom::fill(&mut bytes)?;
    Ok(bytes
        .iter()
        .map(|byte| char::from(b'0' + byte % 10))
        .collect())
}

pub fn request() -> Result<String> {
    if enrollment() == Enrollment::Pending
        && let Ok(code) = std::fs::read_to_string(paths::state(CODE))
    {
        show_on_restart(Some(&code));
        return Ok(code);
    }
    let code = one_time_code()?;
    let scratch = Unsealed::empty()?;
    let hash = Tool::new("mokutil")
        .arg(format!("--generate-hash={code}"))
        .output_bytes()
        .map(Secret::new)?;
    let hash_file = scratch.write("mok-hash", &hash)?;
    Tool::new("mokutil")
        .arg("--import")
        .arg(certificate_der())
        .arg("--hash-file")
        .arg(&hash_file)
        .status()?;
    paths::write_private(&paths::state(CODE), code.as_bytes())?;
    show_on_restart(Some(&code));
    Ok(code)
}

pub fn cancel() -> Result<()> {
    if enrollment() == Enrollment::Pending {
        Tool::new("mokutil").arg("--revoke-import").status()?;
    }
    let _ = std::fs::remove_file(paths::state(CODE));
    show_on_restart(None);
    Ok(())
}

fn show_on_restart(code: Option<&str>) {
    let notice = match code {
        Some(code) => Tool::new("sushictl").args(["notice", "key-enrollment", code]),
        None => Tool::new("sushictl").args(["notice", "clear"]),
    };
    let _ = notice.status();
}
