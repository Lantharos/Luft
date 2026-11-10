mod discovery;
pub mod escl;
pub mod sane;

use std::net::IpAddr;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

use image::RgbImage;
use sabine::{BridgeEvent, Bytes, SabineWindow};
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::document::{self, Kind, Source};
use crate::imaging::{Mode, Origin};
use crate::{EVENTS, settings};

pub const CHANGED: BridgeEvent<Vec<Scanner>> = BridgeEvent::new("scanners.changed");
pub const PREVIEW: BridgeEvent<Bytes> = BridgeEvent::new("scan.preview");
pub const FINISHED: BridgeEvent<Option<ScanError>> = BridgeEvent::new("scan.finished");

const STANDARD_DPI: u32 = 300;
const FINE_DPI: u32 = 600;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Feed {
    Glass,
    Feeder,
    BothSides,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub enum Connection {
    Network,
    Usb,
}

#[derive(Clone, Debug, Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Scanner {
    pub id: String,
    pub name: String,
    pub connection: Connection,
    pub feeds: Vec<Feed>,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase", tag = "kind", content = "message")]
pub enum ScanError {
    Cancelled,
    Busy,
    FeederEmpty,
    Gone,
    Failed(String),
}

#[derive(Clone)]
enum Backend {
    Escl(escl::Endpoint),
    Sane(String),
}

#[derive(Clone)]
struct Entry {
    scanner: Scanner,
    backend: Backend,
    address: Option<IpAddr>,
}

static SCANNERS: Mutex<Vec<Entry>> = Mutex::new(Vec::new());
static JOB: Mutex<Option<Arc<AtomicBool>>> = Mutex::new(None);

pub fn start() {
    discovery::start();
    sane::start();
    for address in settings::current().addresses {
        std::thread::spawn(move || {
            let _ = add_address(&address);
        });
    }
}

pub fn list() -> Vec<Scanner> {
    visible(&SCANNERS.lock().expect("scanners lock"))
}

fn visible(entries: &[Entry]) -> Vec<Scanner> {
    let escl: Vec<IpAddr> = entries
        .iter()
        .filter(|entry| matches!(entry.backend, Backend::Escl(_)))
        .filter_map(|entry| entry.address)
        .collect();
    entries
        .iter()
        .filter(|entry| {
            matches!(entry.backend, Backend::Escl(_))
                || entry.address.is_none_or(|address| !escl.contains(&address))
        })
        .map(|entry| entry.scanner.clone())
        .collect()
}

fn update(change: impl FnOnce(&mut Vec<Entry>)) {
    let mut entries = SCANNERS.lock().expect("scanners lock");
    change(&mut entries);
    entries.sort_by_key(|entry| entry.scanner.name.to_lowercase());
    EVENTS.emit(CHANGED, visible(&entries));
}

fn feeds(capabilities: &escl::Capabilities) -> Vec<Feed> {
    let mut feeds = Vec::new();
    if capabilities.platen.is_some() {
        feeds.push(Feed::Glass);
    }
    if capabilities.feeder.is_some() {
        feeds.push(Feed::Feeder);
        if capabilities.both_sides {
            feeds.push(Feed::BothSides);
        }
    }
    feeds
}

fn found_escl(key: String, name: String, endpoint: escl::Endpoint, address: Option<IpAddr>) {
    let Ok(capabilities) = escl::capabilities(&endpoint) else {
        return;
    };
    let name = if name.is_empty() {
        capabilities.model.clone()
    } else {
        name
    };
    let connection = if address.is_some_and(|address| address.is_loopback()) {
        Connection::Usb
    } else {
        Connection::Network
    };
    let entry = Entry {
        scanner: Scanner {
            id: format!("escl:{key}"),
            name,
            connection,
            feeds: feeds(&capabilities),
        },
        backend: Backend::Escl(endpoint),
        address,
    };
    update(|entries| {
        entries.retain(|kept| kept.scanner.id != entry.scanner.id);
        entries.push(entry);
    });
}

fn lost(id: &str) {
    update(|entries| entries.retain(|entry| entry.scanner.id != id));
}

fn found_sane(devices: Vec<(Scanner, Option<IpAddr>)>) {
    update(|entries| {
        entries.retain(|entry| matches!(entry.backend, Backend::Escl(_)));
        entries.extend(devices.into_iter().map(|(scanner, address)| Entry {
            backend: Backend::Sane(scanner.id.trim_start_matches("sane:").to_owned()),
            scanner,
            address,
        }));
    });
}

pub fn add_address(address: &str) -> Result<(), String> {
    let address = address.trim().trim_end_matches('/');
    let (scheme, rest) = address
        .split_once("://")
        .map_or((None, address), |(scheme, rest)| (Some(scheme), rest));
    let (host_port, root) = rest.split_once('/').unwrap_or((rest, "eSCL"));
    let (host, port) = match host_port.rsplit_once(':') {
        Some((host, port)) if !host.contains(':') || host.ends_with(']') => {
            (host.trim_matches(['[', ']']), port.parse().ok())
        }
        _ => (host_port.trim_matches(['[', ']']), None),
    };
    let tries = [(false, port.unwrap_or(80)), (true, port.unwrap_or(443))];
    let endpoint = tries
        .into_iter()
        .filter(|(secure, _)| {
            scheme.is_none_or(|scheme| scheme == if *secure { "https" } else { "http" })
        })
        .map(|(secure, port)| escl::Endpoint::new(secure, host, port, root))
        .find_map(|endpoint| {
            escl::capabilities(&endpoint)
                .ok()
                .map(|capabilities| (endpoint, capabilities))
        });
    let Some((endpoint, capabilities)) = endpoint else {
        return Err(format!("No scanner answered at {address}"));
    };
    found_escl(
        format!("address:{address}"),
        capabilities.model,
        endpoint,
        host.parse().ok(),
    );
    if !settings::current()
        .addresses
        .iter()
        .any(|kept| kept == address)
    {
        settings::update(|settings| settings.addresses.push(address.to_owned()))?;
    }
    Ok(())
}

pub trait Progress {
    fn preview(&mut self, jpeg: &[u8]);
    fn page_encoded(&mut self, bytes: Vec<u8>, dpi: f32);
    fn page_pixels(&mut self, pixels: RgbImage, dpi: f32);
}

struct Delivery;

impl Delivery {
    fn add(&self, source: Source, dpi: f32) {
        if let Err(error) = document::add(source, Origin::Scanner, Some(dpi)) {
            eprintln!("flatbed: couldn't add a scanned page: {error}");
        }
    }
}

impl Progress for Delivery {
    fn preview(&mut self, jpeg: &[u8]) {
        EVENTS.emit_bytes(PREVIEW, jpeg);
    }

    fn page_encoded(&mut self, bytes: Vec<u8>, dpi: f32) {
        let kind = if bytes.starts_with(b"\x89PNG") {
            Kind::Png
        } else {
            Kind::Jpeg
        };
        self.add(Source::Encoded { bytes, kind }, dpi);
    }

    fn page_pixels(&mut self, pixels: RgbImage, dpi: f32) {
        self.add(Source::Pixels(pixels), dpi);
    }
}

pub fn scan(id: &str, feed: Feed) -> Result<(), String> {
    let backend = SCANNERS
        .lock()
        .expect("scanners lock")
        .iter()
        .find(|entry| entry.scanner.id == id)
        .map(|entry| entry.backend.clone())
        .ok_or("That scanner is gone")?;
    let cancel = Arc::new(AtomicBool::new(false));
    {
        let mut job = JOB.lock().expect("job lock");
        if job.is_some() {
            return Err("Flatbed is scanning already".into());
        }
        *job = Some(cancel.clone());
    }
    let colour = document::mode() == Mode::Colour;
    let dpi = if settings::current().fine {
        FINE_DPI
    } else {
        STANDARD_DPI
    };
    std::thread::Builder::new()
        .name("scan".into())
        .spawn(move || {
            let mut delivery = Delivery;
            let result = match backend {
                Backend::Escl(endpoint) => {
                    escl::scan(&endpoint, feed, colour, dpi, &cancel, &mut delivery)
                }
                Backend::Sane(device) => {
                    sane::scan(&device, feed, colour, dpi, &cancel, &mut delivery)
                }
            };
            JOB.lock().expect("job lock").take();
            EVENTS.emit(FINISHED, result.err());
        })
        .map(drop)
        .map_err(|error| error.to_string())
}

pub fn cancel() {
    if let Some(cancel) = JOB.lock().expect("job lock").as_ref() {
        cancel.store(true, Ordering::Relaxed);
        sane::cancel();
    }
}

pub fn declare(window: SabineWindow) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .bridge_event(&PREVIEW)
        .bridge_event(&FINISHED)
}
