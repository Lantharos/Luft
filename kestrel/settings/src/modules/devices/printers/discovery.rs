use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use futures_util::StreamExt;
use luft_cups::Cups;
use luft_cups::drivers::DeviceId;
use luft_dbus_macros::introspect;
use tokio::sync::mpsc::UnboundedSender;
use tokio::time::interval;
use zbus::{Connection, OwnedObjectPath, proxy};

use super::home::Trusted;

const SERVICE: &str = "_ipp._tcp";
const UNSPECIFIED: i32 = -1;
const DEFAULT_RESOURCE: &str = "ipp/print";
const KEEP_ALIVE: Duration = Duration::from_secs(120);
const DRIVERLESS_FORMATS: [&str; 3] = ["image/urf", "image/pwg-raster", "application/pdf"];

#[introspect]
#[proxy(
    interface = "org.freedesktop.Avahi.Server2",
    default_service = "org.freedesktop.Avahi",
    default_path = "/"
)]
trait Avahi {
    fn service_browser_prepare(
        &self,
        interface: i32,
        protocol: i32,
        kind: &str,
        domain: &str,
        flags: u32,
    ) -> zbus::Result<OwnedObjectPath>;

    #[allow(clippy::too_many_arguments)]
    fn resolve_service(
        &self,
        interface: i32,
        protocol: i32,
        name: &str,
        kind: &str,
        domain: &str,
        address_protocol: i32,
        flags: u32,
    ) -> zbus::Result<(
        i32,
        i32,
        String,
        String,
        String,
        String,
        i32,
        String,
        u16,
        Vec<Vec<u8>>,
        u32,
    )>;
}

#[introspect]
#[proxy(
    interface = "org.freedesktop.Avahi.ServiceBrowser",
    default_service = "org.freedesktop.Avahi"
)]
trait Browser {
    fn start(&self) -> zbus::Result<()>;

    #[zbus(signal)]
    fn item_new(
        &self,
        interface: i32,
        protocol: i32,
        name: String,
        kind: String,
        domain: String,
        flags: u32,
    ) -> zbus::Result<()>;

    #[zbus(signal)]
    fn item_remove(
        &self,
        interface: i32,
        protocol: i32,
        name: String,
        kind: String,
        domain: String,
        flags: u32,
    ) -> zbus::Result<()>;
}

#[derive(Clone)]
pub struct Queue {
    pub name: String,
    device: String,
    pub info: String,
    pub location: String,
}

struct Found {
    queue: Queue,
    id: DeviceId,
    seen: HashSet<(i32, i32)>,
}

#[derive(Default)]
struct Seen {
    models: Vec<DeviceId>,
    elsewhere: Vec<Queue>,
    chosen: HashSet<String>,
}

#[derive(Default)]
pub struct Discovered(Mutex<Seen>);

impl Discovered {
    fn seen(&self) -> std::sync::MutexGuard<'_, Seen> {
        self.0.lock().unwrap_or_else(|poison| poison.into_inner())
    }

    pub fn models(&self) -> Vec<DeviceId> {
        self.seen().models.clone()
    }

    pub fn elsewhere(&self) -> Vec<Queue> {
        self.seen().elsewhere.clone()
    }

    pub async fn choose(&self, cups: &Cups, name: &str) -> Option<std::io::Result<()>> {
        let queue = self
            .seen()
            .elsewhere
            .iter()
            .find(|queue| queue.name == name)?
            .clone();
        let created = queue.create(cups).await;
        if created.is_ok() {
            let mut seen = self.seen();
            seen.elsewhere.retain(|queue| queue.name != name);
            seen.chosen.insert(name.to_owned());
        }
        Some(created)
    }

    fn keeps(&self, printer: &Found, trusted: &Trusted) -> bool {
        printer
            .seen
            .iter()
            .any(|(interface, _)| trusted.reaches(*interface))
            || self.seen().chosen.contains(&printer.queue.name)
    }

    fn set(&self, found: &HashMap<String, Found>, trusted: &Trusted) {
        let elsewhere = found
            .values()
            .filter(|printer| !self.keeps(printer, trusted))
            .map(|printer| printer.queue.clone())
            .collect();
        let mut seen = self.seen();
        seen.models = found.values().map(|printer| printer.id.clone()).collect();
        seen.elsewhere = elsewhere;
    }
}

impl Queue {
    async fn create(&self, cups: &Cups) -> std::io::Result<()> {
        cups.create_local(&self.name, &self.device, &self.info, &self.location)
            .await
    }
}

fn text(record: &[Vec<u8>], key: &str) -> Option<String> {
    record.iter().find_map(|entry| {
        let entry = String::from_utf8_lossy(entry);
        let (name, value) = entry.split_once('=')?;
        name.eq_ignore_ascii_case(key).then(|| value.to_owned())
    })
}

fn driverless(record: &[Vec<u8>]) -> bool {
    text(record, "URF").is_some()
        || text(record, "pdl").is_some_and(|formats| {
            DRIVERLESS_FORMATS
                .iter()
                .any(|format| formats.contains(format))
        })
}

async fn resolve(
    avahi: &AvahiProxy<'_>,
    interface: i32,
    protocol: i32,
    name: &str,
    domain: &str,
) -> Option<Found> {
    let (_, _, _, _, _, host, _, _, port, record, _) = avahi
        .resolve_service(interface, protocol, name, SERVICE, domain, UNSPECIFIED, 0)
        .await
        .ok()?;
    if !driverless(&record) {
        return None;
    }
    let resource = text(&record, "rp").unwrap_or_else(|| DEFAULT_RESOURCE.to_owned());
    let product = text(&record, "ty").filter(|product| !product.is_empty());
    Some(Found {
        queue: Queue {
            name: name.to_owned(),
            device: format!("ipp://{}:{port}/{resource}", host.trim_end_matches('.')),
            info: product.clone().unwrap_or_else(|| name.to_owned()),
            location: text(&record, "note").unwrap_or_default(),
        },
        id: DeviceId {
            make: text(&record, "usb_MFG").unwrap_or_default(),
            model: text(&record, "usb_MDL").or(product).unwrap_or_default(),
        },
        seen: HashSet::new(),
    })
}

async fn keep(cups: &Cups, queue: &Queue) {
    if let Err(error) = queue.create(cups).await {
        eprintln!("Couldn't set up {}: {error}", queue.info);
    }
}

pub async fn run(
    system: Connection,
    cups: Arc<Cups>,
    discovered: Arc<Discovered>,
    changed: UnboundedSender<()>,
) -> zbus::Result<()> {
    let avahi = AvahiProxy::new(&system).await?;
    let path = avahi
        .service_browser_prepare(UNSPECIFIED, UNSPECIFIED, SERVICE, "", 0)
        .await?;
    let browser = BrowserProxy::builder(&system).path(path).build().await?;
    let mut added = browser.receive_item_new().await?;
    let mut removed = browser.receive_item_remove().await?;
    browser.start().await?;
    let mut found: HashMap<String, Found> = HashMap::new();
    let mut keep_alive = interval(KEEP_ALIVE);
    loop {
        tokio::select! {
            _ = keep_alive.tick() => {
                if found.is_empty() {
                    continue;
                }
                let trusted = Trusted::read(&system).await;
                for printer in found.values().filter(|printer| discovered.keeps(printer, &trusted)) {
                    keep(&cups, &printer.queue).await;
                }
                discovered.set(&found, &trusted);
                let _ = changed.send(());
            }
            Some(item) = added.next() => {
                let Ok(item) = item.args() else { continue };
                let instance = (item.interface, item.protocol);
                if let Some(printer) = found.get_mut(&item.name) {
                    printer.seen.insert(instance);
                } else if let Some(mut printer) = resolve(&avahi, item.interface, item.protocol, &item.name, &item.domain).await {
                    printer.seen.insert(instance);
                    found.insert(item.name.clone(), printer);
                } else {
                    continue;
                }
                let trusted = Trusted::read(&system).await;
                let printer = &found[&item.name];
                if discovered.keeps(printer, &trusted) {
                    keep(&cups, &printer.queue).await;
                }
                discovered.set(&found, &trusted);
                let _ = changed.send(());
            }
            Some(item) = removed.next() => {
                let Ok(item) = item.args() else { continue };
                let Some(printer) = found.get_mut(&item.name) else { continue };
                printer.seen.remove(&(item.interface, item.protocol));
                if printer.seen.is_empty() {
                    found.remove(&item.name);
                }
                discovered.set(&found, &Trusted::read(&system).await);
                let _ = changed.send(());
            }
        }
    }
}
