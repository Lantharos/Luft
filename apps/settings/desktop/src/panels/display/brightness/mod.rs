mod ddc;
mod ddcutil;
mod panel;

use std::collections::BTreeMap;
use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex};

use luft_app::Events;
use serde::{Deserialize, Serialize};
use zbus::blocking::Proxy;

use super::state;
use ddc::{Request, Worker};
use ddcutil::Availability;
use panel::Panels;

const BRIGHTNESS_CHANGED: &str = "display.brightness";

#[derive(Serialize, Clone)]
#[serde(tag = "state", rename_all = "kebab-case")]
pub enum Control {
    Ready { level: f64 },
    Unresponsive,
    Unsupported,
}

#[derive(Default)]
pub struct Shared {
    panels: Panels,
    external: BTreeMap<String, Control>,
    availability: Availability,
}

#[derive(Serialize)]
pub struct Brightness {
    displays: BTreeMap<String, Control>,
    external: Availability,
}

#[derive(Deserialize)]
pub struct Change {
    connector: String,
    level: f64,
}

impl Shared {
    fn snapshot(&self) -> Brightness {
        let mut displays = self.external.clone();
        displays.extend(
            self.panels
                .levels()
                .map(|(connector, level)| (connector.clone(), Control::Ready { level })),
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

static SERVICE: Mutex<Option<Arc<Service>>> = Mutex::new(None);

impl Service {
    fn start(events: Events) -> Result<Self, String> {
        let proxy = state::proxy()?;
        let publisher = Publisher {
            shared: Arc::new(Mutex::new(Shared {
                panels: panel::read(&proxy),
                ..Shared::default()
            })),
            events,
        };
        let (ddc, requests) = mpsc::channel();
        let worker = Worker::new(publisher.clone());
        std::thread::Builder::new()
            .name("ddc".into())
            .spawn(move || worker.run(requests))
            .map_err(|error| error.to_string())?;
        let watcher = publisher.clone();
        let watched = proxy.clone();
        std::thread::Builder::new()
            .name("backlight".into())
            .spawn(move || {
                panel::watch(&watched, |panels| {
                    watcher.update(|shared| shared.panels = panels)
                })
            })
            .map_err(|error| error.to_string())?;
        Ok(Self {
            publisher,
            proxy,
            ddc,
        })
    }
}

fn service(events: &Events) -> Result<Arc<Service>, String> {
    let mut slot = SERVICE.lock().map_err(|error| error.to_string())?;
    if let Some(service) = slot.as_ref() {
        return Ok(Arc::clone(service));
    }
    let service = Arc::new(Service::start(events.clone())?);
    *slot = Some(Arc::clone(&service));
    Ok(service)
}

pub fn current(events: &Events) -> Result<Brightness, String> {
    let service = service(events)?;
    let _ = service.ddc.send(Request::Detect);
    let shared = service
        .publisher
        .shared
        .lock()
        .map_err(|error| error.to_string())?;
    Ok(shared.snapshot())
}

pub fn set(events: &Events, Change { connector, level }: Change) -> Result<(), String> {
    let service = service(events)?;
    let target = service
        .publisher
        .shared
        .lock()
        .map_err(|error| error.to_string())?
        .panels
        .target(&connector, level);
    if let Some(target) = target {
        return panel::set(&service.proxy, &connector, target);
    }
    service
        .ddc
        .send(Request::Set(connector, level))
        .map_err(|error| error.to_string())
}

pub fn monitors_changed() {
    if let Ok(slot) = SERVICE.lock()
        && let Some(service) = slot.as_ref()
    {
        let _ = service.ddc.send(Request::Detect);
    }
}
