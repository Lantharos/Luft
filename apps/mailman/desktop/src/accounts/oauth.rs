use std::io::{BufRead, BufReader, Write};
use std::net::TcpListener;
use std::time::{Duration, Instant};

use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use rand::RngExt;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::store::now;

const SIGN_IN_TIMEOUT: Duration = Duration::from_secs(300);
const FINISHED_PAGE: &str = "<!doctype html><meta charset=utf-8><title>Mailman</title><body style=\"font:16px system-ui;display:grid;place-items:center;height:90vh;margin:0\"><p>You're signed in. You can close this tab and go back to Mailman.</p>";

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Provider {
    Google,
    Microsoft,
}

struct Endpoints {
    authorize: &'static str,
    token: &'static str,
    scope: &'static str,
    redirect_host: &'static str,
}

impl Provider {
    fn endpoints(self) -> Endpoints {
        match self {
            Provider::Google => Endpoints {
                authorize: "https://accounts.google.com/o/oauth2/v2/auth",
                token: "https://oauth2.googleapis.com/token",
                scope: "https://mail.google.com/ openid email profile",
                redirect_host: "127.0.0.1",
            },
            Provider::Microsoft => Endpoints {
                authorize: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
                token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
                scope: "https://outlook.office.com/IMAP.AccessAsUser.All https://outlook.office.com/SMTP.Send offline_access openid email profile",
                redirect_host: "localhost",
            },
        }
    }

    fn client(self) -> Option<(String, Option<String>)> {
        let configured = |runtime: &str, built: Option<&'static str>| {
            std::env::var(runtime)
                .ok()
                .or(built.map(str::to_owned))
                .filter(|value| !value.is_empty())
        };
        match self {
            Provider::Google => Some((
                configured(
                    "MAILMAN_GOOGLE_CLIENT_ID",
                    option_env!("MAILMAN_GOOGLE_CLIENT_ID"),
                )?,
                configured(
                    "MAILMAN_GOOGLE_CLIENT_SECRET",
                    option_env!("MAILMAN_GOOGLE_CLIENT_SECRET"),
                ),
            )),
            Provider::Microsoft => Some((
                configured(
                    "MAILMAN_MICROSOFT_CLIENT_ID",
                    option_env!("MAILMAN_MICROSOFT_CLIENT_ID"),
                )?,
                None,
            )),
        }
    }
}

pub fn available() -> Vec<Provider> {
    [Provider::Google, Provider::Microsoft]
        .into_iter()
        .filter(|provider| provider.client().is_some())
        .collect()
}

pub struct Tokens {
    pub access: String,
    pub refresh: Option<String>,
    pub expires: i64,
    pub email: Option<String>,
    pub name: Option<String>,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: Option<i64>,
    id_token: Option<String>,
}

#[derive(Deserialize, Default)]
struct Identity {
    email: Option<String>,
    preferred_username: Option<String>,
    name: Option<String>,
}

fn random(length: usize) -> String {
    rand::rng()
        .sample_iter(rand::distr::Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

fn identity(id_token: Option<&str>) -> Identity {
    id_token
        .and_then(|token| token.split('.').nth(1))
        .and_then(|payload| URL_SAFE_NO_PAD.decode(payload).ok())
        .and_then(|payload| serde_json::from_slice(&payload).ok())
        .unwrap_or_default()
}

fn exchange(provider: Provider, form: &[(&str, &str)]) -> Result<Tokens, String> {
    let response: TokenResponse = ureq::post(provider.endpoints().token)
        .send_form(form.iter().copied())
        .map_err(|error| format!("Signing in failed: {error}"))?
        .body_mut()
        .read_json()
        .map_err(|error| error.to_string())?;
    let identity = identity(response.id_token.as_deref());
    Ok(Tokens {
        access: response.access_token,
        refresh: response.refresh_token,
        expires: now() + response.expires_in.unwrap_or(3600),
        email: identity
            .email
            .or(identity.preferred_username)
            .map(|email| email.to_lowercase()),
        name: identity.name,
    })
}

pub fn refresh(provider: Provider, refresh_token: &str) -> Result<Tokens, String> {
    let (client_id, secret) = provider
        .client()
        .ok_or("Signing in with this provider isn't set up")?;
    let mut form = vec![
        ("grant_type", "refresh_token"),
        ("refresh_token", refresh_token),
        ("client_id", client_id.as_str()),
    ];
    if let Some(secret) = secret.as_deref() {
        form.push(("client_secret", secret));
    }
    exchange(provider, &form)
}

pub fn sign_in(provider: Provider, hint: Option<&str>) -> Result<Tokens, String> {
    let (client_id, secret) = provider
        .client()
        .ok_or("Signing in with this provider isn't set up")?;
    let endpoints = provider.endpoints();
    let listener = TcpListener::bind("127.0.0.1:0").map_err(|error| error.to_string())?;
    let redirect = format!(
        "http://{}:{}",
        endpoints.redirect_host,
        listener
            .local_addr()
            .map_err(|error| error.to_string())?
            .port()
    );
    let verifier = random(64);
    let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
    let state = random(24);
    let mut authorize = url::Url::parse(endpoints.authorize).map_err(|error| error.to_string())?;
    authorize
        .query_pairs_mut()
        .append_pair("client_id", &client_id)
        .append_pair("response_type", "code")
        .append_pair("redirect_uri", &redirect)
        .append_pair("scope", endpoints.scope)
        .append_pair("code_challenge", &challenge)
        .append_pair("code_challenge_method", "S256")
        .append_pair("state", &state)
        .append_pair("access_type", "offline")
        .append_pair("prompt", "consent");
    if let Some(hint) = hint {
        authorize.query_pairs_mut().append_pair("login_hint", hint);
    }
    gio::AppInfo::launch_default_for_uri(authorize.as_str(), None::<&gio::AppLaunchContext>)
        .map_err(|error| error.to_string())?;
    let code = wait_for_code(&listener, &state)?;
    let mut form = vec![
        ("grant_type", "authorization_code"),
        ("code", code.as_str()),
        ("redirect_uri", redirect.as_str()),
        ("client_id", client_id.as_str()),
        ("code_verifier", verifier.as_str()),
    ];
    if let Some(secret) = secret.as_deref() {
        form.push(("client_secret", secret));
    }
    exchange(provider, &form)
}

fn wait_for_code(listener: &TcpListener, state: &str) -> Result<String, String> {
    listener
        .set_nonblocking(true)
        .map_err(|error| error.to_string())?;
    let started = Instant::now();
    while started.elapsed() < SIGN_IN_TIMEOUT {
        let Ok((mut stream, _)) = listener.accept() else {
            std::thread::sleep(Duration::from_millis(100));
            continue;
        };
        stream.set_nonblocking(false).ok();
        let mut request = String::new();
        BufReader::new(&stream)
            .read_line(&mut request)
            .map_err(|error| error.to_string())?;
        let target = request.split_whitespace().nth(1).unwrap_or("/");
        let Ok(url) = url::Url::parse(&format!("http://localhost{target}")) else {
            continue;
        };
        let pairs: std::collections::HashMap<_, _> = url.query_pairs().into_owned().collect();
        if pairs.get("state").map(String::as_str) != Some(state) {
            continue;
        }
        let _ = write!(
            stream,
            "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n{FINISHED_PAGE}"
        );
        if let Some(error) = pairs.get("error") {
            return Err(format!("Signing in was cancelled ({error})"));
        }
        return pairs
            .get("code")
            .cloned()
            .ok_or_else(|| "The sign-in page didn't return a code".into());
    }
    Err("Signing in took too long".into())
}
