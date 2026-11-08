mod access;
pub mod identity;
mod listeners;

use std::collections::{BTreeMap, BTreeSet};
use std::io;

pub use access::{Access, Decisions};
pub use identity::{Identity, Origin};
use listeners::{Listener, Listeners};

use crate::listening::Change;
use crate::ports::{Port, Protocol};
use crate::rules::DISCOVERY;

pub type Reach = BTreeSet<(String, Port)>;

#[derive(Default)]
pub struct Reachable {
    pub home: Reach,
    pub anywhere: Reach,
}

pub struct Apps {
    decisions: Decisions,
    listeners: Listeners,
    extensions: BTreeMap<String, BTreeSet<Port>>,
}

fn discovery(port: Port) -> bool {
    port.protocol == Protocol::Udp && DISCOVERY.contains(&port.number)
}

impl Apps {
    pub fn load() -> io::Result<Self> {
        Ok(Self {
            decisions: access::load()?,
            listeners: Listeners::restore(),
            extensions: BTreeMap::new(),
        })
    }

    pub fn cookies(&self) -> impl Iterator<Item = u64> + '_ {
        self.listeners.cookies()
    }

    pub fn decisions(&self) -> &Decisions {
        &self.decisions
    }

    fn allowed(&self, listener: &Listener) -> bool {
        self.decisions
            .get(&listener.identity)
            .is_some_and(|access| access.on_home())
    }

    pub fn waiting(&self) -> BTreeSet<(Identity, u32)> {
        self.listeners
            .iter()
            .filter(|listener| !self.decisions.contains_key(&listener.identity))
            .map(|listener| (listener.identity.clone(), listener.uid))
            .collect()
    }

    pub fn reachable(&self) -> Reachable {
        let mut reachable = Reachable::default();
        for listener in self.listeners.iter() {
            let Some(access) = self.decisions.get(&listener.identity) else {
                continue;
            };
            let element = (listener.unit.clone(), listener.port);
            if *access == Access::Anywhere {
                reachable.anywhere.insert(element.clone());
            }
            if access.on_home() {
                reachable.home.insert(element);
            }
        }
        for (unit, ports) in &self.extensions {
            reachable
                .home
                .extend(ports.iter().map(|port| (unit.clone(), *port)));
        }
        reachable
    }

    pub fn prune(&mut self) {
        self.listeners.retain_alive();
        self.extensions.retain(|unit, _| identity::alive(unit));
    }

    pub fn observe(&mut self, change: Change) -> bool {
        match change {
            Change::Bound { cookie, pid, port } => {
                if discovery(port) {
                    return false;
                }
                let Some(Origin::App {
                    unit,
                    identity,
                    uid,
                }) = identity::of_process(pid)
                else {
                    return false;
                };
                let listener = Listener {
                    unit,
                    identity,
                    uid,
                    port,
                };
                let allowed = self.allowed(&listener);
                self.listeners.insert(cookie, listener);
                allowed
            }
            Change::Released { cookie } => self
                .listeners
                .remove(cookie)
                .is_some_and(|listener| self.allowed(&listener)),
        }
    }

    pub fn decide(&mut self, identity: Identity, access: Access) -> io::Result<()> {
        let mut decisions = self.decisions.clone();
        decisions.insert(identity, access);
        access::save(&decisions)?;
        self.decisions = decisions;
        Ok(())
    }

    pub fn declare(&mut self, unit: String, ports: BTreeSet<Port>) {
        if ports.is_empty() {
            self.extensions.remove(&unit);
        } else {
            self.extensions.insert(unit, ports);
        }
    }
}
