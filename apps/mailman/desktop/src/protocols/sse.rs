use std::io::{BufRead, BufReader, ErrorKind, Read, Write};
use std::net::TcpStream;
use std::time::Duration;

use url::{Position, Url};

use super::net::{Security, Server, Stream};

pub struct EventStream {
    body: Box<dyn BufRead + Send>,
    handle: TcpStream,
}

impl EventStream {
    pub fn open(address: &str, authorization: &str, silence: Duration) -> Result<Self, String> {
        let url = Url::parse(address).map_err(|error| error.to_string())?;
        let security = match url.scheme() {
            "https" => Security::Tls,
            "http" => Security::None,
            scheme => return Err(format!("Push over {scheme} isn't supported")),
        };
        let host = url
            .host_str()
            .ok_or("The push address has no host")?
            .trim_start_matches('[')
            .trim_end_matches(']')
            .to_owned();
        let port = url
            .port_or_known_default()
            .ok_or("The push address has no port")?;
        let stream = Stream::connect(&Server {
            host,
            port,
            security,
        })?;
        stream.set_timeout(Some(silence));
        let handle = stream.handle()?;
        let mut reader = BufReader::new(stream);
        let request = format!(
            "GET {} HTTP/1.1\r\nHost: {}\r\nAuthorization: {authorization}\r\nAccept: text/event-stream\r\nCache-Control: no-cache\r\n\r\n",
            &url[Position::BeforePath..Position::AfterQuery],
            &url[Position::BeforeHost..Position::AfterPort],
        );
        let stream = reader.get_mut();
        stream
            .write_all(request.as_bytes())
            .and_then(|_| stream.flush())
            .map_err(|error| error.to_string())?;
        let status = line(&mut reader)?;
        let code = status.split_whitespace().nth(1).unwrap_or_default();
        if code != "200" {
            return Err(format!("The server refused push ({code})"));
        }
        let mut chunked = false;
        loop {
            let header = line(&mut reader)?;
            if header.is_empty() {
                break;
            }
            if let Some((name, value)) = header.split_once(':')
                && name.trim().eq_ignore_ascii_case("transfer-encoding")
            {
                chunked = value.trim().eq_ignore_ascii_case("chunked");
            }
        }
        let body: Box<dyn BufRead + Send> = if chunked {
            Box::new(BufReader::new(Chunked {
                inner: reader,
                left: 0,
            }))
        } else {
            Box::new(reader)
        };
        Ok(Self { body, handle })
    }

    pub fn handle(&self) -> Result<TcpStream, String> {
        self.handle.try_clone().map_err(|error| error.to_string())
    }

    pub fn next(&mut self) -> Result<String, String> {
        let mut name = String::new();
        let mut data = false;
        loop {
            let read = line(&mut self.body)?;
            if let Some(value) = read.strip_prefix("event:") {
                name = value.trim().to_owned();
            } else if read.starts_with("data:") {
                data = true;
            } else if read.is_empty() && data {
                return Ok(name);
            }
        }
    }
}

fn line(reader: &mut impl BufRead) -> Result<String, String> {
    let mut line = String::new();
    match reader.read_line(&mut line) {
        Ok(0) => Err("The server closed the event stream".into()),
        Ok(_) => Ok(line.trim_end_matches(['\r', '\n']).to_owned()),
        Err(error) if matches!(error.kind(), ErrorKind::WouldBlock | ErrorKind::TimedOut) => {
            Err("The event stream went silent".into())
        }
        Err(error) => Err(error.to_string()),
    }
}

struct Chunked<R> {
    inner: R,
    left: usize,
}

impl<R: BufRead> Read for Chunked<R> {
    fn read(&mut self, buffer: &mut [u8]) -> std::io::Result<usize> {
        if self.left == 0 {
            let mut size = String::new();
            while size.trim().is_empty() {
                size.clear();
                if self.inner.read_line(&mut size)? == 0 {
                    return Ok(0);
                }
            }
            let digits = size.split(';').next().unwrap_or_default().trim();
            self.left = usize::from_str_radix(digits, 16)
                .map_err(|error| std::io::Error::new(ErrorKind::InvalidData, error))?;
            if self.left == 0 {
                return Ok(0);
            }
        }
        let wanted = buffer.len().min(self.left);
        let read = self.inner.read(&mut buffer[..wanted])?;
        if read == 0 {
            return Err(ErrorKind::UnexpectedEof.into());
        }
        self.left -= read;
        Ok(read)
    }
}
