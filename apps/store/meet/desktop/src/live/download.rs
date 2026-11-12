use std::io::{self, Read};
use std::time::Duration;

use luft_i18n::t;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use specta::Type;
use ureq::Agent;
use ureq::tls::{RootCerts, TlsConfig};

use super::{newest, signature};
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
    version: String,
    size: u64,
    sha256: String,
}

pub struct Located {
    pub iso: String,
    pub size: u64,
    pub checksum: [u8; 32],
}

pub struct Trust<'a> {
    pub iso_key: &'a str,
    pub pointer_key: &'a str,
    pub newest_seen: &'a newest::Seen,
}

struct Published {
    located: Located,
    folder: &'static str,
    version: String,
}

fn missing(error: &ureq::Error) -> bool {
    matches!(error, ureq::Error::StatusCode(404))
}

fn invalid(message: String) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidData, message)
}

fn signed_pointer(
    agent: &Agent,
    downloads: &str,
    key: &str,
    folder: &str,
) -> Result<Pointer, Fetch> {
    let place = format!("{folder}/{POINTER}");
    let pointer = text(agent, &format!("{downloads}/{place}"))?;
    let signature = match text(agent, &format!("{downloads}/{place}.minisig")) {
        Err(Fetch::Missing) => Err(unreadable(t!(L10N, "live-pointer-not-signed"))),
        other => other,
    }?;
    signature::verify_pointer(key, &pointer, &signature, &place).map_err(unreadable)?;
    serde_json::from_str(&pointer).map_err(|_| unreadable(t!(L10N, "live-pointer-unreadable")))
}

fn locate_at(
    agent: &Agent,
    downloads: &str,
    trust: &Trust,
    channel: Channel,
) -> io::Result<Published> {
    let folder = channel.folder();
    let pointer = match signed_pointer(agent, downloads, trust.pointer_key, folder) {
        Err(Fetch::Missing) if channel == Channel::Latest => {
            return locate_at(agent, downloads, trust, Channel::Nightly);
        }
        fetched => fetched.map_err(Fetch::into_io)?,
    };
    if let Some(seen) = trust.newest_seen.get(folder)
        && newest::older(&pointer.version, seen)
    {
        return Err(invalid(t!(
            L10N,
            "live-pointer-older",
            offered = pointer.version,
            seen = seen.clone()
        )));
    }
    let iso = format!("{downloads}/{folder}/{}", pointer.name);
    let checksum = checksum(agent, trust.iso_key, &iso).map_err(Fetch::into_io)?;
    if parse_checksum(&pointer.sha256) != Some(checksum) {
        return Err(invalid(format!(
            "{} has two different checksums",
            pointer.name
        )));
    }
    Ok(Published {
        located: Located {
            iso,
            size: pointer.size,
            checksum,
        },
        folder,
        version: pointer.version,
    })
}

pub fn locate(agent: &Agent, channel: Channel) -> io::Result<Located> {
    let seen = newest::seen();
    let published = locate_at(
        agent,
        DOWNLOADS,
        &Trust {
            iso_key: signature::PUBLIC_KEY,
            pointer_key: signature::POINTER_KEY,
            newest_seen: &seen,
        },
        channel,
    )?;
    newest::remember(seen, published.folder, published.version)?;
    Ok(published.located)
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

fn checksum(agent: &Agent, key: &str, iso: &str) -> Result<[u8; 32], Fetch> {
    let checksum = text(agent, &format!("{iso}.sha256"))?;
    let signed = match text(agent, &format!("{iso}.sha256.minisig")) {
        Err(Fetch::Missing) => Err(unreadable(t!(
            L10N,
            "live-not-signed",
            iso = file_name(iso)
        ))),
        other => other,
    }?;
    signature::verify(key, &checksum, &signed, file_name(iso)).map_err(unreadable)?;
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

    use super::signature::signed::{
        CHECKSUM, KEY, NIGHTLY_POINTER_SIGNATURE, POINTER, POINTER_KEY, RELEASE_POINTER_SIGNATURE,
        SIGNATURE,
    };
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

    fn located(downloads: &str, seen: &newest::Seen, channel: Channel) -> io::Result<Located> {
        let trust = Trust {
            iso_key: KEY,
            pointer_key: POINTER_KEY,
            newest_seen: seen,
        };
        locate_at(&plain_agent(), downloads, &trust, channel).map(|published| published.located)
    }

    #[test]
    fn the_newest_iso_is_found_through_its_folders_pointer() {
        let downloads = published(&[
            ("nightly/latest.json", POINTER),
            ("nightly/latest.json.minisig", NIGHTLY_POINTER_SIGNATURE),
            ("nightly/luft-nightly.iso.sha256", CHECKSUM),
            ("nightly/luft-nightly.iso.sha256.minisig", SIGNATURE),
        ]);
        let located = located(&downloads, &newest::Seen::new(), Channel::Nightly).unwrap();
        assert_eq!(located.iso, format!("{downloads}/nightly/luft-nightly.iso"));
        assert_eq!(located.size, 4096);
        assert_eq!(located.checksum, [0xab; 32]);
    }

    #[test]
    fn a_pointer_counts_only_when_signed_for_its_folder() {
        let unsigned = published(&[
            ("nightly/latest.json", POINTER),
            ("nightly/luft-nightly.iso.sha256", CHECKSUM),
            ("nightly/luft-nightly.iso.sha256.minisig", SIGNATURE),
        ]);
        assert!(located(&unsigned, &newest::Seen::new(), Channel::Nightly).is_err());
        let from_releases = published(&[
            ("nightly/latest.json", POINTER),
            ("nightly/latest.json.minisig", RELEASE_POINTER_SIGNATURE),
            ("nightly/luft-nightly.iso.sha256", CHECKSUM),
            ("nightly/luft-nightly.iso.sha256.minisig", SIGNATURE),
        ]);
        assert!(located(&from_releases, &newest::Seen::new(), Channel::Nightly).is_err());
    }

    #[test]
    fn an_older_build_than_one_seen_before_is_refused() {
        let downloads = published(&[
            ("nightly/latest.json", POINTER),
            ("nightly/latest.json.minisig", NIGHTLY_POINTER_SIGNATURE),
            ("nightly/luft-nightly.iso.sha256", CHECKSUM),
            ("nightly/luft-nightly.iso.sha256.minisig", SIGNATURE),
        ]);
        let seen = |version: &str| newest::Seen::from([("nightly".to_owned(), version.to_owned())]);
        assert!(located(&downloads, &seen("1.1-nightly.22"), Channel::Nightly).is_err());
        assert!(located(&downloads, &seen("1.1-nightly.21"), Channel::Nightly).is_ok());
    }

    #[test]
    fn an_unsigned_checksum_is_refused() {
        let downloads = published(&[
            ("nightly/latest.json", POINTER),
            ("nightly/latest.json.minisig", NIGHTLY_POINTER_SIGNATURE),
            ("nightly/luft-nightly.iso.sha256", CHECKSUM),
        ]);
        assert!(located(&downloads, &newest::Seen::new(), Channel::Nightly).is_err());
    }

    #[test]
    fn releases_are_found_in_the_major_versions_folder() {
        let downloads = published(&[
            ("1/latest.json", POINTER),
            ("1/latest.json.minisig", RELEASE_POINTER_SIGNATURE),
            ("1/luft-nightly.iso.sha256", CHECKSUM),
            ("1/luft-nightly.iso.sha256.minisig", SIGNATURE),
        ]);
        let located = located(&downloads, &newest::Seen::new(), Channel::Latest).unwrap();
        assert_eq!(located.iso, format!("{downloads}/1/luft-nightly.iso"));
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
