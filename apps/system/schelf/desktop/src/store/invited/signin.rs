use std::sync::Mutex;
use std::time::{Duration, Instant};

use luft_software::http::{self, OFFLINE};
use serde::{Deserialize, Serialize};
use serde_json::json;
use specta::Type;

use super::AUTH;
use super::session::{self, Account};

const CLIENT: &str = "schelf-cli";
const GRANT: &str = "urn:ietf:params:oauth:grant-type:device_code";
const SLOWER: Duration = Duration::from_secs(5);

/// A sign-in waiting to be approved in the browser.
struct Waiting {
    device_code: String,
    until: Instant,
}

static WAITING: Mutex<Option<Waiting>> = Mutex::new(None);

#[derive(Deserialize)]
struct Code {
    device_code: String,
    user_code: String,
    verification_uri: String,
    verification_uri_complete: Option<String>,
    expires_in: u64,
    interval: u64,
}

#[derive(Deserialize)]
struct Token {
    access_token: Option<String>,
    error: Option<String>,
}

/// What signing in shows: the code to compare on the page that approves it,
/// and how long to wait between asking whether it was.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Approval {
    pub code: String,
    pub page: String,
    pub interval_ms: u64,
}

#[derive(Serialize, Type)]
#[serde(
    tag = "state",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum SignIn {
    Waiting { interval_ms: u64 },
    Approved { account: Account },
    Declined,
    Expired,
}

fn waiting() -> std::sync::MutexGuard<'static, Option<Waiting>> {
    WAITING
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn post<T: serde::de::DeserializeOwned>(path: &str, body: &serde_json::Value) -> Result<T, String> {
    let response = http::agent()
        .post(format!("{AUTH}{path}"))
        .config()
        .http_status_as_error(false)
        .build()
        .content_type("application/json")
        .send(body.to_string())
        .map_err(http::failure)?;
    serde_json::from_str(&http::read(response)?).map_err(|_| OFFLINE.to_owned())
}

/// Asks schelf.store for a code to approve this computer's sign-in with.
pub fn start() -> Result<Approval, String> {
    let code: Code = post("device/code", &json!({ "client_id": CLIENT }))?;
    *waiting() = Some(Waiting {
        device_code: code.device_code,
        until: Instant::now() + Duration::from_secs(code.expires_in),
    });
    Ok(Approval {
        code: code.user_code,
        page: code
            .verification_uri_complete
            .unwrap_or(code.verification_uri),
        interval_ms: Duration::from_secs(code.interval).as_millis() as u64,
    })
}

/// Asks once whether the sign-in was approved, and keeps the session it gave
/// when it was.
pub fn poll(interval_ms: u64) -> Result<SignIn, String> {
    let device_code = match waiting().as_ref() {
        Some(waiting) if Instant::now() < waiting.until => waiting.device_code.clone(),
        _ => return Ok(SignIn::Expired),
    };
    let token: Token = post(
        "device/token",
        &json!({ "grant_type": GRANT, "device_code": device_code, "client_id": CLIENT }),
    )?;
    if let Some(token) = token.access_token {
        *waiting() = None;
        let account = session::whose(&token)?.ok_or(OFFLINE)?;
        session::keep(&token, &account)?;
        return Ok(SignIn::Approved { account });
    }
    match token.error.as_deref() {
        Some("authorization_pending") => Ok(SignIn::Waiting { interval_ms }),
        Some("slow_down") => Ok(SignIn::Waiting {
            interval_ms: interval_ms + SLOWER.as_millis() as u64,
        }),
        Some("access_denied") => {
            *waiting() = None;
            Ok(SignIn::Declined)
        }
        _ => {
            *waiting() = None;
            Ok(SignIn::Expired)
        }
    }
}

pub fn cancel() {
    *waiting() = None;
}
