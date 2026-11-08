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

struct Found {
    queue: String,
    device: String,
    info: String,
    location: String,
    id: DeviceId,
    seen: HashSet<(i32, i32)>,
}

#[derive(Default)]
pub struct Discovered(Mutex<Vec<DeviceId>>);

impl Discovered {
    pub fn models(&self) -> Vec<DeviceId> {
        self.0
            .lock()
            .unwrap_or_else(|poison| poison.into_inner())
            .clone()
    }

    fn set(&self, found: &HashMap<String, Found>) {
        *self.0.lock().unwrap_or_else(|poison| poison.into_inner()) =
            found.values().map(|printer| printer.id.clone()).collect();
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
        queue: name.to_owned(),
        device: format!("ipp://{}:{port}/{resource}", host.trim_end_matches('.')),
        id: DeviceId {
            make: text(&record, "usb_MFG").unwrap_or_default(),
            model: text(&record, "usb_MDL")
                .or_else(|| product.clone())
                .unwrap_or_default(),
        },
        info: product.unwrap_or_else(|| name.to_owned()),
        location: text(&record, "note").unwrap_or_default(),
        seen: HashSet::new(),
    })
}

async fn keep(cups: &Cups, printer: &Found) {
    if let Err(error) = cups
        .create_local(
            &printer.queue,
            &printer.device,
            &printer.info,
            &printer.location,
        )
        .await
    {
        eprintln!("Couldn't set up {}: {error}", printer.info);
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
                for printer in found.values() {
                    keep(&cups, printer).await;
                }
            }
            Some(item) = added.next() => {
                let Ok(item) = item.args() else { continue };
                let instance = (item.interface, item.protocol);
                if let Some(printer) = found.get_mut(&item.name) {
                    printer.seen.insert(instance);
                    continue;
                }
                let Some(mut printer) = resolve(&avahi, item.interface, item.protocol, &item.name, &item.domain).await else {
                    continue;
                };
                printer.seen.insert(instance);
                keep(&cups, &printer).await;
                found.insert(item.name.clone(), printer);
                discovered.set(&found);
                let _ = changed.send(());
            }
            Some(item) = removed.next() => {
                let Ok(item) = item.args() else { continue };
                let Some(printer) = found.get_mut(&item.name) else { continue };
                printer.seen.remove(&(item.interface, item.protocol));
                if printer.seen.is_empty() {
                    found.remove(&item.name);
                    discovered.set(&found);
                    let _ = changed.send(());
                }
            }
        }
    }
}
