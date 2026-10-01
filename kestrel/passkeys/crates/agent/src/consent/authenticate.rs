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

fn socket() -> String {
    std::env::var("KESTREL_AUTHENTICATE_SOCK").unwrap_or_else(|_| SOCKET.to_owned())
}

impl Session {
    pub async fn start(user: &str, mode: &str) -> io::Result<(Self, Reply)> {
        let mut session = Self {
            stream: UnixStream::connect(socket()).await?,
        };
        let reply = session
            .request(&json!({ "type": "create_session", "username": user, "mode": mode }))
            .await?;
        Ok((session, reply))
    }

    pub async fn answer(&mut self, response: Option<&str>) -> io::Result<Reply> {
        let mut message = json!({ "type": "post_auth_message_response" });
        if let Some(response) = response {
            message["response"] = Value::from(response);
        }
        self.request(&message).await
    }

    async fn request(&mut self, message: &Value) -> io::Result<Reply> {
        let payload = Zeroizing::new(serde_json::to_vec(message)?);
        let length = u32::try_from(payload.len()).map_err(io::Error::other)?;
        self.stream.write_all(&length.to_ne_bytes()).await?;
        self.stream.write_all(&payload).await?;
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
