use std::io::{self, Read};
use std::time::Duration;

use luft_i18n::t;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use ureq::Agent;
use ureq::tls::{RootCerts, TlsConfig};
use specta::Type;

use super::signature;
use crate::L10N;

const DOWNLOADS: &str = "https://get.luft.computer";
const MAJOR: &str = "1";
const POINTER: &str = "latest.json";
const ATTEMPTS: u32 = 6;
const CONNECT_TIMEOUT: Duration = Duration::from_secs(30);
const READ_TIMEOUT: Duration = Duration::from_secs(60);

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Channel {
    Latest,
    Nightly,
}

impl Channel {
    fn folder(self) -> &'static str {
        match self {
            Self::Latest => MAJOR,
            Self::Nightly => "nightly",
        }
    }
}

#[derive(Deserialize)]
struct Pointer {
    name: String,
    size: u64,
    sha256: String,
}

pub struct Located {
    pub iso: String,
    pub size: u64,
    pub checksum: [u8; 32],
}

fn missing(error: &ureq::Error) -> bool {
    matches!(error, ureq::Error::StatusCode(404))
}

fn locate_at(
    agent: &Agent,
    downloads: &str,
    key: Option<&str>,
    channel: Channel,
) -> io::Result<Located> {
    let folder = format!("{downloads}/{}", channel.folder());
    let pointer: Pointer =
        serde_json::from_str(&text(agent, &format!("{folder}/{POINTER}")).map_err(Fetch::into_io)?)
            .map_err(|_| {
                io::Error::new(
                    io::ErrorKind::InvalidData,
                    t!(L10N, "live-pointer-unreadable"),
                )
            })?;
    let iso = format!("{folder}/{}", pointer.name);
    let checksum = checksum(agent, key, &iso).map_err(Fetch::into_io)?;
    if parse_checksum(&pointer.sha256) != Some(checksum) {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            format!("{} has two different checksums", pointer.name),
        ));
    }
    Ok(Located {
        iso,
        size: pointer.size,
        checksum,
    })
}

pub fn locate(agent: &Agent, channel: Channel) -> io::Result<Located> {
    locate_at(agent, DOWNLOADS, signature::PUBLIC_KEY, channel)
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

pub fn file_name(url: &str) -> &str {
    url.rsplit('/').next().unwrap_or(url)
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
            Self::Missing => {
                io::Error::new(io::ErrorKind::NotFound, t!(L10N, "live-not-published"))
            }
            Self::Failed(error) => error,
        }
    }
}

fn text(agent: &Agent, url: &str) -> Result<String, Fetch> {
    let fetched = |error: ureq::Error| {
        if missing(&error) {
            Fetch::Missing
        } else {
            Fetch::Failed(failed(error))
        }
    };
    agent
        .get(url)
        .call()
        .map_err(fetched)?
        .body_mut()
        .read_to_string()
        .map_err(fetched)
}

fn unreadable(message: String) -> Fetch {
    Fetch::Failed(io::Error::new(io::ErrorKind::InvalidData, message))
}

fn checksum(agent: &Agent, key: Option<&str>, iso: &str) -> Result<[u8; 32], Fetch> {
    let checksum = text(agent, &format!("{iso}.sha256"))?;
    if let Some(key) = key {
        let signed = match text(agent, &format!("{iso}.sha256.minisig")) {
            Err(Fetch::Missing) => Err(unreadable(t!(
                L10N,
                "live-not-signed",
                iso = file_name(iso)
            ))),
            other => other,
        }?;
        signature::verify(key, &checksum, &signed, file_name(iso)).map_err(unreadable)?;
    }
    parse_checksum(&checksum).ok_or_else(|| unreadable(t!(L10N, "live-checksum-unreadable")))
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
            return Err(io::Error::other(t!(L10N, "live-download-not-resumable")));
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

    const POINTER: &str = r#"{"name": "luft-1.1-nightly.21.iso", "version": "1.1-nightly.21", "size": 4096, "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}"#;
    const CHECKSUM: &str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  luft-1.1-nightly.21.iso\n";
    const OTHER_CHECKSUM: &str = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb  luft-1.1-nightly.21.iso\n";

    #[test]
    fn the_newest_iso_is_found_through_its_folders_pointer() {
        let downloads = published(&[
            ("nightly/latest.json", POINTER),
            ("nightly/luft-1.1-nightly.21.iso.sha256", CHECKSUM),
        ]);
        let located = locate_at(&plain_agent(), &downloads, None, Channel::Nightly).unwrap();
        assert_eq!(
            located.iso,
            format!("{downloads}/nightly/luft-1.1-nightly.21.iso")
        );
        assert_eq!(located.size, 4096);
        assert_eq!(located.checksum, [0xaa; 32]);
    }

    #[test]
    fn a_pointer_that_disagrees_with_the_checksum_file_is_refused() {
        let downloads = published(&[
            ("nightly/latest.json", POINTER),
            ("nightly/luft-1.1-nightly.21.iso.sha256", OTHER_CHECKSUM),
        ]);
        assert!(locate_at(&plain_agent(), &downloads, None, Channel::Nightly).is_err());
    }

    #[test]
    fn an_unsigned_checksum_is_refused_once_there_is_a_key() {
        let downloads = published(&[
            ("nightly/latest.json", POINTER),
            ("nightly/luft-1.1-nightly.21.iso.sha256", CHECKSUM),
        ]);
        let key = Some("RWQuKaSbHEMaG0cGBcTRjFj81Fysjto7YETokGzKqzy6t4/CiyKPriyV");
        assert!(locate_at(&plain_agent(), &downloads, key, Channel::Nightly).is_err());
    }

    #[test]
    fn releases_are_found_in_the_major_versions_folder() {
        let downloads = published(&[
            (
                "1/latest.json",
                r#"{"name": "luft-1.1.iso", "version": "1.1", "size": 2048, "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}"#,
            ),
            ("1/luft-1.1.iso.sha256", CHECKSUM),
        ]);
        let located = locate_at(&plain_agent(), &downloads, None, Channel::Latest).unwrap();
        assert_eq!(located.iso, format!("{downloads}/1/luft-1.1.iso"));
        assert_eq!(located.size, 2048);
    }

    #[test]
    fn nothing_published_is_an_error() {
        let downloads = published(&[]);
        assert!(locate_at(&plain_agent(), &downloads, None, Channel::Nightly).is_err());
    }

    #[test]
    fn the_checksum_file_names_the_digest_first() {
        let line = format!("{}  luft-1.1-nightly.21.iso\n", "ab".repeat(32));
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
