mod discovery;
pub mod escl;
mod known;
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
const ADDRESS: &str = "address:";

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
    pub identity_changed: bool,
}

#[derive(Clone, Debug, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase", tag = "kind", content = "message")]
pub enum ScanError {
    Cancelled,
    Busy,
    FeederEmpty,
    Gone,
    IdentityChanged,
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

impl Entry {
    fn escl(&self) -> Option<&escl::Endpoint> {
        match &self.backend {
            Backend::Escl(endpoint) => Some(endpoint),
            Backend::Sane(_) => None,
        }
    }

    fn at(&self, address: IpAddr) -> bool {
        self.address == Some(address)
    }

    fn same_scanner(&self, other: &Entry) -> bool {
        let instance = discovery::instance(&self.scanner.id);
        let named_alike = instance.is_some_and(|instance| {
            discovery::instance(&other.scanner.id)
                .is_some_and(|other| other.eq_ignore_ascii_case(instance))
        });
        let at_same_address = self
            .address
            .is_some_and(|address| !address.is_loopback() && other.at(address));
        named_alike || at_same_address
    }
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
    let escl: Vec<&Entry> = entries
        .iter()
        .filter(|entry| entry.escl().is_some())
        .collect();
    let secure: Vec<&Entry> = escl
        .iter()
        .copied()
        .filter(|entry| entry.escl().is_some_and(escl::Endpoint::secure))
        .collect();
    entries
        .iter()
        .filter(|entry| match entry.escl() {
            Some(endpoint) => {
                endpoint.secure() || !secure.iter().any(|other| other.same_scanner(entry))
            }
            None => entry
                .address
                .is_none_or(|address| !escl.iter().any(|other| other.at(address))),
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
    let id = format!("escl:{key}");
    let pin = known::pin(&id);
    let capabilities = escl::capabilities(&endpoint, &pin);
    if capabilities.is_err() && !pin.changed() {
        return;
    }
    known::remember(&id, &pin);
    show_escl(id, name, endpoint, address, capabilities.ok());
}

fn show_escl(
    id: String,
    name: String,
    endpoint: escl::Endpoint,
    address: Option<IpAddr>,
    capabilities: Option<escl::Capabilities>,
) {
    let name = match &capabilities {
        Some(capabilities) if name.is_empty() => capabilities.model.clone(),
        None if name.is_empty() => id
            .trim_start_matches("escl:")
            .trim_start_matches(ADDRESS)
            .to_owned(),
        _ => name,
    };
    let connection = if address.is_some_and(|address| address.is_loopback()) {
        Connection::Usb
    } else {
        Connection::Network
    };
    let entry = Entry {
        scanner: Scanner {
            id,
            name,
            connection,
            feeds: capabilities.as_ref().map(feeds).unwrap_or_default(),
            identity_changed: capabilities.is_none(),
        },
        backend: Backend::Escl(endpoint),
        address,
    };
    update(|entries| {
        entries.retain(|kept| kept.scanner.id != entry.scanner.id);
        entries.push(entry);
    });
}

/// Takes the certificate a scanner shows now for its own, after someone
/// looked at the warning and chose to.
pub fn trust(id: &str) -> Result<(), String> {
    let entry = SCANNERS
        .lock()
        .expect("scanners lock")
        .iter()
        .find(|entry| entry.scanner.id == id)
        .cloned()
        .ok_or("That scanner is gone")?;
    let Backend::Escl(endpoint) = entry.backend else {
        return Ok(());
    };
    let pin = escl::Pin::default();
    let capabilities =
        escl::capabilities(&endpoint, &pin).map_err(|_| "The scanner didn't answer")?;
    known::forget(id);
    known::remember(id, &pin);
    let advertised = if id.trim_start_matches("escl:").starts_with(ADDRESS) {
        String::new()
    } else {
        entry.scanner.name
    };
    show_escl(
        id.to_owned(),
        advertised,
        endpoint,
        entry.address,
        Some(capabilities),
    );
    Ok(())
}

fn identity_changed(id: &str) {
    update(|entries| {
        for entry in entries.iter_mut().filter(|entry| entry.scanner.id == id) {
            entry.scanner.identity_changed = true;
        }
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
    let key = format!("{ADDRESS}{address}");
    let id = format!("escl:{key}");
    let tries = [(true, port.unwrap_or(443)), (false, port.unwrap_or(80))];
    let endpoint = tries
        .into_iter()
        .filter(|(secure, _)| {
            scheme.is_none_or(|scheme| scheme == if *secure { "https" } else { "http" })
        })
        .map(|(secure, port)| escl::Endpoint::new(secure, host, port, root))
        .find(|endpoint| {
            let pin = known::pin(&id);
            escl::capabilities(endpoint, &pin).is_ok() || pin.changed()
        });
    let Some(endpoint) = endpoint else {
        return Err(format!("No scanner answered at {address}"));
    };
    found_escl(key, String::new(), endpoint, host.parse().ok());
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
    let id = id.to_owned();
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
                    let pin = known::pin(&id);
                    escl::scan(&endpoint, &pin, feed, colour, dpi, &cancel, &mut delivery).map_err(
                        |error| {
                            if pin.changed() {
                                identity_changed(&id);
                                ScanError::IdentityChanged
                            } else {
                                error
                            }
                        },
                    )
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
