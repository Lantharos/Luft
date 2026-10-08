use std::collections::BTreeMap;
use std::sync::mpsc::{Receiver, RecvTimeoutError};
use std::time::{Duration, Instant};

use super::super::state::{self, MonitorSpec};
use super::ddcutil::{self, Availability, Found};
use super::{Control, Publisher};

const SETTLE: Duration = Duration::from_millis(150);
const QUICK_RETRY: Duration = Duration::from_secs(1);
const ALLOWED_FAILURES: u32 = 3;
const FIRST_BACKOFF: Duration = Duration::from_secs(10);
const LONGEST_BACKOFF: Duration = Duration::from_secs(300);

pub enum Request {
    Detect,
    Set(String, f64),
}

struct Bus {
    number: u32,
    max: u16,
    failures: u32,
    retry_at: Option<Instant>,
}

impl Bus {
    fn new(number: u32) -> Self {
        Self {
            number,
            max: 100,
            failures: 0,
            retry_at: None,
        }
    }

    fn backing_off(&self) -> bool {
        self.failures >= ALLOWED_FAILURES && self.retry_at.is_some_and(|at| at > Instant::now())
    }

    fn succeeded(&mut self) {
        self.failures = 0;
        self.retry_at = None;
    }

    fn failed(&mut self) {
        self.failures += 1;
        let delay = match self.failures.checked_sub(ALLOWED_FAILURES) {
            None => QUICK_RETRY,
            Some(extra) => FIRST_BACKOFF
                .saturating_mul(1 << extra.min(8))
                .min(LONGEST_BACKOFF),
        };
        self.retry_at = Some(Instant::now() + delay);
    }

    fn read(&mut self) -> Control {
        if self.backing_off() {
            return Control::Unresponsive;
        }
        match ddcutil::brightness(self.number) {
            Ok((current, max)) => {
                self.succeeded();
                self.max = max;
                Control::Ready {
                    level: f64::from(current) / f64::from(max),
                }
            }
            Err(_) => {
                self.failed();
                Control::Unresponsive
            }
        }
    }
}

fn connector_of(display: &Found, monitors: &[MonitorSpec]) -> Option<String> {
    let known = |connector: &str| monitors.iter().any(|monitor| monitor.0 == connector);
    display
        .connector
        .clone()
        .filter(|connector| known(connector))
        .or_else(|| {
            let (vendor, product, serial) = display.monitor.as_ref()?;
            monitors
                .iter()
                .find(|monitor| (&monitor.1, &monitor.2, &monitor.3) == (vendor, product, serial))
                .map(|monitor| monitor.0.clone())
        })
}

pub struct Worker {
    buses: BTreeMap<String, Bus>,
    controls: BTreeMap<String, Control>,
    publisher: Publisher,
}

impl Worker {
    pub fn new(publisher: Publisher) -> Self {
        Self {
            buses: BTreeMap::new(),
            controls: BTreeMap::new(),
            publisher,
        }
    }

    pub fn run(mut self, requests: Receiver<Request>) {
        loop {
            let next_retry = self.buses.values().filter_map(|bus| bus.retry_at).min();
            let request = match next_retry {
                Some(at) => {
                    match requests.recv_timeout(at.saturating_duration_since(Instant::now())) {
                        Ok(request) => Some(request),
                        Err(RecvTimeoutError::Timeout) => None,
                        Err(RecvTimeoutError::Disconnected) => return,
                    }
                }
                None => match requests.recv() {
                    Ok(request) => Some(request),
                    Err(_) => return,
                },
            };
            match request {
                None => self.retry(),
                Some(Request::Detect) => self.detect(),
                Some(Request::Set(connector, level)) => self.settle(&requests, connector, level),
            }
        }
    }

    fn publish(&self, availability: Availability) {
        let controls = self.controls.clone();
        self.publisher.update(move |shared| {
            shared.availability = availability;
            shared.external = controls;
        });
    }

    fn detect(&mut self) {
        let availability = ddcutil::availability();
        if availability != Availability::Ready {
            self.buses.clear();
            self.controls.clear();
            return self.publish(availability);
        }
        let monitors: Vec<MonitorSpec> = state::proxy()
            .and_then(|proxy| state::read(&proxy))
            .map(|(_, monitors, ..)| monitors.into_iter().map(|(spec, ..)| spec).collect())
            .unwrap_or_default();
        let mut buses = BTreeMap::new();
        let mut controls = BTreeMap::new();
        for display in ddcutil::detect().unwrap_or_default() {
            let Some(connector) = connector_of(&display, &monitors) else {
                continue;
            };
            if !display.usable {
                controls.insert(connector, Control::Unsupported);
                continue;
            }
            let mut bus = self
                .buses
                .remove(&connector)
                .filter(|bus| bus.number == display.bus)
                .unwrap_or_else(|| Bus::new(display.bus));
            controls.insert(connector.clone(), bus.read());
            buses.insert(connector, bus);
        }
        self.buses = buses;
        self.controls = controls;
        self.publish(Availability::Ready);
    }

    fn retry(&mut self) {
        let now = Instant::now();
        for (connector, bus) in &mut self.buses {
            if bus.retry_at.is_some_and(|at| at <= now) {
                bus.retry_at = None;
                self.controls.insert(connector.clone(), bus.read());
            }
        }
        self.publish(Availability::Ready);
    }

    fn settle(&mut self, requests: &Receiver<Request>, connector: String, level: f64) {
        let mut pending = BTreeMap::from([(connector, level)]);
        let mut detect = false;
        let deadline = Instant::now() + SETTLE;
        while let Ok(request) =
            requests.recv_timeout(deadline.saturating_duration_since(Instant::now()))
        {
            match request {
                Request::Set(connector, level) => drop(pending.insert(connector, level)),
                Request::Detect => detect = true,
            }
        }
        for (connector, level) in pending {
            self.apply(connector, level);
        }
        if detect {
            self.detect();
        } else {
            self.publish(Availability::Ready);
        }
    }

    fn apply(&mut self, connector: String, level: f64) {
        let Some(bus) = self.buses.get_mut(&connector) else {
            return;
        };
        if bus.backing_off() {
            return;
        }
        let value = (level.clamp(0.0, 1.0) * f64::from(bus.max)).round() as u16;
        match ddcutil::set_brightness(bus.number, value) {
            Ok(()) => {
                bus.succeeded();
                let level = f64::from(value) / f64::from(bus.max);
                self.controls.insert(connector, Control::Ready { level });
            }
            Err(_) => {
                bus.failed();
                if bus.backing_off() {
                    self.controls.insert(connector, Control::Unresponsive);
                }
            }
        }
    }
}
