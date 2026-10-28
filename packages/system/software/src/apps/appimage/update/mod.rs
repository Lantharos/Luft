mod digest;
mod signature;
mod source;

use std::collections::HashMap;
use std::fs;
use std::io::Read;
use std::os::unix::fs::PermissionsExt;
use std::path::Path;

use serde::Serialize;

use super::bundle::{self, Bundle};
use super::integrate;
use super::library::{self, AppImage};
use crate::http::{self, OFFLINE};
use crate::progress::Stage;
use crate::task::Task;
use digest::Expected;
use source::{Control, resolve, secure};

const HEADER_BYTES: usize = 64 * 1024;
const INCOMPLETE: &str = "This app's update information is incomplete.";

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Available {
    pub version: Option<String>,
    pub file_name: Option<String>,
    pub size: u64,
    #[serde(skip)]
    url: String,
    #[serde(skip)]
    expected: Expected,
}

fn header(url: &str) -> Result<HashMap<String, String>, String> {
    let response = http::agent()
        .get(url)
        .header("Range", format!("bytes=0-{}", HEADER_BYTES - 1))
        .call()
        .map_err(|_| OFFLINE.to_string())?;
    let mut bytes = Vec::new();
    response
        .into_body()
        .into_reader()
        .take(HEADER_BYTES as u64)
        .read_to_end(&mut bytes)
        .map_err(|_| OFFLINE.to_string())?;
    let text = String::from_utf8_lossy(&bytes);
    Ok(text
        .lines()
        .take_while(|line| !line.is_empty())
        .filter_map(|line| line.split_once(':'))
        .map(|(key, value)| (key.trim().to_owned(), value.trim().to_owned()))
        .collect())
}

fn sha256(header: &HashMap<String, String>, control: &Control, url: &str) -> Option<String> {
    if let Some(hash) = header.get("SHA-256") {
        return Some(hash.to_lowercase());
    }
    let name = header
        .get("Filename")
        .map(String::as_str)
        .or_else(|| url.rsplit('/').next())?;
    control
        .published
        .iter()
        .find(|published| published.name == name)
        .map(|published| published.sha256.clone())
}

pub fn check(app: &AppImage) -> Result<Option<Available>, String> {
    let Some(source) = source::source(&app.path) else {
        return Ok(None);
    };
    let control = source::control_file(source)?;
    let header = header(secure(&control.url)?)?;
    let sha1 = header.get("SHA-1").ok_or(INCOMPLETE)?.to_lowercase();
    if sha1 == digest::sha1_of(&app.path)? {
        return Ok(None);
    }
    let url = resolve(&control.url, header.get("URL").ok_or(INCOMPLETE)?);
    secure(&url)?;
    let expected = sha256(&header, &control, &url).map_or(Expected::Sha1(sha1), Expected::Sha256);
    Ok(Some(Available {
        version: control.version,
        file_name: header.get("Filename").cloned(),
        size: header
            .get("Length")
            .and_then(|length| length.parse().ok())
            .unwrap_or(0),
        url,
        expected,
    }))
}

fn verified(staging: &Path, available: &Available, key: Option<&[u8]>) -> Result<Bundle, String> {
    let signed = key
        .map(|_| {
            signature::signed(staging).ok_or("The update isn't signed by this app's publisher.")
        })
        .transpose()?;
    let unsigned = signed.as_ref().map(|signed| signed.unsigned.as_slice());
    let checked = digest::check(staging, &available.expected, unsigned)?;
    if !checked.matches {
        return Err("The download was damaged. Try again.".into());
    }
    if let (Some(key), Some(signed), Some(digest)) = (key, &signed, &checked.signed) {
        signature::verify(key, signed, digest)?;
    }
    fs::set_permissions(staging, fs::Permissions::from_mode(0o755))
        .map_err(|error| error.to_string())?;
    bundle::read(staging)
}

pub fn apply(app: &AppImage, task: Task) -> Result<AppImage, String> {
    task.progress(Stage::Preparing, None);
    let available = check(app)?.ok_or("This app is already up to date.")?;
    let key = signature::key(&app.path);
    let staging = app.path.with_extension("AppImage.part");
    http::download(&available.url, &staging, task)?;
    task.progress(Stage::Installing, None);
    let bundle = verified(&staging, &available, key.as_deref()).inspect_err(|_| {
        let _ = fs::remove_file(&staging);
    })?;
    fs::rename(&staging, &app.path).map_err(|error| error.to_string())?;
    integrate::integrate(&app.id, &app.path, &bundle)?;
    if let Some(sabine_app) = &bundle.sabine_app {
        sabine_app.record()?;
    }
    library::find(&app.id)
}
