mod sampler;

use std::collections::VecDeque;
use std::path::PathBuf;
use std::sync::Arc;
use std::thread;
use std::time::Duration;

use luft_app::Events;
use parking_lot::{Condvar, Mutex};
use serde::{Deserialize, Serialize};

use crate::system::{Devices, System, Tick};
use crate::tasks::apps::Scopes;
use crate::tasks::control::{self, Signal};

const DEFAULT_INTERVAL: Duration = Duration::from_secs(1);
const DEFAULT_HISTORY: Duration = Duration::from_secs(60);
const SHORTEST_INTERVAL: u64 = 100;

#[derive(Clone)]
struct Control {
    visible: bool,
    page: String,
    expanded: Vec<String>,
    disk: bool,
    gpu: bool,
    interval: Duration,
    history: Duration,
    changed: bool,
    entering: bool,
    reset: bool,
}

struct Shared {
    control: Mutex<Control>,
    scopes: Mutex<Scopes>,
    wake: Condvar,
    history: Mutex<VecDeque<Tick>>,
    devices: Mutex<Option<Devices>>,
    ready: Condvar,
}

#[derive(Clone)]
pub struct Monitor(Arc<Shared>);

#[derive(Deserialize)]
pub struct View {
    page: String,
    visible: bool,
    reset: bool,
    expanded: Vec<String>,
    disk: bool,
    gpu: bool,
}

#[derive(Deserialize)]
pub struct AppSignal {
    key: String,
    signal: Signal,
}

#[derive(Deserialize)]
pub struct Configuration {
    interval: u64,
    history: u64,
}

#[derive(Deserialize)]
pub struct SnapshotRequest {
    after: u64,
}

#[derive(Serialize)]
pub struct Snapshot {
    devices: Devices,
    ticks: Vec<Tick>,
}

impl Monitor {
    pub fn new() -> Self {
        Self(Arc::new(Shared {
            control: Mutex::new(Control {
                visible: false,
                page: String::new(),
                expanded: Vec::new(),
                disk: true,
                gpu: true,
                interval: DEFAULT_INTERVAL,
                history: DEFAULT_HISTORY,
                changed: false,
                entering: false,
                reset: true,
            }),
            scopes: Mutex::new(Scopes::new()),
            wake: Condvar::new(),
            history: Mutex::new(VecDeque::new()),
            devices: Mutex::new(None),
            ready: Condvar::new(),
        }))
    }

    pub fn start(&self, events: Events) -> std::io::Result<()> {
        let system = System::new()?;
        *self.0.devices.lock() = Some(system.devices());
        self.0.ready.notify_all();
        let shared = Arc::clone(&self.0);
        thread::Builder::new()
            .name("barometer-sampler".into())
            .spawn(move || sampler::run(&shared, &events, system))?;
        Ok(())
    }

    pub fn view(&self, view: View) -> Result<(), String> {
        let mut control = self.0.control.lock();
        control.entering |= view.visible
            && (!control.visible || control.page != view.page || control.expanded != view.expanded);
        control.reset |= view.reset;
        control.visible = view.visible;
        control.page = view.page;
        control.expanded = view.expanded;
        control.disk = view.disk;
        control.gpu = view.gpu;
        control.changed = true;
        self.0.wake.notify_one();
        Ok(())
    }

    pub fn signal_app(&self, AppSignal { key, signal }: AppSignal) -> Result<(), String> {
        let paths: Vec<PathBuf> = {
            let mut scopes = self.0.scopes.lock();
            let names: Vec<String> = scopes
                .names()
                .into_iter()
                .filter(|name| scopes.app_of(name).as_deref() == Some(key.as_str()))
                .collect();
            names.iter().map(|name| scopes.path(name)).collect()
        };
        control::signal_scopes(&paths, signal)
    }

    pub fn configure(
        &self,
        Configuration { interval, history }: Configuration,
    ) -> Result<(), String> {
        let mut control = self.0.control.lock();
        control.interval = Duration::from_millis(interval.max(SHORTEST_INTERVAL));
        control.history = Duration::from_secs(history);
        control.changed = true;
        self.0.wake.notify_one();
        Ok(())
    }

    pub fn snapshot(&self, SnapshotRequest { after }: SnapshotRequest) -> Result<Snapshot, String> {
        let ticks = self
            .0
            .history
            .lock()
            .iter()
            .filter(|tick| tick.time > after)
            .cloned()
            .collect();
        let mut ready = self.0.devices.lock();
        let devices = loop {
            if let Some(devices) = ready.as_ref() {
                break devices.clone();
            }
            self.0.ready.wait(&mut ready);
        };
        Ok(Snapshot { devices, ticks })
    }
}
