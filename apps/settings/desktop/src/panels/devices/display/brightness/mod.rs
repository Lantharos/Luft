use sabine::BridgeEvent;
mod ddc;
mod ddcutil;
mod panel;

use std::collections::BTreeMap;
use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex};

use luft_app::Events;
use serde::{Deserialize, Serialize};
use tokio::sync::OnceCell;
use zbus::Proxy;

use super::state;
use ddc::{Request, Worker};
use ddcutil::ExternalBrightness;
use panel::Panels;
use specta::Type;

pub const BRIGHTNESS_CHANGED: BridgeEvent<Brightness> = BridgeEvent::new("display.brightness");

#[derive(Serialize, Clone, Type)]
#[serde(tag = "state", rename_all = "kebab-case")]
pub enum BrightnessControl {
    Ready { level: f64 },
    Unresponsive,
    Unsupported,
}

#[derive(Default)]
pub struct Shared {
    panels: Panels,
    external: BTreeMap<String, BrightnessControl>,
    availability: ExternalBrightness,
}

#[derive(Serialize, Type)]
pub struct Brightness {
    displays: BTreeMap<String, BrightnessControl>,
    external: ExternalBrightness,
}

#[derive(Deserialize, Type)]
pub struct BrightnessChange {
    connector: String,
    level: f64,
}

impl Shared {
    fn snapshot(&self) -> Brightness {
        let mut displays = self.external.clone();
        displays.extend(
            self.panels
                .levels()
                .map(|(connector, level)| (connector.clone(), BrightnessControl::Ready { level })),
        );
        Brightness {
            displays,
            external: self.availability,
        }
    }
}

#[derive(Clone)]
pub struct Publisher {
    shared: Arc<Mutex<Shared>>,
    events: Events,
}

impl Publisher {
    fn update(&self, change: impl FnOnce(&mut Shared)) {
        let Ok(mut shared) = self.shared.lock() else {
            return;
        };
        change(&mut shared);
        self.events.emit(BRIGHTNESS_CHANGED, shared.snapshot());
    }
}

struct Service {
    publisher: Publisher,
    proxy: Proxy<'static>,
    ddc: Sender<Request>,
}

static SERVICE: OnceCell<Service> = OnceCell::const_new();

impl Service {
    async fn start(events: Events) -> Result<Self, String> {
        let proxy = state::proxy().await?;
        let publisher = Publisher {
            shared: Arc::new(Mutex::new(Shared {
                panels: panel::read(&proxy).await,
                ..Shared::default()
            })),
            events,
        };
        let (ddc, requests) = mpsc::channel();
        let worker = Worker::new(publisher.clone(), proxy.clone());
        std::thread::Builder::new()
            .name("ddc".into())
            .spawn(move || worker.run(requests))
            .map_err(|error| error.to_string())?;
        let watcher = publisher.clone();
        luft_app::spawn(panel::watch(proxy.clone(), move |panels| {
            watcher.update(|shared| shared.panels = panels)
        }));
        Ok(Self {
            publisher,
            proxy,
            ddc,
        })
    }
}

async fn service(events: Events) -> Result<&'static Service, String> {
    SERVICE.get_or_try_init(|| Service::start(events)).await
}

pub async fn current(events: Events) -> Result<Brightness, String> {
    let service = service(events).await?;
    let _ = service.ddc.send(Request::Detect);
    let shared = service
        .publisher
        .shared
        .lock()
        .map_err(|error| error.to_string())?;
    Ok(shared.snapshot())
}

pub async fn set(
    events: Events,
    BrightnessChange { connector, level }: BrightnessChange,
) -> Result<(), String> {
    let service = service(events).await?;
    let target = service
        .publisher
        .shared
        .lock()
        .map_err(|error| error.to_string())?
        .panels
        .target(&connector, level);
    if let Some(target) = target {
        return panel::set(&service.proxy, &connector, target).await;
    }
    service
        .ddc
        .send(Request::Set(connector, level))
        .map_err(|error| error.to_string())
}

pub fn monitors_changed() {
    if let Some(service) = SERVICE.get() {
        let _ = service.ddc.send(Request::Detect);
    }
}
