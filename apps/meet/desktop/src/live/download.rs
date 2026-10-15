use std::io::{self, Read};
use std::time::Duration;

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use ureq::Agent;
use ureq::tls::{RootCerts, TlsConfig};

const DOWNLOADS: &str = "https://get.luft.lanth.me";
const ATTEMPTS: u32 = 6;
const CONNECT_TIMEOUT: Duration = Duration::from_secs(30);
const READ_TIMEOUT: Duration = Duration::from_secs(60);

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Channel {
    Latest,
    Nightly,
}

impl Channel {
    pub fn iso(self) -> String {
        let name = match self {
            Self::Latest => "latest",
            Self::Nightly => "nightly",
        };
        format!("{DOWNLOADS}/luft-{name}.iso")
    }
}

pub fn agent() -> Agent {
    Agent::config_builder()
        .tls_config(
            TlsConfig::builder()
                .root_certs(RootCerts::PlatformVerifier)
                .build(),
        )
        .timeout_connect(Some(CONNECT_TIMEOUT))
        .timeout_recv_body(Some(READ_TIMEOUT))
        .http_status_as_error(true)
        .build()
        .into()
}

fn failed(error: ureq::Error) -> io::Error {
    io::Error::other(error.to_string())
}

pub fn parse_checksum(text: &str) -> Option<[u8; 32]> {
    let hex = text.split_whitespace().next()?;
    if hex.len() != 64 {
        return None;
    }
    let mut digest = [0; 32];
    for (index, byte) in digest.iter_mut().enumerate() {
        *byte = u8::from_str_radix(&hex[index * 2..index * 2 + 2], 16).ok()?;
    }
    Some(digest)
}

pub fn checksum(agent: &Agent, iso: &str) -> io::Result<[u8; 32]> {
    let text = agent
        .get(format!("{iso}.sha256"))
        .call()
        .map_err(failed)?
        .body_mut()
        .read_to_string()
        .map_err(failed)?;
    parse_checksum(&text).ok_or_else(|| {
        io::Error::new(
            io::ErrorKind::InvalidData,
            "The checksum file isn't readable",
        )
    })
}

pub struct Download {
    agent: Agent,
    url: String,
    position: u64,
    pub total: u64,
    body: Box<dyn Read + Send>,
}

impl Download {
    pub fn open(agent: &Agent, url: &str) -> io::Result<Self> {
        let response = agent.get(url).call().map_err(failed)?;
        let total = response
            .headers()
            .get("content-length")
            .and_then(|value| value.to_str().ok()?.parse().ok())
            .unwrap_or(0);
        Ok(Self {
            agent: agent.clone(),
            url: url.to_owned(),
            position: 0,
            total,
            body: Box::new(response.into_body().into_reader()),
        })
    }

    fn resume(&mut self) -> io::Result<()> {
        let response = self
            .agent
            .get(&self.url)
            .header("Range", format!("bytes={}-", self.position))
            .call()
            .map_err(failed)?;
        if response.status() != 206 {
            return Err(io::Error::other("The server can't continue the download"));
        }
        self.body = Box::new(response.into_body().into_reader());
        Ok(())
    }
}

impl Read for Download {
    fn read(&mut self, buffer: &mut [u8]) -> io::Result<usize> {
        let mut attempt = 0;
        loop {
            match self.body.read(buffer) {
                Ok(0) if self.total != 0 && self.position < self.total => {}
                Ok(read) => {
                    self.position += read as u64;
                    return Ok(read);
                }
                Err(error) if attempt + 1 >= ATTEMPTS => return Err(error),
                Err(_) => {}
            }
            attempt += 1;
            std::thread::sleep(Duration::from_secs(2u64.pow(attempt)));
            if let Err(error) = self.resume()
                && attempt + 1 >= ATTEMPTS
            {
                return Err(error);
            }
        }
    }
}

pub struct Hashing<R, F> {
    inner: R,
    hasher: Sha256,
    read: u64,
    progress: F,
}

impl<R: Read, F: FnMut(u64)> Hashing<R, F> {
    pub fn new(inner: R, progress: F) -> Self {
        Self {
            inner,
            hasher: Sha256::new(),
            read: 0,
            progress,
        }
    }

    pub fn digest(self) -> [u8; 32] {
        self.hasher.finalize().into()
    }
}

impl<R: Read, F: FnMut(u64)> Read for Hashing<R, F> {
    fn read(&mut self, buffer: &mut [u8]) -> io::Result<usize> {
        let read = self.inner.read(buffer)?;
        self.hasher.update(&buffer[..read]);
        self.read += read as u64;
        (self.progress)(self.read);
        Ok(read)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_checksum_file_names_the_digest_first() {
        let line = format!("{}  luft-latest.iso\n", "ab".repeat(32));
        assert_eq!(parse_checksum(&line), Some([0xab; 32]));
        assert_eq!(parse_checksum("not a checksum"), None);
    }

    #[test]
    fn everything_read_counts_towards_the_digest() {
        let mut seen = 0;
        let mut reader = Hashing::new(&b"luft"[..], |read| seen = read);
        io::copy(&mut reader, &mut io::sink()).unwrap();
        let expected: [u8; 32] = Sha256::digest(b"luft").into();
        assert_eq!(reader.digest(), expected);
        assert_eq!(seen, 4);
    }
}
