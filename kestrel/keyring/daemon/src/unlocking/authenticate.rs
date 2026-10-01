use std::time::Duration;

use serde_json::{Value, json};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::UnixStream;
use zeroize::Zeroizing;

const SOCKET: &str = "/run/kestrel/authenticate";
const LIMIT: usize = 64 * 1024;
const PATIENCE: Duration = Duration::from_secs(60);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Mode {
    Password,
    Fingerprint,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Outcome {
    Accepted,
    Refused,
    Unavailable,
}

pub fn available() -> bool {
    std::path::Path::new(SOCKET).exists()
}

pub async fn authenticate(mode: Mode, password: Option<&[u8]>) -> Outcome {
    match tokio::time::timeout(PATIENCE, converse(mode, password)).await {
        Ok(Ok(outcome)) => outcome,
        _ => Outcome::Unavailable,
    }
}

async fn converse(mode: Mode, password: Option<&[u8]>) -> std::io::Result<Outcome> {
    let mut stream = UnixStream::connect(SOCKET).await?;
    let user = current_user().ok_or_else(|| std::io::Error::other("no account name"))?;
    let mode = match mode {
        Mode::Password => "password",
        Mode::Fingerprint => "fingerprint",
    };
    send(
        &mut stream,
        &json!({"type": "create_session", "username": user, "mode": mode}),
    )
    .await?;
    loop {
        let message = receive(&mut stream).await?;
        match message.get("type").and_then(Value::as_str) {
            Some("success") => return Ok(Outcome::Accepted),
            Some("error") => {
                let refused =
                    message.get("error_type").and_then(Value::as_str) == Some("auth_error");
                return Ok(if refused {
                    Outcome::Refused
                } else {
                    Outcome::Unavailable
                });
            }
            Some("auth_message") => {
                let secret =
                    message.get("auth_message_type").and_then(Value::as_str) == Some("secret");
                match (secret, password) {
                    (true, Some(password)) => send_payload(&mut stream, &answer(password)).await?,
                    (true, None) => return Ok(Outcome::Unavailable),
                    (false, _) => {
                        send(
                            &mut stream,
                            &json!({"type": "post_auth_message_response", "response": null}),
                        )
                        .await?
                    }
                }
            }
            _ => return Ok(Outcome::Unavailable),
        }
    }
}

fn answer(password: &[u8]) -> Zeroizing<Vec<u8>> {
    let mut payload = Zeroizing::new(Vec::with_capacity(64 + password.len() * 2));
    payload.extend_from_slice(br#"{"type":"post_auth_message_response","response":""#);
    for character in String::from_utf8_lossy(password).chars() {
        match character {
            '"' => payload.extend_from_slice(b"\\\""),
            '\\' => payload.extend_from_slice(b"\\\\"),
            character if character.is_control() => {
                payload.extend_from_slice(format!("\\u{:04x}", u32::from(character)).as_bytes())
            }
            character => payload.extend_from_slice(character.encode_utf8(&mut [0; 4]).as_bytes()),
        }
    }
    payload.extend_from_slice(br#""}"#);
    payload
}

async fn send(stream: &mut UnixStream, message: &Value) -> std::io::Result<()> {
    send_payload(stream, &serde_json::to_vec(message)?).await
}

async fn send_payload(stream: &mut UnixStream, payload: &[u8]) -> std::io::Result<()> {
    let length = u32::try_from(payload.len()).map_err(std::io::Error::other)?;
    let mut frame = Zeroizing::new(Vec::with_capacity(4 + payload.len()));
    frame.extend_from_slice(&length.to_ne_bytes());
    frame.extend_from_slice(payload);
    stream.write_all(&frame).await
}

async fn receive(stream: &mut UnixStream) -> std::io::Result<Value> {
    let mut header = [0; 4];
    stream.read_exact(&mut header).await?;
    let length = u32::from_ne_bytes(header) as usize;
    if length > LIMIT {
        return Err(std::io::Error::other("oversized message"));
    }
    let mut payload = vec![0; length];
    stream.read_exact(&mut payload).await?;
    Ok(serde_json::from_slice(&payload)?)
}

fn current_user() -> Option<String> {
    let mut entry = unsafe { std::mem::zeroed::<libc::passwd>() };
    let mut buffer = vec![0 as libc::c_char; 4096];
    let mut result = std::ptr::null_mut();
    let status = unsafe {
        libc::getpwuid_r(
            libc::getuid(),
            &raw mut entry,
            buffer.as_mut_ptr(),
            buffer.len(),
            &raw mut result,
        )
    };
    if status != 0 || result.is_null() {
        return None;
    }
    Some(
        unsafe { std::ffi::CStr::from_ptr(entry.pw_name) }
            .to_string_lossy()
            .into_owned(),
    )
}
