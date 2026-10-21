use std::path::PathBuf;

use anyhow::{Context, Result, anyhow, bail};
use serde_json::{Value, json};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::UnixStream;

#[derive(Clone)]
pub struct Rc {
    socket: PathBuf,
}

impl Rc {
    pub fn new(socket: PathBuf) -> Self {
        Self { socket }
    }

    pub async fn reachable(&self) -> bool {
        UnixStream::connect(&self.socket).await.is_ok()
    }

    pub async fn call(&self, method: &str, input: Value) -> Result<Value> {
        let body = serde_json::to_vec(&input)?;
        let mut stream = UnixStream::connect(&self.socket)
            .await
            .context("rclone isn't running")?;
        let head = format!(
            "POST /{method} HTTP/1.1\r\nHost: rclone\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
            body.len()
        );
        stream.write_all(head.as_bytes()).await?;
        stream.write_all(&body).await?;
        let mut response = Vec::new();
        stream.read_to_end(&mut response).await?;
        let (status, payload) = parse(&response)?;
        let value: Value = if payload.is_empty() {
            json!({})
        } else {
            serde_json::from_slice(&payload).context("rclone answered with something unreadable")?
        };
        if status != 200 {
            let message = value["error"].as_str().unwrap_or("rclone failed");
            return Err(anyhow!("{message}"));
        }
        Ok(value)
    }
}

fn parse(response: &[u8]) -> Result<(u16, Vec<u8>)> {
    let split = response
        .windows(4)
        .position(|window| window == b"\r\n\r\n")
        .context("rclone's answer was cut short")?;
    let head = std::str::from_utf8(&response[..split])?;
    let body = &response[split + 4..];
    let status = head
        .split_whitespace()
        .nth(1)
        .and_then(|code| code.parse().ok())
        .context("rclone's answer has no status")?;
    let chunked = head.lines().any(|line| {
        let line = line.to_ascii_lowercase();
        line.starts_with("transfer-encoding:") && line.contains("chunked")
    });
    Ok((
        status,
        if chunked {
            dechunk(body)?
        } else {
            body.to_vec()
        },
    ))
}

fn dechunk(mut body: &[u8]) -> Result<Vec<u8>> {
    let mut joined = Vec::new();
    loop {
        let line_end = body
            .windows(2)
            .position(|window| window == b"\r\n")
            .context("A chunk of rclone's answer is cut short")?;
        let size_text = std::str::from_utf8(&body[..line_end])?;
        let size = usize::from_str_radix(size_text.split(';').next().unwrap_or("").trim(), 16)?;
        body = &body[line_end + 2..];
        if size == 0 {
            return Ok(joined);
        }
        if body.len() < size {
            bail!("A chunk of rclone's answer is cut short");
        }
        joined.extend_from_slice(&body[..size]);
        body = body.get(size + 2..).unwrap_or_default();
    }
}

#[cfg(test)]
mod tests {
    use super::parse;

    #[test]
    fn reads_plain_and_chunked_answers() {
        let plain = b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\n{}";
        assert_eq!(parse(plain).unwrap(), (200, b"{}".to_vec()));
        let chunked = b"HTTP/1.1 500 Internal\r\nTransfer-Encoding: chunked\r\n\r\n4\r\n{\"a\"\r\n3\r\n:1}\r\n0\r\n\r\n";
        assert_eq!(parse(chunked).unwrap(), (500, b"{\"a\":1}".to_vec()));
    }
}
