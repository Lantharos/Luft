mod access;
pub mod identity;
mod listeners;
mod questions;

use std::collections::{BTreeMap, BTreeSet};
use std::io;
use std::time::Instant;

pub use access::{Access, Decisions};
pub use identity::{Identity, Origin};
use listeners::{Listener, Listeners};
use questions::Questions;

use crate::listening::Change;
use crate::ports::{Port, Protocol};
use crate::rules::DISCOVERY;

pub type Reach = BTreeSet<(String, Port)>;

#[derive(Default, PartialEq)]
pub struct Reachable {
    pub home: Reach,
    pub anywhere: Reach,
}

pub struct Apps {
    decisions: Decisions,
    listeners: Listeners,
    questions: Questions,
    extensions: BTreeMap<String, BTreeSet<Port>>,
}

fn discovery(port: Port) -> bool {
    port.protocol == Protocol::Udp && DISCOVERY.contains(&port.number)
}

impl Apps {
    pub fn load() -> io::Result<Self> {
        let decisions = access::load()?;
        let listeners = Listeners::restore();
        let mut questions = Questions::default();
        for listener in listeners.iter() {
            if !decisions.contains_key(&listener.identity) {
                questions.ask(listener);
            }
        }
        Ok(Self {
            decisions,
            listeners,
            questions,
            extensions: BTreeMap::new(),
        })
    }

    pub fn cookies(&self) -> impl Iterator<Item = u64> + '_ {
        self.listeners.cookies()
    }

    pub fn decisions(&self) -> &Decisions {
        &self.decisions
    }

    pub fn waiting(&self) -> BTreeSet<(Identity, u32)> {
        self.questions.waiting()
    }

    pub fn deadline(&self) -> Option<Instant> {
        self.questions.deadline()
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
        self.questions.retain_alive();
        self.extensions.retain(|unit, _| identity::alive(unit));
    }

    pub fn prune_questions(&mut self) {
        self.questions.retain_alive();
    }

    pub fn observe(&mut self, change: Change) {
        match change {
            Change::Bound { cookie, pid, port } => {
                if discovery(port) {
                    return;
                }
                let Some(Origin::App {
                    unit,
                    identity,
                    uid,
                }) = identity::of_process(pid)
                else {
                    return;
                };
                if !self.decisions.contains_key(&identity) {
                    self.questions.listening(cookie);
                }
                self.listeners.insert(
                    cookie,
                    Listener {
                        unit,
                        identity,
                        uid,
                        port,
                    },
                );
            }
            Change::Released { cookie } => {
                self.questions.stopped(cookie);
                self.listeners.remove(cookie);
            }
        }
    }

    pub fn settle(&mut self, now: Instant) {
        for cookie in self.questions.settled(now) {
            if let Some(listener) = self.listeners.get(cookie)
                && !self.decisions.contains_key(&listener.identity)
            {
                self.questions.ask(listener);
            }
        }
    }

    pub fn decide(&mut self, identity: Identity, access: Access) -> io::Result<()> {
        let mut decisions = self.decisions.clone();
        decisions.insert(identity.clone(), access);
        access::save(&decisions)?;
        self.decisions = decisions;
        self.questions.answered(&identity);
        Ok(())
    }

    /// Forgets what was chosen for an app, which is asked about again while it still listens.
    pub fn forget(&mut self, identity: &Identity) -> io::Result<()> {
        let mut decisions = self.decisions.clone();
        decisions.remove(identity);
        access::save(&decisions)?;
        self.decisions = decisions;
        for listener in self.listeners.iter().filter(|listener| listener.identity == *identity) {
            self.questions.ask(listener);
        }
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
