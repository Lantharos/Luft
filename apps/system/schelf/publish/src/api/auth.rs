use std::time::{Duration, Instant};

use serde::Deserialize;
use serde_json::json;

use super::credentials::{store_session, stored_session};
use super::dashboard::{Dashboard, Json, text};
use super::http::{Body, post_any, request};
use crate::error::{Error, Result};
use crate::ui::SIGN_IN;
use crate::ui::output::{blank, done, line, note, step};
use crate::ui::style::{accent, bold, interactive};
use crate::ui::system::open_browser;

const CLIENT_ID: &str = "schelf-cli";
const GRANT: &str = "urn:ietf:params:oauth:grant-type:device_code";

#[derive(Deserialize)]
struct DeviceCode {
    device_code: String,
    user_code: String,
    verification_uri: String,
    verification_uri_complete: Option<String>,
    expires_in: u64,
    interval: u64,
}

#[derive(Deserialize)]
struct DeviceToken {
    access_token: Option<String>,
    error: Option<String>,
}

/// Someone signed in, with what the store knows about them.
pub struct Session {
    pub token: String,
    pub account: Json,
}

fn poll_for_token(api: &str, code: &DeviceCode) -> Result<String> {
    let mut interval = Duration::from_secs(code.interval);
    let deadline = Instant::now() + Duration::from_secs(code.expires_in);
    let body =
        json!({ "grant_type": GRANT, "device_code": code.device_code, "client_id": CLIENT_ID })
            .to_string();
    while Instant::now() < deadline {
        std::thread::sleep(interval);
        let (status, reply) = post_any(&format!("{api}/api/auth/device/token"), body.clone())?;
        let answer: DeviceToken =
            serde_json::from_str(&reply).map_err(|error| Error::Other(error.to_string()))?;
        if let Some(token) = answer.access_token {
            return Ok(token);
        }
        match answer.error.as_deref() {
            Some("slow_down") => interval += Duration::from_secs(5),
            Some("access_denied") => {
                return Err(Error::failure("Sign-in was declined in the browser"));
            }
            Some("authorization_pending") => {}
            other => {
                let reason = other.map_or_else(|| status.to_string(), str::to_owned);
                return Err(Error::failure(format!("Sign-in failed: {reason}")));
            }
        }
    }
    Err(Error::hinted(
        "The sign-in code expired",
        "Run the command again for a fresh code.",
        crate::ui::FAILED,
    ))
}

/// Signs in through the browser and keeps the sign-in on this computer.
pub fn sign_in(api: &str) -> Result<Session> {
    let code: DeviceCode = request(
        "POST",
        &format!("{api}/api/auth/device/code"),
        None,
        Body::Json(json!({ "client_id": CLIENT_ID }).to_string()),
    )?;
    let url = code
        .verification_uri_complete
        .clone()
        .unwrap_or_else(|| code.verification_uri.clone());
    line(&format!(
        "Sign in to Schelf in your browser and check the code matches: {}",
        bold(&accent(&code.user_code))
    ));
    note(&url);
    open_browser(&url);
    blank();
    let token = step(
        "Waiting for the browser",
        || poll_for_token(api, &code),
        |_| "Approved in the browser".to_owned(),
    )?;
    let account = Dashboard::new(api, &token).account()?;
    let login = account.value["github"]
        .as_str()
        .unwrap_or_else(|| text(&account.value["user"], "email"));
    store_session(api, &token, login)?;
    Ok(Session { token, account })
}

/// The sign-in kept on this computer, or a new one when someone's there to sign in.
pub fn session(api: &str) -> Result<Session> {
    if let Some(stored) = stored_session(api) {
        match Dashboard::new(api, &stored.token).account() {
            Ok(account) => {
                return Ok(Session {
                    token: stored.token,
                    account,
                });
            }
            Err(error) if error.status() == Some(401) => {}
            Err(error) => return Err(error),
        }
    }
    if !interactive() {
        return Err(Error::hinted(
            "Not signed in",
            "Run schelf login first.",
            SIGN_IN,
        ));
    }
    sign_in(api)
}

pub fn greet(account: &serde_json::Value) {
    let user = &account["user"];
    let name = account["github"].as_str().unwrap_or_else(|| {
        Some(text(user, "name"))
            .filter(|name| !name.is_empty())
            .unwrap_or_else(|| text(user, "email"))
    });
    done(&format!("Signed in as {}", bold(name)));
}
