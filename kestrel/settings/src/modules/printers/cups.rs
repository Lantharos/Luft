use std::io;

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::UnixStream;

use super::ipp::{Request, Response, SUBSCRIPTION};

const SOCKET: &str = "/run/cups/cups.sock";
const SERVER: &str = "ipp://localhost/";
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
    user: String,
    requests: u32,
}

impl Cups {
    pub fn new() -> Self {
        Self {
            user: glib::user_name().to_string_lossy().into_owned(),
            requests: 0,
        }
    }

    pub fn user(&self) -> &str {
        &self.user
    }

    fn request(&mut self, operation: u16, printer: &str) -> Request {
        self.requests += 1;
        let mut request = Request::new(operation, self.requests);
        request
            .uri("printer-uri", printer)
            .name("requesting-user-name", &self.user);
        request
    }

    pub async fn subscribe(&mut self) -> io::Result<i32> {
        let mut request = self.request(CREATE_SUBSCRIPTIONS, SERVER);
        request
            .group(SUBSCRIPTION)
            .uri("notify-recipient-uri", "dbus://")
            .keywords("notify-events", &EVENTS)
            .integer("notify-lease-duration", LEASE_SECONDS);
        let response = send(request.finish()).await?;
        response
            .integer("notify-subscription-id")
            .filter(|_| response.successful())
            .ok_or_else(|| io::Error::other("The printing service refused to send updates"))
    }

    pub async fn renew(&mut self, subscription: i32) -> io::Result<()> {
        let mut request = self.request(RENEW_SUBSCRIPTION, SERVER);
        request
            .integer("notify-subscription-id", subscription)
            .group(SUBSCRIPTION)
            .integer("notify-lease-duration", LEASE_SECONDS);
        expect_success(send(request.finish()).await?)
    }

    pub fn cancel(&mut self, subscription: i32) -> io::Result<()> {
        let mut request = self.request(CANCEL_SUBSCRIPTION, SERVER);
        request.integer("notify-subscription-id", subscription);
        let body = request.finish();
        let mut stream = std::os::unix::net::UnixStream::connect(SOCKET)?;
        std::io::Write::write_all(&mut stream, &header(body.len()))?;
        std::io::Write::write_all(&mut stream, &body)?;
        let mut reply = Vec::new();
        std::io::Read::read_to_end(&mut stream, &mut reply)?;
        expect_success(parse_reply(&reply)?)
    }

    pub async fn job_owner(&mut self, printer: &str, job: u32) -> io::Result<String> {
        let mut request = self.request(GET_JOB_ATTRIBUTES, printer);
        request
            .integer("job-id", job as i32)
            .keywords("requested-attributes", &["job-originating-user-name"]);
        let response = send(request.finish()).await?;
        Ok(response
            .text("job-originating-user-name")
            .unwrap_or_default()
            .to_owned())
    }

    pub async fn printer_type(&mut self, printer: &str) -> io::Result<i32> {
        let mut request = self.request(GET_PRINTER_ATTRIBUTES, printer);
        request.keywords("requested-attributes", &["printer-type"]);
        let response = send(request.finish()).await?;
        response
            .integer("printer-type")
            .ok_or_else(|| io::Error::other("The printer didn't say what kind it is"))
    }
}

fn expect_success(response: Response) -> io::Result<()> {
    if response.successful() {
        Ok(())
    } else {
        Err(io::Error::other(format!(
            "The printing service answered with status {:#06x}",
            response.status
        )))
    }
}

fn header(length: usize) -> Vec<u8> {
    format!(
        "POST / HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/ipp\r\nContent-Length: {length}\r\nConnection: close\r\n\r\n"
    )
    .into_bytes()
}

async fn send(body: Vec<u8>) -> io::Result<Response> {
    let mut stream = UnixStream::connect(SOCKET).await?;
    stream.write_all(&header(body.len())).await?;
    stream.write_all(&body).await?;
    let mut reply = Vec::new();
    stream.read_to_end(&mut reply).await?;
    parse_reply(&reply)
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
