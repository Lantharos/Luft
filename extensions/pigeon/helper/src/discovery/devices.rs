use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Mutex;
use std::time::Instant;

use tokio::sync::watch;

use crate::link::Peer;
use crate::protocol::{Presence, Scheme};

/// A device on the network, as last heard from.
#[derive(Clone, Debug)]
pub struct Device {
    pub peer: Peer,
    pub address: SocketAddr,
    pub scheme: Scheme,
    seen: Instant,
}

impl Device {
    /// A device known by `fingerprint`, which `verified` says its certificate proved.
    pub fn new(presence: &Presence, fingerprint: String, address: SocketAddr, verified: bool) -> Self {
        let info = &presence.info;
        Self {
            peer: Peer {
                verified,
                id: fingerprint,
                alias: info.alias.clone(),
                kind: info.device_type.clone().unwrap_or_else(|| "desktop".into()),
                model: info.device_model.clone(),
            },
            address,
            scheme: presence.protocol,
            seen: Instant::now(),
        }
    }
}

/// The devices heard from lately. Everyone interested watches `list`, which changes only when what shows does.
pub struct Devices {
    known: Mutex<HashMap<String, Device>>,
    list: watch::Sender<Vec<Peer>>,
}

impl Devices {
    pub fn new() -> Self {
        Self { known: Mutex::default(), list: watch::Sender::new(Vec::new()) }
    }

    pub fn watch(&self) -> watch::Receiver<Vec<Peer>> {
        self.list.subscribe()
    }

    pub fn get(&self, id: &str) -> Option<Device> {
        self.known.lock().unwrap().get(id).cloned()
    }

    pub fn heard(&self, device: Device) {
        let mut known = self.known.lock().unwrap();
        known.insert(device.peer.id.clone(), device);
        self.publish(&known);
    }

    /// Forgets the devices not heard from since `since`, after a scan asked everyone to answer.
    pub fn forget_older(&self, since: Instant) {
        let mut known = self.known.lock().unwrap();
        known.retain(|_, device| device.seen >= since);
        self.publish(&known);
    }

    pub fn is_empty_since(&self, since: Instant) -> bool {
        self.known.lock().unwrap().values().all(|device| device.seen < since)
    }

    fn publish(&self, known: &HashMap<String, Device>) {
        let mut peers: Vec<Peer> = known.values().map(|device| device.peer.clone()).collect();
        peers.sort_by(|a, b| a.alias.to_lowercase().cmp(&b.alias.to_lowercase()).then_with(|| a.id.cmp(&b.id)));
        self.list.send_if_modified(|shown| {
            let changed = *shown != peers;
            if changed {
                *shown = peers;
            }
            changed
        });
    }
}
