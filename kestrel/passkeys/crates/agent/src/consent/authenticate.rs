use std::io;

use serde_json::{Value, json};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::UnixStream;
use zeroize::Zeroizing;

const SOCKET: &str = "/run/kestrel/authenticate";

pub enum Reply {
    Question,
    Message { text: String, error: bool },
    Success,
    Failure,
}

pub struct Session {
    stream: UnixStream,
}

impl Session {
    pub async fn start(user: &str, mode: &str) -> io::Result<(Self, Reply)> {
        let mut session = Self {
            stream: UnixStream::connect(SOCKET).await?,
        };
        let greeting = serde_json::to_vec(
            &json!({ "type": "create_session", "username": user, "mode": mode }),
        )?;
        let reply = session.request(&greeting).await?;
        Ok((session, reply))
    }

    pub async fn answer(&mut self, response: Option<&str>) -> io::Result<Reply> {
        self.request(&answer(response)).await
    }

    async fn request(&mut self, payload: &[u8]) -> io::Result<Reply> {
        let length = u32::try_from(payload.len()).map_err(io::Error::other)?;
        self.stream.write_all(&length.to_ne_bytes()).await?;
        self.stream.write_all(payload).await?;
        let mut header = [0; 4];
        self.stream.read_exact(&mut header).await?;
        let mut body = vec![0; u32::from_ne_bytes(header) as usize];
        self.stream.read_exact(&mut body).await?;
        let reply: Value = serde_json::from_slice(&body)?;
        Ok(match reply["type"].as_str() {
            Some("success") => Reply::Success,
            Some("auth_message") => match reply["auth_message_type"].as_str() {
                Some("secret" | "visible") => Reply::Question,
                kind => Reply::Message {
                    text: reply["auth_message"]
                        .as_str()
                        .unwrap_or_default()
                        .to_owned(),
                    error: kind == Some("error"),
                },
            },
            _ => Reply::Failure,
        })
    }
}

fn answer(response: Option<&str>) -> Zeroizing<Vec<u8>> {
    let longest = response.map_or(0, |response| response.len() * 6);
    let mut payload = Zeroizing::new(Vec::with_capacity(64 + longest));
    payload.extend_from_slice(br#"{"type":"post_auth_message_response""#);
    if let Some(response) = response {
        payload.extend_from_slice(br#","response":""#);
        for character in response.chars() {
            match character {
                '"' => payload.extend_from_slice(b"\\\""),
                '\\' => payload.extend_from_slice(b"\\\\"),
                character if character.is_control() => {
                    payload.extend_from_slice(format!("\\u{:04x}", u32::from(character)).as_bytes())
                }
                character => {
                    payload.extend_from_slice(character.encode_utf8(&mut [0; 4]).as_bytes())
                }
            }
        }
        payload.push(b'"');
    }
    payload.push(b'}');
    payload
}

pub async fn password(user: &str, password: &str) -> bool {
    let Ok((mut session, mut reply)) = Session::start(user, "password").await else {
        return false;
    };
    loop {
        reply = match reply {
            Reply::Question => match session.answer(Some(password)).await {
                Ok(next) => next,
                Err(_) => return false,
            },
            Reply::Message { .. } => match session.answer(None).await {
                Ok(next) => next,
                Err(_) => return false,
            },
            Reply::Success => return true,
            Reply::Failure => return false,
        };
    }
}
