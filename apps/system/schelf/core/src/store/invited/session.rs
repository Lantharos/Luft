use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use luft_dbus::runtime::block_on;
use luft_dbus::secrets;
use luft_software::http::{self, OFFLINE};
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::AUTH;
use crate::store::device;
use crate::store::signed;

const APP_ID: &str = "com.lantharos.schelf";
const SECRET: &str = "schelf.store";

static SESSION: Mutex<Option<String>> = Mutex::new(None);

/// Who is signed in to schelf.store on this computer.
#[derive(Serialize, Deserialize, Clone, Type)]
pub struct Account {
    pub email: String,
    pub name: String,
}

#[derive(Deserialize)]
struct Signed {
    user: Account,
}

fn path() -> PathBuf {
    device::folder().join("account.json")
}

fn slot() -> std::sync::MutexGuard<'static, Option<String>> {
    SESSION
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

pub fn account() -> Option<Account> {
    serde_json::from_slice(&fs::read(path()).ok()?).ok()
}

/// The session schelf.store gave this computer, which only Luft Keyring
/// keeps. None when nobody is signed in.
pub fn token() -> Result<Option<String>, String> {
    if account().is_none() {
        return Ok(None);
    }
    let mut slot = slot();
    if slot.is_none() {
        *slot = block_on(secrets::load(APP_ID, SECRET))?
            .map(|bytes| String::from_utf8(bytes).map_err(|error| error.to_string()))
            .transpose()?;
    }
    Ok(slot.clone())
}

pub fn keep(token: &str, account: &Account) -> Result<(), String> {
    block_on(secrets::store(APP_ID, SECRET, token.as_bytes()))?;
    let text = serde_json::to_vec_pretty(account).map_err(|error| error.to_string())?;
    crate::disk::replace(&path(), &text).map_err(|error| error.to_string())?;
    *slot() = Some(token.to_owned());
    Ok(())
}

pub fn forget() -> Result<(), String> {
    *slot() = None;
    super::remove(&path())?;
    block_on(secrets::delete(APP_ID, SECRET)).map(drop)
}

fn answer<T: DeserializeOwned>(
    response: Result<ureq::http::Response<ureq::Body>, ureq::Error>,
) -> Result<T, String> {
    let response = response.map_err(signed::refused)?;
    serde_json::from_str(&http::read(response)?).map_err(|_| OFFLINE.to_owned())
}

fn bearer(token: &str) -> String {
    format!("Bearer {token}")
}

/// What schelf.store answers at `url` to `token`.
pub fn get<T: DeserializeOwned>(url: &str, token: &str) -> Result<T, String> {
    answer(
        http::agent()
            .get(url)
            .header("authorization", bearer(token))
            .call(),
    )
}

/// Who `token` signs in, or None when schelf.store doesn't take it.
pub fn whose(token: &str) -> Result<Option<Account>, String> {
    let signed: Option<Signed> = get(&format!("{AUTH}get-session"), token)?;
    Ok(signed.map(|signed| signed.user))
}

/// Ends the session on schelf.store too, when it can be reached.
pub fn end(token: &str) {
    let _ = http::agent()
        .post(format!("{AUTH}sign-out"))
        .header("authorization", bearer(token))
        .content_type("application/json")
        .send("{}");
}
