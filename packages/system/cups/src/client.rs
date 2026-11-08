use std::io;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU32, Ordering};

use tokio::fs::File;
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};
use tokio::net::UnixStream;

use crate::ipp::{Request, Response};

const SOCKET: &str = "/run/cups/cups.sock";
const DOCUMENT_CHUNK: usize = 64 * 1024;

pub struct Cups {
    socket: PathBuf,
    user: String,
    requests: AtomicU32,
}

impl Cups {
    pub fn new(user: String) -> Self {
        Self {
            socket: std::env::var_os("CUPS_SERVER")
                .map(PathBuf::from)
                .filter(|path| path.is_absolute())
                .unwrap_or_else(|| PathBuf::from(SOCKET)),
            user,
            requests: AtomicU32::new(0),
        }
    }

    pub fn user(&self) -> &str {
        &self.user
    }

    pub fn request(&self, operation: u16, printer: &str) -> Request {
        let id = self.requests.fetch_add(1, Ordering::Relaxed) + 1;
        let mut request = Request::new(operation, id);
        request
            .uri("printer-uri", printer)
            .name("requesting-user-name", &self.user);
        request
    }

    pub async fn send(&self, request: Request) -> io::Result<Response> {
        let body = request.finish();
        let mut stream = UnixStream::connect(&self.socket).await?;
        stream
            .write_all(&self.header(&content_length(&body)))
            .await?;
        stream.write_all(&body).await?;
        read_reply(stream).await
    }

    pub fn send_blocking(&self, request: Request) -> io::Result<Response> {
        let body = request.finish();
        let mut stream = std::os::unix::net::UnixStream::connect(&self.socket)?;
        std::io::Write::write_all(&mut stream, &self.header(&content_length(&body)))?;
        std::io::Write::write_all(&mut stream, &body)?;
        let mut reply = Vec::new();
        std::io::Read::read_to_end(&mut stream, &mut reply)?;
        parse_reply(&reply)
    }

    pub async fn send_document(
        &self,
        request: Request,
        mut document: File,
    ) -> io::Result<Response> {
        let mut stream = UnixStream::connect(&self.socket).await?;
        stream
            .write_all(&self.header("Transfer-Encoding: chunked"))
            .await?;
        write_chunk(&mut stream, &request.finish()).await?;
        let mut buffer = vec![0; DOCUMENT_CHUNK];
        loop {
            let read = document.read(&mut buffer).await?;
            if read == 0 {
                break;
            }
            write_chunk(&mut stream, &buffer[..read]).await?;
        }
        stream.write_all(b"0\r\n\r\n").await?;
        read_reply(stream).await
    }

    fn header(&self, framing: &str) -> Vec<u8> {
        format!(
            "POST / HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/ipp\r\nAuthorization: PeerCred {}\r\n{framing}\r\nConnection: close\r\n\r\n",
            self.user
        )
        .into_bytes()
    }
}

pub fn expect_success(response: &Response) -> io::Result<()> {
    if response.successful() {
        return Ok(());
    }
    let message = response
        .text("status-message")
        .map_or_else(|| format!("status {:#06x}", response.status), str::to_owned);
    Err(io::Error::other(format!(
        "The printing service refused: {message}"
    )))
}

async fn write_chunk(stream: &mut (impl AsyncWrite + Unpin), chunk: &[u8]) -> io::Result<()> {
    stream
        .write_all(format!("{:x}\r\n", chunk.len()).as_bytes())
        .await?;
    stream.write_all(chunk).await?;
    stream.write_all(b"\r\n").await
}

async fn read_reply(mut stream: impl AsyncRead + Unpin) -> io::Result<Response> {
    let mut reply = Vec::new();
    stream.read_to_end(&mut reply).await?;
    parse_reply(&reply)
}

fn content_length(body: &[u8]) -> String {
    format!("Content-Length: {}", body.len())
}

fn parse_reply(reply: &[u8]) -> io::Result<Response> {
    let split = reply
        .windows(4)
        .position(|window| window == b"\r\n\r\n")
        .ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::InvalidData,
                "The printing service sent no headers",
            )
        })?;
    let headers = String::from_utf8_lossy(&reply[..split]).to_ascii_lowercase();
    let status = headers
        .split_whitespace()
        .nth(1)
        .and_then(|code| code.parse::<u16>().ok());
    if matches!(status, Some(401 | 403)) {
        return Err(io::Error::new(
            io::ErrorKind::PermissionDenied,
            "The printing service didn't allow this",
        ));
    }
    let content = &reply[split + 4..];
    if headers.contains("transfer-encoding: chunked") {
        Response::parse(&dechunk(content)?)
    } else {
        Response::parse(content)
    }
}

fn dechunk(mut content: &[u8]) -> io::Result<Vec<u8>> {
    let invalid = || {
        io::Error::new(
            io::ErrorKind::InvalidData,
            "The printing service sent a broken chunk",
        )
    };
    let mut body = Vec::new();
    loop {
        let line = content
            .windows(2)
            .position(|window| window == b"\r\n")
            .ok_or_else(invalid)?;
        let size = std::str::from_utf8(&content[..line]).map_err(|_| invalid())?;
        let size = usize::from_str_radix(size.split(';').next().unwrap_or_default().trim(), 16)
            .map_err(|_| invalid())?;
        if size == 0 {
            return Ok(body);
        }
        let start = line + 2;
        body.extend(content.get(start..start + size).ok_or_else(invalid)?);
        content = content.get(start + size + 2..).ok_or_else(invalid)?;
    }
}
