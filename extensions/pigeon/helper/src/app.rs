use std::sync::Arc;

use tokio::sync::{Notify, watch};

use crate::config::Config;
use crate::discovery::Devices;
use crate::link::{Event, Link};
use crate::protocol::{Info, PORT, Presence, Scheme, VERSION};
use crate::receive::Inbox;
use crate::send::Outbox;
use crate::tls::Identity;

/// What every part of the helper shares.
pub struct App {
    pub identity: Identity,
    pub config: watch::Sender<Config>,
    pub devices: Devices,
    pub link: Link,
    pub inbox: Inbox,
    pub outbox: Outbox,
    pub scans: Notify,
}

impl App {
    pub fn new(identity: Identity, config: Config, link: Link) -> Arc<Self> {
        link.send(Event::Ready { fingerprint: identity.fingerprint.clone(), alias: config.alias() });
        Arc::new(Self {
            identity,
            config: watch::Sender::new(config),
            devices: Devices::new(),
            link,
            inbox: Inbox::default(),
            outbox: Outbox::default(),
            scans: Notify::new(),
        })
    }

    pub fn info(&self) -> Info {
        Info {
            alias: self.config.borrow().alias(),
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

    pub fn receiving(&self) -> bool {
        self.config.borrow().receive
    }
}

/// A random id for a session, a file or a token.
pub fn random_id() -> String {
    let mut bytes = [0u8; 16];
    getrandom::fill(&mut bytes).expect("the system has randomness");
    bytes.iter().map(|byte| format!("{byte:02x}")).collect()
}
