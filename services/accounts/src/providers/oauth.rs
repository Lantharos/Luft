use std::collections::HashMap;
use std::net::{Ipv4Addr, Ipv6Addr};
use std::time::Duration;

use anyhow::{Context, Result, anyhow, bail};
use base64::Engine;
use base64::engine::general_purpose::URL_SAFE_NO_PAD;
use rand::RngExt;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use time::OffsetDateTime;
use time::format_description::well_known::Rfc3339;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::time::{sleep, timeout};
use zeroize::Zeroizing;

use super::apps::{App, REDIRECT, REDIRECT_PORT};
use super::http;

const FINISHED: &str = "<!doctype html><meta charset=utf-8><title>Signed in</title><body style=\"font:16px system-ui;display:grid;place-items:center;height:90vh;margin:0\"><p>You're signed in. You can close this tab and go back to Settings.</p>";
const FAILED: &str = "<!doctype html><meta charset=utf-8><title>Not signed in</title><body style=\"font:16px system-ui;display:grid;place-items:center;height:90vh;margin:0\"><p>Signing in didn't finish. Go back to Settings to try again.</p>";
const TOKEN_LIFETIME: i64 = 3600;
const WAIT_FOR_BROWSER: Duration = Duration::from_secs(20 * 60);
const WAIT_FOR_REQUEST: Duration = Duration::from_secs(10);
const ACCEPT_AGAIN: Duration = Duration::from_millis(200);

pub struct Pending {
    pub url: String,
    app: &'static App,
    verifier: String,
    state: String,
    listeners: Vec<TcpListener>,
}

pub struct Tokens {
    pub access: Zeroizing<String>,
    pub rclone: Zeroizing<String>,
    pub claims: Claims,
}

#[derive(Default, Deserialize)]
pub struct Claims {
    pub email: Option<String>,
    pub preferred_username: Option<String>,
    pub name: Option<String>,
}

#[derive(Deserialize)]
struct TokenResponse {
    access_token: Zeroizing<String>,
    refresh_token: Option<Zeroizing<String>>,
    token_type: Option<String>,
    expires_in: Option<i64>,
    id_token: Option<String>,
}

#[derive(Default, Deserialize)]
struct Refusal {
    error: Option<String>,
    error_description: Option<String>,
}

#[derive(serde::Serialize)]
struct RcloneToken<'a> {
    access_token: &'a str,
    token_type: &'a str,
    refresh_token: &'a str,
    expiry: String,
}

fn random(length: usize) -> String {
    rand::rng()
        .sample_iter(rand::distr::Alphanumeric)
        .take(length)
        .map(char::from)
        .collect()
}

pub async fn begin(app: &'static App) -> Result<Pending> {
    let mut listeners = Vec::new();
    if let Ok(listener) = TcpListener::bind((Ipv4Addr::LOCALHOST, REDIRECT_PORT)).await {
        listeners.push(listener);
    }
    if let Ok(listener) = TcpListener::bind((Ipv6Addr::LOCALHOST, REDIRECT_PORT)).await {
        listeners.push(listener);
    }
    if listeners.is_empty() {
        bail!("Another sign-in is still waiting for the browser. Finish or close it first.");
    }
    let verifier = random(64);
    let state = random(24);
    Ok(Pending {
        url: authorization(app, &state, &verifier)?.into(),
        app,
        verifier,
        state,
        listeners,
    })
}

fn challenge(verifier: &str) -> String {
    URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()))
}

fn authorization(app: &App, state: &str, verifier: &str) -> Result<url::Url> {
    let mut url = url::Url::parse(app.authorize)?;
    url.query_pairs_mut()
        .append_pair("client_id", app.client_id)
        .append_pair("response_type", "code")
        .append_pair("redirect_uri", REDIRECT)
        .append_pair("scope", app.scope)
        .append_pair("state", state)
        .append_pair("code_challenge", &challenge(verifier))
        .append_pair("code_challenge_method", "S256")
        .extend_pairs(app.extra.iter().copied());
    Ok(url)
}

impl Pending {
    pub async fn finish(self) -> Result<Tokens> {
        let (code, mut browser) = timeout(WAIT_FOR_BROWSER, self.wait_for_code())
            .await
            .context("Signing in took too long. Try again.")?;
        let app = self.app;
        let verifier = self.verifier;
        let tokens = match code {
            Ok(code) => tokio::task::spawn_blocking(move || redeem(app, &code, &verifier)).await?,
            Err(error) => Err(error),
        };
        let page = if tokens.is_ok() { FINISHED } else { FAILED };
        let response = format!(
            "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{page}",
            page.len()
        );
        let _ = browser.write_all(response.as_bytes()).await;
        tokens
    }

    async fn wait_for_code(&self) -> (Result<String>, TcpStream) {
        loop {
            let accepted = match self.listeners.as_slice() {
                [only] => only.accept().await,
                [first, second, ..] => tokio::select! {
                    accepted = first.accept() => accepted,
                    accepted = second.accept() => accepted,
                },
                [] => unreachable!("begin keeps at least one listener"),
            };
            let Ok((stream, _)) = accepted else {
                sleep(ACCEPT_AGAIN).await;
                continue;
            };
            if let Some(outcome) = read_redirect(stream, &self.state).await {
                return outcome;
            }
        }
    }
}

async fn read_redirect(mut stream: TcpStream, state: &str) -> Option<(Result<String>, TcpStream)> {
    let mut request = vec![0; 8192];
    let read = timeout(WAIT_FOR_REQUEST, stream.read(&mut request))
        .await
        .ok()
        .and_then(Result::ok)
        .unwrap_or(0);
    let request = String::from_utf8_lossy(&request[..read]);
    let outcome = request
        .lines()
        .next()
        .and_then(|line| line.split_whitespace().nth(1))
        .and_then(|target| redirect_outcome(target, state));
    match outcome {
        Some(outcome) => Some((outcome, stream)),
        None => {
            let _ = stream
                .write_all(
                    b"HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
                )
                .await;
            None
        }
    }
}

fn redirect_outcome(target: &str, state: &str) -> Option<Result<String>> {
    let url = url::Url::parse(&format!("http://localhost{target}")).ok()?;
    if url.path() != "/" {
        return None;
    }
    let query: HashMap<_, _> = url.query_pairs().into_owned().collect();
    if query.get("state").map(String::as_str) != Some(state) {
        return None;
    }
    if let Some(code) = query.get("code") {
        return Some(Ok(code.clone()));
    }
    let reason = query
        .get("error_description")
        .or_else(|| query.get("error"))
        .cloned()
        .unwrap_or_else(|| "The sign-in page didn't say why".to_owned());
    Some(Err(anyhow!("Signing in was stopped: {reason}")))
}

fn redeem(app: &App, code: &str, verifier: &str) -> Result<Tokens> {
    exchange(
        app,
        &[
            ("grant_type", "authorization_code"),
            ("code", code),
            ("redirect_uri", REDIRECT),
            ("code_verifier", verifier),
        ],
    )
}

fn exchange(app: &App, form: &[(&str, &str)]) -> Result<Tokens> {
    let mut form = form.to_vec();
    form.push(("client_id", app.client_id));
    form.extend(app.client_secret.map(|secret| ("client_secret", secret)));
    let mut answer = http()
        .post(app.token)
        .config()
        .http_status_as_error(false)
        .build()
        .send_form(form)
        .map_err(|error| anyhow!("Signing in failed: {error}"))?;
    if !answer.status().is_success() {
        let refusal: Refusal = answer.body_mut().read_json().unwrap_or_default();
        let reason = refusal
            .error_description
            .or(refusal.error)
            .unwrap_or_else(|| answer.status().to_string());
        bail!(
            "Signing in didn't finish: {}",
            reason.lines().next().unwrap_or_default()
        );
    }
    let response: TokenResponse = answer
        .body_mut()
        .read_json()
        .context("The sign-in answer couldn't be read")?;
    let refresh = response
        .refresh_token
        .as_deref()
        .context("The service didn't allow staying signed in")?;
    let expires = OffsetDateTime::now_utc()
        + time::Duration::seconds(response.expires_in.unwrap_or(TOKEN_LIFETIME));
    let rclone = Zeroizing::new(serde_json::to_string(&RcloneToken {
        access_token: &response.access_token,
        token_type: response.token_type.as_deref().unwrap_or("Bearer"),
        refresh_token: refresh,
        expiry: expires.format(&Rfc3339)?,
    })?);
    Ok(Tokens {
        claims: claims(response.id_token.as_deref()),
        access: response.access_token,
        rclone,
    })
}

fn claims(id_token: Option<&str>) -> Claims {
    id_token
        .and_then(|token| token.split('.').nth(1))
        .and_then(|payload| URL_SAFE_NO_PAD.decode(payload).ok())
        .and_then(|payload| serde_json::from_slice(&payload).ok())
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;
    use std::io::{BufRead, BufReader, Read, Write};
    use std::net::TcpListener;
    use std::thread::{self, JoinHandle};

    use super::super::apps::{DROPBOX, ONEDRIVE, REDIRECT};
    use super::{App, authorization, challenge, redeem, redirect_outcome};

    const VERIFIER: &str = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const CHALLENGE: &str = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

    fn token_endpoint() -> (&'static str, JoinHandle<BTreeMap<String, String>>) {
        let server = TcpListener::bind("127.0.0.1:0").unwrap();
        let address = format!("http://{}/token", server.local_addr().unwrap());
        let serving = thread::spawn(move || {
            let (mut stream, _) = server.accept().unwrap();
            let mut reader = BufReader::new(stream.try_clone().unwrap());
            let mut length = 0;
            loop {
                let mut line = String::new();
                reader.read_line(&mut line).unwrap();
                let lower = line.to_ascii_lowercase();
                assert!(!lower.starts_with("authorization:"));
                if let Some(value) = lower.strip_prefix("content-length:") {
                    length = value.trim().parse().unwrap();
                }
                if line == "\r\n" {
                    break;
                }
            }
            let mut body = vec![0; length];
            reader.read_exact(&mut body).unwrap();
            let id_token = format!(
                "x.{}.y",
                base64::Engine::encode(
                    &base64::engine::general_purpose::URL_SAFE_NO_PAD,
                    br#"{"email":"ada@example.com"}"#
                )
            );
            let reply = format!(
                r#"{{"access_token":"fake-access","refresh_token":"fake-refresh","expires_in":14400,"token_type":"bearer","id_token":"{id_token}"}}"#
            );
            write!(stream, "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{reply}", reply.len()).unwrap();
            url::form_urlencoded::parse(&body).into_owned().collect()
        });
        (Box::leak(address.into_boxed_str()), serving)
    }

    fn pointed_at(app: &App, token: &'static str) -> App {
        App {
            client_id: app.client_id,
            client_secret: app.client_secret,
            authorize: app.authorize,
            token,
            scope: app.scope,
            extra: app.extra,
        }
    }

    #[test]
    fn only_the_matching_redirect_counts() {
        assert!(redirect_outcome("/favicon.ico", "abc").is_none());
        assert!(redirect_outcome("/?code=1&state=other", "abc").is_none());
        assert_eq!(
            redirect_outcome("/?code=xyz&state=abc", "abc")
                .unwrap()
                .unwrap(),
            "xyz"
        );
        let refused = redirect_outcome(
            "/?error=access_denied&error_description=No+thanks&state=abc",
            "abc",
        );
        assert!(
            refused
                .unwrap()
                .unwrap_err()
                .to_string()
                .contains("No thanks")
        );
    }

    #[test]
    fn the_challenge_is_the_rfc_7636_s256_of_the_verifier() {
        assert_eq!(challenge(VERIFIER), CHALLENGE);
    }

    #[test]
    fn dropbox_is_asked_for_pkce_and_offline_access_without_a_secret() {
        let url = authorization(&DROPBOX, "abc", VERIFIER).unwrap();
        let query: BTreeMap<String, String> = url.query_pairs().into_owned().collect();
        assert_eq!(url.host_str(), Some("www.dropbox.com"));
        assert_eq!(query["client_id"], DROPBOX.client_id);
        assert_eq!(query["response_type"], "code");
        assert_eq!(query["redirect_uri"], REDIRECT);
        assert_eq!(query["state"], "abc");
        assert_eq!(query["code_challenge"], CHALLENGE);
        assert_eq!(query["code_challenge_method"], "S256");
        assert_eq!(query["token_access_type"], "offline");
        assert!(!query.contains_key("code_verifier"));
        assert!(!query.contains_key("client_secret"));
        assert!(DROPBOX.client_secret.is_none());
    }

    #[test]
    fn dropbox_redeems_the_code_with_the_verifier_and_no_secret() {
        let (token, serving) = token_endpoint();
        let tokens = redeem(&pointed_at(&DROPBOX, token), "fake-code", VERIFIER).unwrap();
        let form = serving.join().unwrap();
        assert_eq!(
            form,
            BTreeMap::from(
                [
                    ("client_id", DROPBOX.client_id),
                    ("code", "fake-code"),
                    ("code_verifier", VERIFIER),
                    ("grant_type", "authorization_code"),
                    ("redirect_uri", REDIRECT),
                ]
                .map(|(key, value)| (key.to_owned(), value.to_owned()))
            )
        );
        let rclone: serde_json::Value = serde_json::from_str(&tokens.rclone).unwrap();
        assert_eq!(rclone["access_token"], "fake-access");
        assert_eq!(rclone["refresh_token"], "fake-refresh");
        assert!(rclone["expiry"].as_str().unwrap().ends_with('Z'));
    }

    #[test]
    fn onedrive_still_redeems_with_rclones_secret() {
        let (token, serving) = token_endpoint();
        let tokens = redeem(&pointed_at(&ONEDRIVE, token), "fake-code", VERIFIER).unwrap();
        let form = serving.join().unwrap();
        assert_eq!(form["code_verifier"], VERIFIER);
        assert_eq!(Some(form["client_secret"].as_str()), ONEDRIVE.client_secret);
        assert_eq!(tokens.claims.email.as_deref(), Some("ada@example.com"));
    }
}
