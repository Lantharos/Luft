use std::path::{Path, PathBuf};

use anyhow::{Result, bail};

use super::CERTIFICATE;
use super::request::Request;
use crate::errors::Unsupported;
use crate::system::command::Tool;
use crate::system::efi::{self, SecureBoot};
use crate::system::scratch::Scratch;
use crate::system::secret::Secret;

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

fn listed_in(certificates: Vec<Vec<u8>>) -> bool {
    std::fs::read(CERTIFICATE).is_ok_and(|ours| certificates.contains(&ours))
}

pub fn enrollment() -> Enrollment {
    if listed_in(efi::enrolled_certificates()) {
        Enrollment::Enrolled
    } else if listed_in(efi::requested_certificates()) {
        Enrollment::Pending
    } else {
        Enrollment::None
    }
}

pub(super) fn one_time_code() -> Result<String> {
    let mut bytes = [0u8; 8];
    getrandom::fill(&mut bytes)?;
    Ok(bytes
        .iter()
        .map(|byte| char::from(b'0' + byte % 10))
        .collect())
}

pub fn request() -> Result<String> {
    match enrollment() {
        Enrollment::Enrolled => bail!(Unsupported(
            "This computer already trusts Luft's key.".to_owned()
        )),
        Enrollment::Pending => {
            let request = Request::load().unwrap_or_default();
            match request.code.clone() {
                Some(code) => {
                    show_on_restart(&request);
                    Ok(code)
                }
                None => ask_again(request),
            }
        }
        Enrollment::None => ask_shim(Request::default()),
    }
}

fn revoke() -> Result<()> {
    Tool::new("mokutil").arg("--revoke-import").status()
}

fn ask_again(request: Request) -> Result<String> {
    revoke()?;
    ask_shim(request)
}

pub(super) fn hash_file(scratch: &Scratch, code: &str) -> Result<PathBuf> {
    let hash = Tool::new("mokutil")
        .arg(format!("--generate-hash={code}"))
        .output_bytes()
        .map(Secret::new)?;
    scratch.write("mok-hash", &hash)
}

fn import(code: &str) -> Result<()> {
    let scratch = Scratch::empty()?;
    Tool::new("mokutil")
        .arg("--import")
        .arg(Path::new(CERTIFICATE))
        .arg("--hash-file")
        .arg(hash_file(&scratch, code)?)
        .status()
}

fn ask_shim(mut request: Request) -> Result<String> {
    let code = one_time_code()?;
    import(&code)?;
    request.code = Some(code.clone());
    request.save()?;
    show_on_restart(&request);
    Ok(code)
}

fn missed(mut request: Request) -> Result<()> {
    request.count_miss();
    if request.missed < AUTOMATIC_ATTEMPTS {
        ask_shim(request).map(drop)
    } else {
        request.code = None;
        request.save()
    }
}

pub fn follow_up() -> Result<()> {
    if efi::secure_boot() != SecureBoot::On || !super::shipped() {
        return Ok(());
    }
    match (enrollment(), Request::load()) {
        (Enrollment::Enrolled, _) => Request::forget(),
        (Enrollment::Pending, Some(request)) => show_on_restart(&request),
        (Enrollment::Pending, None) => ask_again(Request::default()).map(drop)?,
        (Enrollment::None, Some(request)) if request.code.is_some() => missed(request)?,
        (Enrollment::None, Some(_)) => {}
        (Enrollment::None, None) => missed(Request::default())?,
    }
    Ok(())
}

pub fn cancel() -> Result<()> {
    if enrollment() == Enrollment::Pending {
        revoke()?;
    }
    Request::declined(AUTOMATIC_ATTEMPTS).save()?;
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
