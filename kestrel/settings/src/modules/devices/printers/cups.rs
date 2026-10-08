use std::io;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU32, Ordering};

use tokio::fs::File;
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};
use tokio::net::UnixStream;

use super::ipp::{Attributes, Request, Response, SUBSCRIPTION};

const SOCKET: &str = "/run/cups/cups.sock";
const SERVER: &str = "ipp://localhost/";
const DOCUMENT_CHUNK: usize = 64 * 1024;
const NOT_FOUND: u16 = 0x0406;
pub const PRINT_JOB: u16 = 0x0002;
const CUPS_GET_DEFAULT: u16 = 0x4001;
const CUPS_GET_PRINTERS: u16 = 0x4002;
const CREATE_SUBSCRIPTIONS: u16 = 0x0016;
const RENEW_SUBSCRIPTION: u16 = 0x0018;
const CANCEL_SUBSCRIPTION: u16 = 0x001b;
const GET_JOB_ATTRIBUTES: u16 = 0x0009;
const GET_PRINTER_ATTRIBUTES: u16 = 0x000b;
pub const LEASE_SECONDS: i32 = 3600;
const EVENTS: [&str; 7] = [
    "job-created",
    "job-completed",
    "job-state-changed",
    "job-state",
    "printer-added",
    "printer-deleted",
    "printer-state-changed",
];

pub struct Cups {
    socket: PathBuf,
    user: String,
    requests: AtomicU32,
}

impl Cups {
    pub fn new() -> Self {
        Self {
            socket: std::env::var_os("CUPS_SERVER")
                .map(PathBuf::from)
                .filter(|path| path.is_absolute())
                .unwrap_or_else(|| PathBuf::from(SOCKET)),
            user: glib::user_name().to_string_lossy().into_owned(),
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

    pub async fn subscribe(&self) -> io::Result<i32> {
        let mut request = self.request(CREATE_SUBSCRIPTIONS, SERVER);
        request
            .group(SUBSCRIPTION)
            .uri("notify-recipient-uri", "dbus://")
            .keywords("notify-events", &EVENTS)
            .integer("notify-lease-duration", LEASE_SECONDS);
        let response = self.send(request.finish()).await?;
        response
            .integer("notify-subscription-id")
            .filter(|_| response.successful())
            .ok_or_else(|| io::Error::other("The printing service refused to send updates"))
    }

    pub async fn renew(&self, subscription: i32) -> io::Result<()> {
        let mut request = self.request(RENEW_SUBSCRIPTION, SERVER);
        request
            .integer("notify-subscription-id", subscription)
            .group(SUBSCRIPTION)
            .integer("notify-lease-duration", LEASE_SECONDS);
        expect_success(&self.send(request.finish()).await?)
    }

    pub fn cancel(&self, subscription: i32) -> io::Result<()> {
        let mut request = self.request(CANCEL_SUBSCRIPTION, SERVER);
        request.integer("notify-subscription-id", subscription);
        let body = request.finish();
        let mut stream = std::os::unix::net::UnixStream::connect(&self.socket)?;
        std::io::Write::write_all(&mut stream, &header(&content_length(&body)))?;
        std::io::Write::write_all(&mut stream, &body)?;
        let mut reply = Vec::new();
        std::io::Read::read_to_end(&mut stream, &mut reply)?;
        expect_success(&parse_reply(&reply)?)
    }

    pub async fn job_owner(&self, printer: &str, job: u32) -> io::Result<String> {
        let mut request = self.request(GET_JOB_ATTRIBUTES, printer);
        request
            .integer("job-id", job as i32)
            .keywords("requested-attributes", &["job-originating-user-name"]);
        let response = self.send(request.finish()).await?;
        Ok(response
            .text("job-originating-user-name")
            .unwrap_or_default()
            .to_owned())
    }

    pub async fn printer_type(&self, printer: &str) -> io::Result<i32> {
        let mut request = self.request(GET_PRINTER_ATTRIBUTES, printer);
        request.keywords("requested-attributes", &["printer-type"]);
        let response = self.send(request.finish()).await?;
        response
            .integer("printer-type")
            .ok_or_else(|| io::Error::other("The printer didn't say what kind it is"))
    }

    pub async fn printers(&self, attributes: &[&str]) -> io::Result<Vec<Attributes>> {
        let mut request = self.request(CUPS_GET_PRINTERS, SERVER);
        request.keywords("requested-attributes", attributes);
        let response = self.send(request.finish()).await?;
        if response.status == NOT_FOUND {
            return Ok(Vec::new());
        }
        expect_success(&response)?;
        Ok(response.into_printers())
    }

    pub async fn default_printer(&self) -> io::Result<Option<String>> {
        let mut request = self.request(CUPS_GET_DEFAULT, SERVER);
        request.keywords("requested-attributes", &["printer-name"]);
        let response = self.send(request.finish()).await?;
        Ok(response.text("printer-name").map(str::to_owned))
    }

    async fn send(&self, body: Vec<u8>) -> io::Result<Response> {
        let mut stream = UnixStream::connect(&self.socket).await?;
        stream.write_all(&header(&content_length(&body))).await?;
        stream.write_all(&body).await?;
        read_reply(stream).await
    }

    pub async fn send_document(&self, body: Vec<u8>, mut document: File) -> io::Result<Response> {
        let mut stream = UnixStream::connect(&self.socket).await?;
        stream
            .write_all(&header("Transfer-Encoding: chunked"))
            .await?;
        write_chunk(&mut stream, &body).await?;
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

pub fn expect_success(response: &Response) -> io::Result<()> {
    if response.successful() {
        Ok(())
    } else {
        Err(io::Error::other(format!(
            "The printing service answered with status {:#06x}",
            response.status
        )))
    }
}

fn content_length(body: &[u8]) -> String {
    format!("Content-Length: {}", body.len())
}

fn header(framing: &str) -> Vec<u8> {
    format!(
        "POST / HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/ipp\r\n{framing}\r\nConnection: close\r\n\r\n"
    )
    .into_bytes()
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
