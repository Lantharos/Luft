use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use tokio::sync::{Notify, watch};

use crate::config::{Config, Visibility};
use crate::events::{Event, Link};
use crate::localsend::discovery::Devices;
use crate::localsend::protocol::{Info, PORT, Presence, Scheme, VERSION};
use crate::localsend::receive::Inbox;
use crate::localsend::send::Outbox;
use crate::localsend::tls::Identity;

pub struct App {
    pub identity: Identity,
    pub computer_name: String,
    pub config: watch::Sender<Config>,
    pub devices: Devices,
    pub link: Link,
    pub inbox: Inbox,
    pub outbox: Outbox,
    pub scans: Notify,
    pairing: Mutex<Option<Pairing>>,
}

const PAIRING_LASTS: Duration = Duration::from_secs(300);

struct Pairing {
    pin: String,
    until: Instant,
}

impl App {
    pub fn new(identity: Identity, computer_name: String, link: Link) -> Arc<Self> {
        Arc::new(Self {
            identity,
            computer_name,
            config: watch::Sender::new(Config::default()),
            devices: Devices::new(),
            link,
            inbox: Inbox::default(),
            outbox: Outbox::default(),
            scans: Notify::new(),
            pairing: Mutex::default(),
        })
    }

    pub fn configure(&self, config: Config) {
        let alias = config.alias(&self.computer_name);
        let renamed = alias != self.config.borrow().alias(&self.computer_name);
        let opened = config.visibility != self.config.borrow().visibility;
        self.link.send(Event::Ready { alias, folder: config.folder() });
        self.config.send_replace(config);
        if renamed || opened {
            self.scans.notify_one();
        }
    }

    pub fn info(&self) -> Info {
        Info {
            alias: self.config.borrow().alias(&self.computer_name),
            version: VERSION.into(),
            device_model: Some("Luft".into()),
            device_type: Some("desktop".into()),
            fingerprint: self.identity.fingerprint.clone(),
            download: false,
        }
    }

    pub fn presence(&self, announce: Option<bool>) -> Presence {
        Presence { info: self.info(), port: PORT, protocol: Scheme::Https, announce }
    }

    pub fn visibility(&self) -> Visibility {
        self.config.borrow().visibility
    }

    pub fn trusts(&self, fingerprint: &str) -> bool {
        self.config.borrow().trusts(fingerprint)
    }

    pub fn start_pairing(&self, pin: String) {
        *self.pairing.lock().unwrap() = Some(Pairing { pin, until: Instant::now() + PAIRING_LASTS });
    }

    pub fn stop_pairing(&self) {
        self.pairing.lock().unwrap().take();
    }

    pub fn pairing_pin(&self) -> Option<String> {
        self.pairing.lock().unwrap().as_ref().filter(|pairing| Instant::now() < pairing.until).map(|pairing| pairing.pin.clone())
    }

    pub fn announces_to_everyone(&self) -> bool {
        match self.visibility() {
            Visibility::NoOne => false,
            Visibility::YourDevices => self.pairing_pin().is_some(),
            Visibility::Everyone => true,
        }
    }

    pub fn admits(&self, fingerprint: Option<&str>) -> bool {
        self.announces_to_everyone() || (self.visibility() == Visibility::YourDevices && fingerprint.is_some_and(|fingerprint| self.trusts(fingerprint)))
    }
}

pub fn random_id() -> String {
    let mut bytes = [0u8; 16];
    getrandom::fill(&mut bytes).expect("the system has randomness");
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}
