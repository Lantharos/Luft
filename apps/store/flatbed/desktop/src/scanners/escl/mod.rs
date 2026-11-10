mod capabilities;
mod pinned;

use std::io::Read;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, RecvTimeoutError};
use std::thread;
use std::time::{Duration, Instant};

use ureq::Agent;
use ureq::unversioned::resolver::DefaultResolver;
use ureq::unversioned::transport::{Connector, TcpConnector};

pub use capabilities::{Capabilities, Input};
pub use pinned::Pin;
use pinned::PinnedTls;

use super::{Feed, Progress, ScanError};

const BUSY_RETRIES: u32 = 90;
const PREVIEW_EVERY: Duration = Duration::from_millis(350);
const ANSWER_WITHIN: Duration = Duration::from_secs(60);
const PAGE_STARTS_WITHIN: Duration = Duration::from_secs(300);
const PAGE_ARRIVES_WITHIN: Duration = Duration::from_secs(1800);
const PAGE_STALLS_AFTER: Duration = Duration::from_secs(60);
const CANCEL_CHECK_EVERY: Duration = Duration::from_millis(100);
const LARGEST_PAGE: u64 = 1 << 30;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Endpoint {
    pub base: String,
}

impl Endpoint {
    pub fn new(secure: bool, host: &str, port: u16, root: &str) -> Self {
        let scheme = if secure { "https" } else { "http" };
        let host = if host.contains(':') {
            format!("[{host}]")
        } else {
            host.to_owned()
        };
        let root = root.trim_matches('/');
        let root = if root.is_empty() { "eSCL" } else { root };
        Self {
            base: format!("{scheme}://{host}:{port}/{root}"),
        }
    }

    fn origin(&self) -> &str {
        let after_scheme = self.base.find("://").map_or(0, |at| at + 3);
        let end = self.base[after_scheme..]
            .find('/')
            .map_or(self.base.len(), |at| after_scheme + at);
        &self.base[..end]
    }
}

fn agent(pin: &Pin) -> Agent {
    let config = Agent::config_builder()
        .http_status_as_error(false)
        .proxy(None)
        .timeout_connect(Some(Duration::from_secs(5)))
        .timeout_recv_response(Some(ANSWER_WITHIN))
        .timeout_recv_body(Some(ANSWER_WITHIN))
        .build();
    let connector = TcpConnector::default().chain(PinnedTls::new(pin));
    Agent::with_parts(config, connector, DefaultResolver::default())
}

fn failed(error: impl std::fmt::Display) -> ScanError {
    ScanError::Failed(error.to_string())
}

pub fn capabilities(endpoint: &Endpoint, pin: &Pin) -> Result<Capabilities, String> {
    let mut response = agent(pin)
        .get(format!("{}/ScannerCapabilities", endpoint.base))
        .call()
        .map_err(|error| error.to_string())?;
    if !response.status().is_success() {
        eprintln!(
            "flatbed: the scanner answered {} when asked what it can do",
            response.status()
        );
        return Err("The scanner didn't say what it can do".into());
    }
    capabilities::parse(
        &response
            .body_mut()
            .read_to_string()
            .map_err(|error| error.to_string())?,
    )
}

fn settings(
    capabilities: &Capabilities,
    input: &Input,
    feed: Feed,
    colour: bool,
    dpi: u32,
    format: &str,
) -> String {
    let source = if feed == Feed::Glass {
        "Platen"
    } else {
        "Feeder"
    };
    let both_sides = if feed == Feed::BothSides {
        "<scan:Duplex>true</scan:Duplex>"
    } else {
        ""
    };
    let version = if capabilities.version.is_empty() {
        "2.0"
    } else {
        &capabilities.version
    };
    let mode = input.colour_mode(colour);
    format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<scan:ScanSettings xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03" xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm"><pwg:Version>{version}</pwg:Version><pwg:ScanRegions pwg:MustHonor="false"><pwg:ScanRegion><pwg:ContentRegionUnits>escl:ThreeHundredthsOfInches</pwg:ContentRegionUnits><pwg:XOffset>0</pwg:XOffset><pwg:YOffset>0</pwg:YOffset><pwg:Width>{width}</pwg:Width><pwg:Height>{height}</pwg:Height></pwg:ScanRegion></pwg:ScanRegions><pwg:InputSource>{source}</pwg:InputSource>{both_sides}<scan:ColorMode>{mode}</scan:ColorMode><scan:XResolution>{dpi}</scan:XResolution><scan:YResolution>{dpi}</scan:YResolution><pwg:DocumentFormat>{format}</pwg:DocumentFormat><scan:DocumentFormatExt>{format}</scan:DocumentFormatExt></scan:ScanSettings>"#,
        width = input.width,
        height = input.height,
    )
}

pub fn scan(
    endpoint: &Endpoint,
    pin: &Pin,
    feed: Feed,
    colour: bool,
    dpi: u32,
    cancel: &AtomicBool,
    progress: &mut dyn Progress,
) -> Result<(), ScanError> {
    let capabilities = capabilities(endpoint, pin).map_err(ScanError::Failed)?;
    let input = match feed {
        Feed::Glass => capabilities.platen.as_ref(),
        Feed::Feeder | Feed::BothSides => capabilities.feeder.as_ref(),
    }
    .ok_or_else(|| failed("The scanner can't scan that way"))?;
    let format = input
        .format()
        .ok_or_else(|| failed("The scanner sends no pictures Flatbed reads"))?;
    let dpi = input.resolution(dpi);
    let agent = agent(pin);
    let mut response = agent
        .post(format!("{}/ScanJobs", endpoint.base))
        .header("Content-Type", "text/xml")
        .send(settings(&capabilities, input, feed, colour, dpi, format))
        .map_err(failed)?;
    match response.status().as_u16() {
        201 => {}
        409 | 503 => return Err(ScanError::Busy),
        status => {
            let body = response.body_mut().read_to_string().unwrap_or_default();
            eprintln!("flatbed: the scanner refused the scan ({status}) {body}");
            return Err(failed("The scanner refused the scan"));
        }
    }
    let location = response
        .headers()
        .get("location")
        .and_then(|value| value.to_str().ok())
        .and_then(path_on_scanner)
        .ok_or_else(|| failed("The scanner didn't say where the scan is"))?;
    let job = format!("{}{location}", endpoint.origin());
    let result = documents(&agent, &job, feed, dpi, cancel, progress);
    if cancel.load(Ordering::Relaxed) || result.is_err() {
        let _ = agent.delete(&job).call();
    }
    result
}

fn path_on_scanner(location: &str) -> Option<&str> {
    if location.starts_with('/') {
        return Some(location);
    }
    let (_, after_scheme) = location.split_once("://")?;
    Some(&after_scheme[after_scheme.find('/')?..])
}

fn documents(
    agent: &Agent,
    job: &str,
    feed: Feed,
    dpi: u32,
    cancel: &AtomicBool,
    progress: &mut dyn Progress,
) -> Result<(), ScanError> {
    let mut pages = 0;
    let mut busy = 0;
    loop {
        if cancel.load(Ordering::Relaxed) {
            return Err(ScanError::Cancelled);
        }
        let response = agent
            .get(format!("{job}/NextDocument"))
            .config()
            .timeout_recv_response(Some(PAGE_STARTS_WITHIN))
            .timeout_recv_body(Some(PAGE_ARRIVES_WITHIN))
            .build()
            .call()
            .map_err(failed)?;
        match response.status().as_u16() {
            200 => {
                busy = 0;
                let reader = response
                    .into_body()
                    .into_with_config()
                    .limit(LARGEST_PAGE)
                    .reader();
                let bytes = receive(reader, cancel, progress)?;
                progress.page_encoded(bytes, dpi as f32);
                pages += 1;
                if feed == Feed::Glass {
                    return Ok(());
                }
            }
            404 | 410 if pages > 0 => return Ok(()),
            404 | 410 => {
                return Err(if feed == Feed::Glass {
                    failed("The scanner sent nothing")
                } else {
                    ScanError::FeederEmpty
                });
            }
            503 if busy < BUSY_RETRIES => {
                busy += 1;
                thread::sleep(Duration::from_secs(1));
            }
            503 => return Err(ScanError::Busy),
            status => {
                eprintln!("flatbed: the scanner answered {status} when asked for a page");
                return Err(failed("The scanner didn't send the page"));
            }
        }
    }
}

fn ended(partial: &[u8]) -> Vec<u8> {
    let mut closed = Vec::with_capacity(partial.len() + 2);
    closed.extend_from_slice(partial);
    closed.extend_from_slice(&[0xff, 0xd9]);
    closed
}

fn receive(
    mut reader: impl Read + Send + 'static,
    cancel: &AtomicBool,
    progress: &mut dyn Progress,
) -> Result<Vec<u8>, ScanError> {
    let (arrived, arriving) = mpsc::sync_channel(8);
    thread::spawn(move || {
        let mut chunk = vec![0; 64 * 1024];
        loop {
            let sent = match reader.read(&mut chunk) {
                Ok(0) => break,
                Ok(read) => arrived.send(Ok(chunk[..read].to_vec())),
                Err(error) => arrived.send(Err(error)),
            };
            if sent.is_err() {
                break;
            }
        }
    });
    let mut bytes = Vec::with_capacity(1 << 20);
    let mut heard = Instant::now();
    let mut shown = Instant::now();
    loop {
        if cancel.load(Ordering::Relaxed) {
            return Err(ScanError::Cancelled);
        }
        match arriving.recv_timeout(CANCEL_CHECK_EVERY) {
            Ok(chunk) => {
                bytes.extend_from_slice(&chunk.map_err(failed)?);
                heard = Instant::now();
                if shown.elapsed() >= PREVIEW_EVERY {
                    progress.preview(&ended(&bytes));
                    shown = Instant::now();
                }
            }
            Err(RecvTimeoutError::Disconnected) => return Ok(bytes),
            Err(RecvTimeoutError::Timeout) if heard.elapsed() < PAGE_STALLS_AFTER => {}
            Err(RecvTimeoutError::Timeout) => {
                return Err(failed("The scanner stopped sending the page"));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_scan_stays_on_the_scanner_that_started_it() {
        assert_eq!(
            path_on_scanner("/eSCL/ScanJobs/7"),
            Some("/eSCL/ScanJobs/7")
        );
        assert_eq!(
            path_on_scanner("http://127.0.0.1:631/eSCL/ScanJobs/7"),
            Some("/eSCL/ScanJobs/7")
        );
        assert_eq!(path_on_scanner("https://printer.local"), None);
        assert_eq!(path_on_scanner("ScanJobs/7"), None);
    }
}
