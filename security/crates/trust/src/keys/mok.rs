use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};

use super::CERTIFICATE;
use super::request::Request;
use crate::boot::startup;
use crate::errors::Unsupported;
use crate::paths;
use crate::system::firmware::efi::{self, SecureBoot};
use crate::system::host::command::Tool;
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;

const AUTOMATIC_ATTEMPTS: u32 = 3;
const CODES: u64 = 100_000_000;
pub const BLUE_SCREEN_SECONDS: u32 = 60;

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
    loop {
        let mut bytes = [0u8; 8];
        getrandom::fill(&mut bytes)?;
        let drawn = u64::from_le_bytes(bytes);
        if drawn < u64::MAX - u64::MAX % CODES {
            return Ok(format!("{:08}", drawn % CODES));
        }
    }
}

pub fn request() -> Result<String> {
    request_in(Path::new(paths::STATE))
}

pub fn request_in(state: &Path) -> Result<String> {
    match enrollment() {
        Enrollment::Enrolled => bail!(Unsupported(
            "This computer already trusts Luft's key.".to_owned()
        )),
        Enrollment::Pending => {
            let request = Request::load_in(state).unwrap_or_default();
            match request.code.clone() {
                Some(code) => {
                    show_on_restart(&request);
                    startup::arrange()?;
                    Ok(code)
                }
                None => ask_again(request, state),
            }
        }
        Enrollment::None => ask_shim(Request::default(), state),
    }
}

fn revoke() -> Result<()> {
    Tool::new("mokutil").arg("--revoke-import").status()
}

fn ask_again(request: Request, state: &Path) -> Result<String> {
    revoke()?;
    ask_shim(request, state)
}

pub(super) fn hash_file(scratch: &Scratch, code: &str) -> Result<PathBuf> {
    let answers = Tool::new("mokutil")
        .arg("--generate-hash")
        .input(&Secret::from(format!("{code}\n{code}\n")))
        .output_bytes()
        .map(Secret::new)?;
    let hash = answers
        .text()
        .lines()
        .last()
        .context("mokutil made no hash of the one-time code")?;
    scratch.write("mok-hash", &Secret::from(format!("{hash}\n")))
}

pub(super) fn wait_longer_on_blue_screen() -> Result<()> {
    Tool::new("mokutil")
        .arg(format!("--timeout={BLUE_SCREEN_SECONDS}"))
        .status()
}

fn import(code: &str) -> Result<()> {
    let scratch = Scratch::empty()?;
    Tool::new("mokutil")
        .arg("--import")
        .arg(Path::new(CERTIFICATE))
        .arg("--hash-file")
        .arg(hash_file(&scratch, code)?)
        .status()?;
    wait_longer_on_blue_screen()
}

fn ask_shim(mut request: Request, state: &Path) -> Result<String> {
    let code = match request.code.clone() {
        Some(code) => code,
        None => one_time_code()?,
    };
    import(&code)?;
    request.code = Some(code.clone());
    request.save_in(state)?;
    show_on_restart(&request);
    startup::arrange()?;
    Ok(code)
}

fn missed(mut request: Request) -> Result<()> {
    request.count_miss();
    if request.missed < AUTOMATIC_ATTEMPTS {
        ask_shim(request, Path::new(paths::STATE)).map(drop)
    } else {
        request.code = None;
        request.save()?;
        startup::arrange()
    }
}

pub fn follow_up() -> Result<()> {
    if efi::secure_boot() != SecureBoot::On || !super::shipped() {
        return Ok(());
    }
    match (enrollment(), Request::load()) {
        (Enrollment::Enrolled, _) => Request::forget(),
        (Enrollment::Pending, Some(request)) => show_on_restart(&request),
        (Enrollment::Pending, None) => {
            ask_again(Request::default(), Path::new(paths::STATE)).map(drop)?
        }
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
    startup::arrange()
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
