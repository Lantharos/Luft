use std::path::Path;

use anyhow::Result;

use super::request::Request;
use super::{Unsealed, certificate_der, has_signing_key};
use crate::system::command::Tool;
use crate::system::efi;
use crate::system::secret::Secret;

const DRIVER_KEY: &str = "/etc/pki/akmods/certs/public_key.der";
const AUTOMATIC_ATTEMPTS: u32 = 3;

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
        && let Some(request) = Request::load()
        && let Some(code) = request.code.clone()
    {
        show_on_restart(&request);
        return Ok(code);
    }
    ask_shim(Request::default())
}

fn ask_shim(mut request: Request) -> Result<String> {
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
    request.code = Some(code.clone());
    request.save()?;
    show_on_restart(&request);
    Ok(code)
}

pub fn follow_up() -> Result<()> {
    let Some(mut request) = Request::load() else {
        return Ok(());
    };
    match enrollment() {
        Enrollment::Enrolled => Request::forget(),
        Enrollment::Pending => show_on_restart(&request),
        Enrollment::None if request.code.is_some() => {
            request.count_miss();
            if request.missed < AUTOMATIC_ATTEMPTS {
                ask_shim(request)?;
            } else {
                request.code = None;
                request.save()?;
            }
        }
        Enrollment::None => {}
    }
    Ok(())
}

pub fn cancel() -> Result<()> {
    if enrollment() == Enrollment::Pending {
        Tool::new("mokutil").arg("--revoke-import").status()?;
    }
    Request::forget();
    show_on_restart(&Request::default());
    Ok(())
}

fn show_on_restart(request: &Request) {
    let notice = match &request.code {
        Some(code) => Tool::new("sushictl")
            .args(["notice", "key-enrollment", code])
            .args((request.missed > 0).then_some("--again")),
        None => Tool::new("sushictl").args(["notice", "clear"]),
    };
    let _ = notice.status();
}
