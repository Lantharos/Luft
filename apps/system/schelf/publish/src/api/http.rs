use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::PathBuf;
use std::sync::OnceLock;
use std::time::Duration;

use serde::Deserialize;
use serde::de::DeserializeOwned;
use ureq::{Agent, SendBody};

use crate::error::{Error, Result};
use crate::schema::{ConfigIssue, describe_issue};

const RETRYABLE: [u16; 6] = [408, 429, 500, 502, 503, 504];
const ATTEMPTS: u32 = 4;
const RESPONSE_LIMIT: u64 = 256 * 1024 * 1024;

#[derive(Deserialize, Clone, Debug)]
pub struct PathIssue {
    pub path: String,
    pub message: String,
}

/// The store turned a request down.
#[derive(Debug)]
pub struct ApiFailure {
    pub status: u16,
    pub message: String,
    pub issues: Vec<PathIssue>,
    pub config: Vec<ConfigIssue>,
}

impl ApiFailure {
    pub fn detail(&self) -> String {
        if !self.config.is_empty() {
            return self
                .config
                .iter()
                .map(describe_issue)
                .collect::<Vec<_>>()
                .join("\n");
        }
        std::iter::once(self.message.clone())
            .chain(
                self.issues
                    .iter()
                    .map(|issue| format!("{}: {}", issue.path, issue.message)),
            )
            .collect::<Vec<_>>()
            .join("\n")
    }
}

#[derive(Deserialize)]
struct ApiError {
    error: String,
    #[serde(default)]
    issues: Vec<PathIssue>,
    #[serde(default)]
    config: Vec<ConfigIssue>,
}

pub enum Body {
    Empty,
    Json(String),
    Bytes(Vec<u8>),
    /// `length` bytes of the file from `offset`, read again on every attempt.
    File {
        path: PathBuf,
        offset: u64,
        length: u64,
    },
}

fn agent() -> &'static Agent {
    static AGENT: OnceLock<Agent> = OnceLock::new();
    AGENT.get_or_init(|| {
        Agent::config_builder()
            .http_status_as_error(false)
            .build()
            .into()
    })
}

fn send(
    method: &str,
    url: &str,
    token: Option<&str>,
    body: &Body,
) -> std::result::Result<ureq::http::Response<ureq::Body>, ureq::Error> {
    let mut builder = ureq::http::Request::builder().method(method).uri(url);
    if let Some(token) = token {
        builder = builder.header("authorization", format!("Bearer {token}"));
    }
    let agent = agent();
    match body {
        Body::Empty => agent.run(builder.body(()).map_err(ureq::Error::from)?),
        Body::Json(text) => agent.run(
            builder
                .header("content-type", "application/json")
                .body(text.as_str())
                .map_err(ureq::Error::from)?,
        ),
        Body::Bytes(bytes) => agent.run(
            builder
                .header("content-length", bytes.len())
                .body(bytes.as_slice())
                .map_err(ureq::Error::from)?,
        ),
        Body::File {
            path,
            offset,
            length,
        } => {
            let mut file = File::open(path)?;
            file.seek(SeekFrom::Start(*offset))?;
            let mut part = file.take(*length);
            agent.run(
                builder
                    .header("content-length", *length)
                    .body(SendBody::from_reader(&mut part))
                    .map_err(ureq::Error::from)?,
            )
        }
    }
}

fn failure_from(status: u16, reason: &str, text: &str) -> ApiFailure {
    match serde_json::from_str::<ApiError>(text) {
        Ok(body) => ApiFailure {
            status,
            message: body.error,
            issues: body.issues,
            config: body.config,
        },
        Err(_) => ApiFailure {
            status,
            message: if text.trim().is_empty() {
                format!("{status} {reason}")
            } else {
                text.trim().to_owned()
            },
            issues: Vec::new(),
            config: Vec::new(),
        },
    }
}

fn wait(attempt: u32) {
    std::thread::sleep(Duration::from_millis(500 * 2u64.pow(attempt)));
}

/// Sends a request to the store, trying again while it's busy, and reads the
/// JSON it answers with.
pub fn request<T: DeserializeOwned>(
    method: &str,
    url: &str,
    token: Option<&str>,
    body: Body,
) -> Result<T> {
    let mut attempt = 1;
    loop {
        let mut response = match send(method, url, token, &body) {
            Ok(response) => response,
            Err(_) if attempt < ATTEMPTS => {
                wait(attempt);
                attempt += 1;
                continue;
            }
            Err(error) => return Err(Error::Unreachable(error.to_string())),
        };
        let status = response.status();
        let text = response
            .body_mut()
            .with_config()
            .limit(RESPONSE_LIMIT)
            .read_to_string()
            .unwrap_or_default();
        if status.is_success() {
            let text = if status.as_u16() == 204 || text.is_empty() {
                "null"
            } else {
                text.as_str()
            };
            return serde_json::from_str(text)
                .map_err(|error| Error::Other(format!("{url} answered with {error}")));
        }
        let code = status.as_u16();
        if !RETRYABLE.contains(&code) || attempt == ATTEMPTS {
            return Err(Error::Api(failure_from(
                code,
                status.canonical_reason().unwrap_or_default(),
                &text,
            )));
        }
        wait(attempt);
        attempt += 1;
    }
}

/// Downloads `url` as it is, as `fetch` does without the store's retries.
pub fn download(url: &str) -> std::result::Result<Vec<u8>, String> {
    let mut response = send("GET", url, None, &Body::Empty).map_err(|error| error.to_string())?;
    if !response.status().is_success() {
        return Err(response.status().as_u16().to_string());
    }
    response
        .body_mut()
        .with_config()
        .limit(RESPONSE_LIMIT)
        .read_to_vec()
        .map_err(|error| error.to_string())
}

/// Posts JSON and reads the JSON answer whatever its status, for the device
/// sign-in, which answers errors as JSON.
pub fn post_any(url: &str, body: String) -> Result<(u16, String)> {
    let mut response = send("POST", url, None, &Body::Json(body))
        .map_err(|error| Error::Other(error.to_string()))?;
    let status = response.status().as_u16();
    let text = response.body_mut().read_to_string().unwrap_or_default();
    Ok((status, text))
}
