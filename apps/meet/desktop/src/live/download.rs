use std::io::{self, Read};
use std::time::Duration;

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use ureq::Agent;
use ureq::tls::{RootCerts, TlsConfig};

use luft_variant::Variant;

const DOWNLOADS: &str = "https://get.luft.computer";
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
    fn name(self) -> &'static str {
        match self {
            Self::Latest => "latest",
            Self::Nightly => "nightly",
        }
    }

    fn isos(self, downloads: &str, variant: Variant) -> [String; 2] {
        [
            published_at(downloads, self, Some(variant)),
            published_at(downloads, self, None),
        ]
    }
}

fn published_at(downloads: &str, channel: Channel, variant: Option<Variant>) -> String {
    let name = channel.name();
    match variant {
        Some(variant) => format!("{downloads}/luft-{name}-{}.iso", variant.name()),
        None => format!("{downloads}/luft-{name}.iso"),
    }
}

pub fn published(channel: Channel, variant: Option<Variant>) -> String {
    published_at(DOWNLOADS, channel, variant)
}

pub struct Located {
    pub iso: String,
    pub checksum: [u8; 32],
}

fn missing(error: &ureq::Error) -> bool {
    matches!(error, ureq::Error::StatusCode(404))
}

fn locate_at(
    agent: &Agent,
    downloads: &str,
    channel: Channel,
    variant: Variant,
) -> io::Result<Located> {
    let [built_for_it, universal] = channel.isos(downloads, variant);
    match checksum(agent, &built_for_it) {
        Ok(checksum) => Ok(Located {
            iso: built_for_it,
            checksum,
        }),
        Err(Fetch::Missing) => checksum(agent, &universal)
            .map(|checksum| Located {
                iso: universal,
                checksum,
            })
            .map_err(Fetch::into_io),
        Err(other) => Err(other.into_io()),
    }
}

pub fn locate(agent: &Agent, channel: Channel, variant: Variant) -> io::Result<Located> {
    locate_at(agent, DOWNLOADS, channel, variant)
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

pub fn format_checksum(digest: &[u8; 32]) -> String {
    digest.iter().map(|byte| format!("{byte:02x}")).collect()
}

enum Fetch {
    Missing,
    Failed(io::Error),
}

impl Fetch {
    fn into_io(self) -> io::Error {
        match self {
            Self::Missing => io::Error::new(io::ErrorKind::NotFound, "Luft isn't published there"),
            Self::Failed(error) => error,
        }
    }
}

fn checksum(agent: &Agent, iso: &str) -> Result<[u8; 32], Fetch> {
    let fetched = |error: ureq::Error| {
        if missing(&error) {
            Fetch::Missing
        } else {
            Fetch::Failed(failed(error))
        }
    };
    let text = agent
        .get(format!("{iso}.sha256"))
        .call()
        .map_err(fetched)?
        .body_mut()
        .read_to_string()
        .map_err(fetched)?;
    parse_checksum(&text).ok_or_else(|| {
        Fetch::Failed(io::Error::new(
            io::ErrorKind::InvalidData,
            "The checksum file isn't readable",
        ))
    })
}

pub fn published_checksum(agent: &Agent, iso: &str) -> io::Result<Option<[u8; 32]>> {
    match checksum(agent, iso) {
        Ok(checksum) => Ok(Some(checksum)),
        Err(Fetch::Missing) => Ok(None),
        Err(other) => Err(other.into_io()),
    }
}

pub fn published_size(agent: &Agent, iso: &str) -> io::Result<u64> {
    let response = agent.head(iso).call().map_err(failed)?;
    response
        .headers()
        .get("content-length")
        .and_then(|value| value.to_str().ok()?.parse().ok())
        .ok_or_else(|| io::Error::other("The download's size isn't known"))
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
    use std::io::{BufRead, BufReader, Write};
    use std::net::TcpListener;

    use super::*;

    fn published(names: &'static [(&'static str, &'static str)]) -> String {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        std::thread::spawn(move || {
            for stream in listener.incoming().flatten() {
                let mut reader = BufReader::new(&stream);
                let mut request = String::new();
                reader.read_line(&mut request).unwrap();
                let path = request
                    .split_whitespace()
                    .nth(1)
                    .unwrap_or_default()
                    .to_owned();
                while reader.read_line(&mut String::new()).unwrap_or(0) > 2 {}
                let reply = match names.iter().find(|(name, _)| path == format!("/{name}")) {
                    Some((_, body)) => format!(
                        "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
                        body.len()
                    ),
                    None => {
                        "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
                            .to_owned()
                    }
                };
                let _ = (&stream).write_all(reply.as_bytes());
            }
        });
        format!("http://{address}")
    }

    fn plain_agent() -> Agent {
        Agent::config_builder()
            .http_status_as_error(true)
            .build()
            .into()
    }

    const STANDARD: &str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  luft-nightly-standard.iso\n";
    const UNIVERSAL: &str =
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  luft-nightly.iso\n";

    #[test]
    fn the_image_built_for_the_pc_is_downloaded_when_it_is_published() {
        let downloads = published(&[
            ("luft-nightly-standard.iso.sha256", STANDARD),
            ("luft-nightly.iso.sha256", UNIVERSAL),
        ]);
        let located = locate_at(
            &plain_agent(),
            &downloads,
            Channel::Nightly,
            Variant::Standard,
        )
        .unwrap();
        assert_eq!(
            located.iso,
            format!("{downloads}/luft-nightly-standard.iso")
        );
        assert_eq!(located.checksum, [0xaa; 32]);
    }

    #[test]
    fn the_universal_image_is_used_until_the_variant_is_published() {
        let downloads = published(&[("luft-nightly.iso.sha256", UNIVERSAL)]);
        let located = locate_at(
            &plain_agent(),
            &downloads,
            Channel::Nightly,
            Variant::Nvidia,
        )
        .unwrap();
        assert_eq!(located.iso, format!("{downloads}/luft-nightly.iso"));
        assert_eq!(located.checksum, [0xbb; 32]);
    }

    #[test]
    fn nothing_published_is_an_error() {
        let downloads = published(&[]);
        assert!(
            locate_at(
                &plain_agent(),
                &downloads,
                Channel::Latest,
                Variant::Standard
            )
            .is_err()
        );
    }

    #[test]
    fn the_checksum_file_names_the_digest_first() {
        let line = format!("{}  luft-latest.iso\n", "ab".repeat(32));
        assert_eq!(parse_checksum(&line), Some([0xab; 32]));
        assert_eq!(parse_checksum("not a checksum"), None);
        assert_eq!(
            parse_checksum(&format_checksum(&[0xab; 32])),
            Some([0xab; 32])
        );
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
