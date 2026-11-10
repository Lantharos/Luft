mod access;
mod extensions;
pub mod identity;
mod listeners;
mod questions;

use std::collections::BTreeSet;
use std::io;
use std::time::Instant;

pub use access::{Access, Decisions};
use extensions::Extensions;
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
    extensions: Extensions,
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
            if !decisions.contains_key(&listener.owner()) {
                questions.ask(listener);
            }
        }
        Ok(Self {
            decisions,
            listeners,
            questions,
            extensions: Extensions::load()?,
        })
    }

    pub fn cookies(&self) -> impl Iterator<Item = u64> + '_ {
        self.listeners.cookies()
    }

    pub fn decisions(&self) -> &Decisions {
        &self.decisions
    }

    pub fn waiting(&self) -> BTreeSet<(u32, Identity)> {
        self.questions.waiting()
    }

    pub fn deadline(&self) -> Option<Instant> {
        self.questions.deadline()
    }

    pub fn reachable(&self) -> Reachable {
        let mut reachable = Reachable::default();
        for listener in self.listeners.iter() {
            let Some(access) = self.decisions.get(&listener.owner()) else {
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
        reachable.home.extend(
            self.extensions
                .listening()
                .map(|(unit, port)| (unit.clone(), *port)),
        );
        reachable
    }

    pub fn prune(&mut self) {
        self.listeners.retain_alive();
        self.questions.retain_alive();
        self.extensions.retain_alive();
    }

    pub fn prune_questions(&mut self) {
        self.questions.retain_alive();
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
                let access = self.decisions.get(&listener.owner()).copied();
                if access.is_none() {
                    self.questions.listening(cookie);
                }
                self.listeners.insert(cookie, listener);
                access.is_some_and(Access::on_home)
            }
            Change::Released { cookie } => {
                self.questions.stopped(cookie);
                self.listeners.remove(cookie);
                false
            }
        }
    }

    pub fn settle(&mut self, now: Instant) {
        for cookie in self.questions.settled(now) {
            if let Some(listener) = self.listeners.get(cookie)
                && !self.decisions.contains_key(&listener.owner())
            {
                self.questions.ask(listener);
            }
        }
    }

    pub fn decide(&mut self, owner: (u32, Identity), access: Access) -> io::Result<()> {
        let mut decisions = self.decisions.clone();
        decisions.insert(owner.clone(), access);
        access::save(&decisions)?;
        self.decisions = decisions;
        self.questions.answered(&owner);
        Ok(())
    }

    pub fn forget(&mut self, owner: &(u32, Identity)) -> io::Result<()> {
        let mut decisions = self.decisions.clone();
        decisions.remove(owner);
        access::save(&decisions)?;
        self.decisions = decisions;
        for listener in self
            .listeners
            .iter()
            .filter(|listener| listener.owner() == *owner)
        {
            self.questions.ask(listener);
        }
        Ok(())
    }

    pub fn new_to(&self, uid: u32, ports: &BTreeSet<Port>) -> Vec<Port> {
        self.extensions.new_to(uid, ports)
    }

    pub fn declare(&mut self, uid: u32, unit: String, ports: BTreeSet<Port>) -> io::Result<()> {
        let new = self.extensions.new_to(uid, &ports);
        if !new.is_empty() {
            self.extensions.agree(uid, &new)?;
        }
        self.extensions.listen(unit, ports);
        Ok(())
    }
}
