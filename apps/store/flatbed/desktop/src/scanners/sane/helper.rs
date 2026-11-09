//! The SANE helper: a process of Flatbed's own that loads the system's SANE
//! drivers, so a driver that crashes or hangs takes nothing else with it.

use std::io::{self, BufRead, BufWriter, Write};
use std::net::{IpAddr, Ipv4Addr};
use std::sync::Mutex;
use std::sync::mpsc;

use super::ffi::{self, Canceller, Opened, Sane, Setting};
use super::wire::{self, FoundDevice, Reply, Request};
use crate::scanners::{Feed, ScanError};

const READ_SIZE: usize = 256 * 1024;

const DRIVERLESS: &str = "airscan:";

/// Backends Flatbed reaches itself, without SANE.
const REACHED_DIRECTLY: [&str; 2] = ["airscan:e", "escl:"];

static SCANNING: Mutex<Option<Canceller>> = Mutex::new(None);

pub fn run() -> ! {
    let (requests, incoming) = mpsc::channel();
    std::thread::spawn(move || {
        for line in io::stdin().lock().lines().map_while(Result::ok) {
            match serde_json::from_str::<Request>(&line) {
                Ok(Request::Cancel) => {
                    if let Some(canceller) = *SCANNING.lock().expect("scanning lock") {
                        canceller.cancel();
                    }
                }
                Ok(request) => {
                    if requests.send(request).is_err() {
                        break;
                    }
                }
                Err(error) => eprintln!("flatbed-sane: {error}"),
            }
        }
    });
    let mut out = BufWriter::new(io::stdout().lock());
    let sane = match Sane::load() {
        Ok(sane) => sane,
        Err(error) => {
            let _ = wire::send_reply(&mut out, &Reply::Failed(ScanError::Failed(error)));
            std::process::exit(1);
        }
    };
    for request in incoming {
        let result = match request {
            Request::List => wire::send_reply(&mut out, &Reply::Devices(devices(&sane))),
            Request::Scan {
                device,
                feed,
                colour,
                dpi,
            } => {
                let reply = match scan(&sane, &device, feed, colour, dpi, &mut out) {
                    Ok(()) => Reply::Done,
                    Err(error) => Reply::Failed(error),
                };
                wire::send_reply(&mut out, &reply)
            }
            Request::Cancel => Ok(()),
        };
        if result.is_err() {
            break;
        }
    }
    std::process::exit(0)
}

/// Every device SANE finds, leaving out what its driverless backend found
/// again of a scanner another driver has at the same address.
fn devices(sane: &Sane) -> Vec<FoundDevice> {
    let found = every_device(sane);
    let native: Vec<IpAddr> = found
        .iter()
        .filter(|device| !device.name.starts_with(DRIVERLESS))
        .filter_map(|device| device.address)
        .collect();
    found
        .into_iter()
        .filter(|device| {
            !device.name.starts_with(DRIVERLESS)
                || device
                    .address
                    .is_none_or(|address| !native.contains(&address))
        })
        .collect()
}

fn every_device(sane: &Sane) -> Vec<FoundDevice> {
    sane.devices()
        .unwrap_or_default()
        .into_iter()
        .filter(|device| {
            !REACHED_DIRECTLY
                .iter()
                .any(|prefix| device.name.starts_with(prefix))
        })
        .map(|device| {
            let feeds = sane
                .open(&device.name)
                .map(|opened| feeds(&opened.settings()))
                .unwrap_or_else(|_| vec![Feed::Glass]);
            let address = [&device.name, &device.model, &device.kind]
                .into_iter()
                .find_map(|text| address(text));
            FoundDevice {
                title: title(&device.vendor, &device.model),
                address,
                name: device.name,
                feeds,
            }
        })
        .collect()
}

/// What SANE's driverless backend puts where the maker would go.
const PROTOCOLS: [&str; 2] = ["WSD", "eSCL"];

fn title(vendor: &str, model: &str) -> String {
    if model.to_lowercase().starts_with(&vendor.to_lowercase())
        || vendor.is_empty()
        || PROTOCOLS.contains(&vendor)
    {
        return model.to_owned();
    }
    let vendor = if vendor.len() > 3 && vendor.chars().all(|letter| !letter.is_lowercase()) {
        let lower = vendor.to_lowercase();
        let mut letters = lower.chars();
        letters
            .next()
            .map(|first| first.to_uppercase().chain(letters).collect())
            .unwrap_or(lower)
    } else {
        vendor.to_owned()
    };
    format!("{vendor} {model}")
}

/// The IPv4 address in a device's name, such as `pixma:MX490_192.168.1.103`.
fn address(text: &str) -> Option<IpAddr> {
    text.split(|letter: char| !letter.is_ascii_digit() && letter != '.')
        .find_map(|part| part.parse::<Ipv4Addr>().ok())
        .map(IpAddr::V4)
}

fn feed_of(source: &str) -> Feed {
    let source = source.to_lowercase();
    if source.contains("duplex") {
        Feed::BothSides
    } else if ["adf", "feeder", "automatic document"]
        .iter()
        .any(|word| source.contains(word))
    {
        Feed::Feeder
    } else {
        Feed::Glass
    }
}

fn feeds(settings: &[Setting]) -> Vec<Feed> {
    let mut feeds: Vec<Feed> = settings
        .iter()
        .find(|setting| setting.name == "source")
        .map(|source| source.strings.iter().map(|name| feed_of(name)).collect())
        .unwrap_or_default();
    feeds.sort_by_key(|feed| *feed as u8);
    feeds.dedup();
    if feeds.is_empty() {
        feeds.push(Feed::Glass);
    }
    feeds
}

fn find<'a>(settings: &'a [Setting], name: &str) -> Option<&'a Setting> {
    settings.iter().find(|setting| setting.name == name)
}

/// Sets up the scanner: the source first, since changing it resets the
/// rest, then the mode, the resolution and the largest area.
fn prepare(opened: &Opened, feed: Feed, colour: bool, dpi: u32) -> Result<f32, String> {
    if let Some(source) = find(&opened.settings(), "source")
        && let Some(name) = source.strings.iter().find(|name| feed_of(name) == feed)
    {
        opened.set_string(source, name)?;
    }
    if let Some(mode) = find(&opened.settings(), "mode") {
        let wanted: &[&str] = if colour {
            &["Color", "Colour", "Gray"]
        } else {
            &["Gray", "Grey", "Color"]
        };
        if let Some(name) = wanted.iter().find_map(|wanted| {
            mode.strings
                .iter()
                .find(|name| name.eq_ignore_ascii_case(wanted))
        }) {
            opened.set_string(mode, name)?;
        }
    }
    let mut used = dpi as f32;
    if let Some(resolution) = find(&opened.settings(), "resolution") {
        let fixed = resolution.value_type == ffi::TYPE_FIXED;
        let to_dpi = |word: ffi::Word| {
            if fixed {
                word as f32 / 65536.0
            } else {
                word as f32
            }
        };
        let wanted = if fixed {
            (dpi as ffi::Word) << 16
        } else {
            dpi as ffi::Word
        };
        let offered: Vec<ffi::Word> = match resolution.range {
            Some((min, max)) => vec![wanted.clamp(min, max)],
            None => resolution.words.clone(),
        };
        if let Some(closest) = offered.into_iter().min_by(|a, b| {
            (to_dpi(*a) - dpi as f32)
                .abs()
                .total_cmp(&(to_dpi(*b) - dpi as f32).abs())
        }) {
            opened.set_word(resolution, closest)?;
            used = to_dpi(closest);
        }
    }
    let settings = opened.settings();
    for corner in ["br-x", "br-y"] {
        if let Some(setting) = find(&settings, corner)
            && let Some((_, max)) = setting.range
            && setting.value_type != ffi::TYPE_STRING
        {
            let _ = opened.set_word(setting, max);
        }
    }
    Ok(used)
}

fn scan(
    sane: &Sane,
    device: &str,
    feed: Feed,
    colour: bool,
    dpi: u32,
    out: &mut impl Write,
) -> Result<(), ScanError> {
    let failed = |error: String| ScanError::Failed(error);
    let opened = sane.open(device).map_err(|_| ScanError::Gone)?;
    let dpi = prepare(&opened, feed, colour, dpi).map_err(failed)?;
    *SCANNING.lock().expect("scanning lock") = Some(opened.canceller());
    let result = pages(&opened, feed, dpi, out);
    SCANNING.lock().expect("scanning lock").take();
    opened.cancel();
    result
}

fn pages(opened: &Opened, feed: Feed, dpi: f32, out: &mut impl Write) -> Result<(), ScanError> {
    let mut buffer = vec![0; READ_SIZE];
    let mut scanned = 0;
    loop {
        match opened.start() {
            ffi::STATUS_GOOD => {}
            ffi::STATUS_NO_DOCS if scanned > 0 => return Ok(()),
            ffi::STATUS_NO_DOCS => return Err(ScanError::FeederEmpty),
            status => return Err(problem(opened, status)),
        }
        let parameters = opened.parameters().map_err(ScanError::Failed)?;
        if parameters.format != ffi::FRAME_GRAY && parameters.format != ffi::FRAME_RGB {
            return Err(ScanError::Failed(
                "The scanner sends colours one at a time, which Flatbed can't put together".into(),
            ));
        }
        let page = Reply::Page {
            width: parameters.pixels_per_line as u32,
            lines: parameters.lines,
            bytes_per_line: parameters.bytes_per_line as u32,
            depth: parameters.depth as u32,
            colour: parameters.format == ffi::FRAME_RGB,
            dpi,
        };
        wire::send_reply(out, &page).map_err(|error| ScanError::Failed(error.to_string()))?;
        loop {
            match opened.read(&mut buffer) {
                Ok(read) => wire::send(out, wire::PIXELS, &buffer[..read])
                    .map_err(|error| ScanError::Failed(error.to_string()))?,
                Err(ffi::STATUS_EOF) => break,
                Err(status) => return Err(problem(opened, status)),
            }
        }
        wire::send_reply(out, &Reply::PageDone)
            .map_err(|error| ScanError::Failed(error.to_string()))?;
        scanned += 1;
        if feed == Feed::Glass {
            return Ok(());
        }
    }
}

fn problem(opened: &Opened, status: ffi::Word) -> ScanError {
    match status {
        ffi::STATUS_CANCELLED => ScanError::Cancelled,
        ffi::STATUS_DEVICE_BUSY => ScanError::Busy,
        ffi::STATUS_NO_DOCS => ScanError::FeederEmpty,
        _ => ScanError::Failed(opened.status_text(status)),
    }
}
