use std::sync::{Arc, Mutex};

use tokio::sync::{Notify, watch};

use crate::config::{Config, Visibility};
use crate::events::{Event, Link};
use crate::localsend::discovery::Devices;
use crate::localsend::protocol::{Info, PORT, Presence, Scheme, VERSION};
use crate::localsend::receive::Inbox;
use crate::localsend::send::Outbox;
use crate::localsend::tls::Identity;

/// What every part of Post shares.
pub struct App {
    pub identity: Identity,
    /// The computer's name, which other devices see unless people chose another.
    pub computer: String,
    pub config: watch::Sender<Config>,
    pub devices: Devices,
    pub link: Link,
    pub inbox: Inbox,
    pub outbox: Outbox,
    pub scans: Notify,
    /// The PIN a new device enters to become one of your devices, while Settings is adding one.
    pub pairing: Mutex<Option<String>>,
}

impl App {
    pub fn new(identity: Identity, computer: String, link: Link) -> Arc<Self> {
        Arc::new(Self {
            identity,
            computer,
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
        let alias = config.alias(&self.computer);
        let renamed = alias != self.config.borrow().alias(&self.computer);
        let opened = config.visibility != self.config.borrow().visibility;
        self.link.send(Event::Ready { alias, folder: config.folder() });
        self.config.send_replace(config);
        if renamed || opened {
            self.scans.notify_one();
        }
    }

    pub fn info(&self) -> Info {
        Info {
            alias: self.config.borrow().alias(&self.computer),
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

    pub fn pairing(&self) -> Option<String> {
        self.pairing.lock().unwrap().clone()
    }

    /// Whether this computer tells everyone nearby it's there, rather than only your devices.
    pub fn announces(&self) -> bool {
        match self.visibility() {
            Visibility::NoOne => false,
            Visibility::YourDevices => self.pairing().is_some(),
            Visibility::Everyone => true,
        }
    }

    /// Whether the device whose certificate proved `fingerprint` may find this computer and send to it.
    pub fn admits(&self, fingerprint: Option<&str>) -> bool {
        self.announces() || (self.visibility() == Visibility::YourDevices && fingerprint.is_some_and(|fingerprint| self.trusts(fingerprint)))
    }
}

/// A random id for a session, a file or a token.
pub fn random_id() -> String {
    let mut bytes = [0u8; 16];
    getrandom::fill(&mut bytes).expect("the system has randomness");
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}
