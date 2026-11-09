mod capabilities;

use std::io::Read;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::{Duration, Instant};

use ureq::Agent;
use ureq::tls::TlsConfig;

pub use capabilities::{Capabilities, Input};

use super::{Feed, Progress, ScanError};

const BUSY_RETRIES: u32 = 90;
const PREVIEW_EVERY: Duration = Duration::from_millis(350);

/// Where an eSCL scanner answers, such as `http://192.168.1.20:80/eSCL`.
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

/// Scanners on a home network have certificates nobody signed, so a secure
/// connection to one can only be checked for being encrypted.
fn agent() -> Agent {
    Agent::config_builder()
        .http_status_as_error(false)
        .timeout_connect(Some(Duration::from_secs(5)))
        .tls_config(TlsConfig::builder().disable_verification(true).build())
        .build()
        .new_agent()
}

fn failed(error: impl std::fmt::Display) -> ScanError {
    ScanError::Failed(error.to_string())
}

pub fn capabilities(endpoint: &Endpoint) -> Result<Capabilities, String> {
    let mut response = agent()
        .get(format!("{}/ScannerCapabilities", endpoint.base))
        .call()
        .map_err(|error| error.to_string())?;
    if !response.status().is_success() {
        return Err(format!("The scanner answered {}", response.status()));
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

/// Scans every page `feed` gives, handing each over as the file the
/// scanner sent, and what has arrived of it while it comes in.
pub fn scan(
    endpoint: &Endpoint,
    feed: Feed,
    colour: bool,
    dpi: u32,
    cancel: &AtomicBool,
    progress: &mut dyn Progress,
) -> Result<(), ScanError> {
    let capabilities = capabilities(endpoint).map_err(ScanError::Failed)?;
    let input = match feed {
        Feed::Glass => capabilities.platen.as_ref(),
        Feed::Feeder | Feed::BothSides => capabilities.feeder.as_ref(),
    }
    .ok_or_else(|| failed("The scanner can't scan that way"))?;
    let format = input
        .format()
        .ok_or_else(|| failed("The scanner sends no pictures Flatbed reads"))?;
    let dpi = input.resolution(dpi);
    let agent = agent();
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
            return Err(failed(format!(
                "The scanner refused the scan ({status}) {body}"
            )));
        }
    }
    let location = response
        .headers()
        .get("location")
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| failed("The scanner didn't say where the scan is"))?;
    let job = if location.starts_with('/') {
        format!("{}{location}", endpoint.origin())
    } else {
        location.to_owned()
    };
    let result = documents(&agent, &job, feed, dpi, cancel, progress);
    if cancel.load(Ordering::Relaxed) || result.is_err() {
        let _ = agent.delete(&job).call();
    }
    result
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
        let mut response = agent
            .get(format!("{job}/NextDocument"))
            .call()
            .map_err(failed)?;
        match response.status().as_u16() {
            200 => {
                busy = 0;
                let mut reader = response.body_mut().with_config().limit(u64::MAX).reader();
                let bytes = receive(&mut reader, cancel, progress)?;
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
            status => return Err(failed(format!("The scanner answered {status}"))),
        }
    }
}

/// What has arrived of a JPEG, closed with an end marker so it shows as
/// far as it goes.
fn ended(partial: &[u8]) -> Vec<u8> {
    let mut closed = Vec::with_capacity(partial.len() + 2);
    closed.extend_from_slice(partial);
    closed.extend_from_slice(&[0xff, 0xd9]);
    closed
}

/// Reads a scanned page as it streams in, showing what's there so far.
fn receive(
    reader: &mut impl Read,
    cancel: &AtomicBool,
    progress: &mut dyn Progress,
) -> Result<Vec<u8>, ScanError> {
    let mut bytes = Vec::with_capacity(1 << 20);
    let mut chunk = vec![0; 64 * 1024];
    let mut shown = Instant::now();
    loop {
        if cancel.load(Ordering::Relaxed) {
            return Err(ScanError::Cancelled);
        }
        let read = reader.read(&mut chunk).map_err(failed)?;
        if read == 0 {
            return Ok(bytes);
        }
        bytes.extend_from_slice(&chunk[..read]);
        if shown.elapsed() >= PREVIEW_EVERY {
            progress.preview(&ended(&bytes));
            shown = Instant::now();
        }
    }
}
