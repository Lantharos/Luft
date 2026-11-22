use std::collections::{BTreeMap, BTreeSet};
use std::io;

use portguard::mode::{Mode, Rules};
use portguard::store::Store;
use portguard::thunderbolt;
use portguard::trust::{Known, Trusted};
use portguard::usb::{self, Event, Outcome};
use zbus::names::OwnedUniqueName;

use super::seat::SignedIn;
use super::unlocked::Unlocked;

pub type Device = (String, String);

#[derive(Clone, PartialEq, Eq)]
struct Held {
    name: String,
    announce: bool,
}

#[derive(Clone, PartialEq, Eq)]
struct Unknown {
    device: Option<Known>,
    number: Option<String>,
    asked: bool,
}

/// A device about to be asked about, as it was when the question started.
pub struct Question {
    pub serial: u64,
    pub id: String,
    pub name: String,
    number: Option<String>,
}

pub enum Answer {
    Approved,
    Declined,
    Unanswered,
}

pub enum Refusal {
    Gone,
    NotSaved(io::Error),
}

pub struct Change {
    pub mode: bool,
    pub held: bool,
    pub waiting: bool,
    pub trusted: bool,
    pub released: Vec<Device>,
}

pub struct Protection {
    store: Store,
    mode: Mode,
    trusted: Trusted,
    unlocked: Unlocked,
    rules: Rules,
    held: BTreeMap<String, Held>,
    unknown: BTreeMap<String, Unknown>,
    declined: Vec<Known>,
    asking: Option<(u64, String)>,
    questions: u64,
    cancelled: Option<u64>,
    bolt: Option<Mode>,
    unclaimed: Vec<Device>,
}

fn name(id: &str) -> String {
    thunderbolt::named(id).map_or_else(|| usb::name(id), thunderbolt::name)
}

fn number(id: &str) -> Option<String> {
    thunderbolt::named(id).map_or_else(|| usb::number(id), |_| None)
}

fn exists(id: &str) -> bool {
    thunderbolt::named(id).map_or_else(|| usb::exists(id), thunderbolt::exists)
}

fn as_known(id: &str) -> Option<Known> {
    let (identity, place) = match thunderbolt::named(id) {
        Some(name) => (thunderbolt::identity(name)?, thunderbolt::place(name)?),
        None => (usb::identity(id)?, usb::place(id)?),
    };
    Some(Known::new(identity, &place, &name(id)))
}

impl Protection {
    pub fn start(signed_in: Option<SignedIn>) -> Self {
        let store = Store::system();
        let mode = store.mode();
        let unlocked = Unlocked::at(signed_in);
        let rules = Rules {
            mode,
            locked: !unlocked.now(),
        };
        let mut protection = Self {
            trusted: store.trusted(),
            store,
            mode,
            unlocked,
            rules,
            held: BTreeMap::new(),
            unknown: BTreeMap::new(),
            declined: Vec::new(),
            asking: None,
            questions: 0,
            cancelled: None,
            bolt: Some(mode),
            unclaimed: Vec::new(),
        };
        usb::hold(rules);
        for id in usb::waiting().chain(thunderbolt::waiting()) {
            protection.consider(&id, true);
        }
        protection
    }

    pub fn mode(&self) -> Mode {
        self.mode
    }

    pub fn held(&self) -> Vec<Device> {
        self.held
            .iter()
            .map(|(id, held)| (id.clone(), held.name.clone()))
            .collect()
    }

    pub fn waiting(&self) -> Vec<Device> {
        self.unknown
            .iter()
            .map(|(id, unknown)| {
                let name = unknown
                    .device
                    .as_ref()
                    .map_or_else(|| name(id), |device| device.name.clone());
                (id.clone(), name)
            })
            .collect()
    }

    pub fn trusted(&self) -> Vec<Device> {
        self.trusted
            .devices()
            .iter()
            .map(|known| (known.key(), known.name.clone()))
            .collect()
    }

    pub fn signed_in(&self) -> Option<u32> {
        self.unlocked.person()
    }

    pub fn take_released(&mut self) -> Vec<Device> {
        std::mem::take(&mut self.unclaimed)
    }

    pub fn take_cancelled(&mut self) -> Option<u64> {
        self.cancelled.take()
    }

    pub fn take_bolt(&mut self) -> Option<Mode> {
        self.bolt.take()
    }

    pub fn set_mode(&mut self, mode: Mode) -> io::Result<Change> {
        let mut trusted = self.trusted.clone();
        if mode == Mode::KnownOnly && self.mode != Mode::KnownOnly {
            for known in usb::connected().chain(thunderbolt::connected()) {
                trusted.add(known);
            }
            self.store.save_trusted(&trusted)?;
        }
        self.store.save_mode(mode)?;
        Ok(self.track(|protection| {
            protection.trusted = trusted;
            protection.mode = mode;
            protection.bolt = Some(mode);
            protection.settle()
        }))
    }

    pub fn forget(&mut self, key: &str) -> io::Result<bool> {
        let mut trusted = self.trusted.clone();
        if !trusted.forget(key) {
            return Ok(false);
        }
        self.store.save_trusted(&trusted)?;
        self.trusted = trusted;
        Ok(true)
    }

    /// What a question about the waiting device `id` would name, and the
    /// enumeration it would be about.
    pub fn about(&self, id: &str) -> Option<(String, Option<String>)> {
        let unknown = self.unknown.get(id)?;
        let name = unknown.device.as_ref()?.name.clone();
        Some((name, unknown.number.clone()))
    }

    /// Trusts the waiting device `id` where it is, as long as it is still
    /// the one that was asked about: the same enumeration on the same port,
    /// saying the same about itself.
    pub fn allow(&mut self, id: &str, asked: Option<&str>) -> Result<Change, Refusal> {
        let Some(unknown) = self.unknown.get(id) else {
            return Err(Refusal::Gone);
        };
        let Some(device) = unknown.device.clone() else {
            return Err(Refusal::Gone);
        };
        if unknown.number.as_deref() != asked
            || number(id).as_deref() != asked
            || as_known(id).as_ref() != Some(&device)
        {
            return Err(Refusal::Gone);
        }
        let mut trusted = self.trusted.clone();
        trusted.add(device);
        self.store
            .save_trusted(&trusted)
            .map_err(Refusal::NotSaved)?;
        Ok(self.track(|protection| {
            protection.trusted = trusted;
            if protection.consider(id, true) == Outcome::Connected
                && thunderbolt::named(id).is_none()
            {
                usb::announce(id);
            }
            Vec::new()
        }))
    }

    pub fn next_question(&mut self) -> Option<Question> {
        if self.asking.is_some() || self.rules.locked {
            return None;
        }
        let (id, unknown) = self
            .unknown
            .iter_mut()
            .find(|(_, unknown)| !unknown.asked && unknown.device.is_some())?;
        unknown.asked = true;
        self.questions += 1;
        self.asking = Some((self.questions, id.clone()));
        Some(Question {
            serial: self.questions,
            id: id.clone(),
            name: unknown.device.as_ref()?.name.clone(),
            number: unknown.number.clone(),
        })
    }

    pub fn answered(&mut self, question: &Question, answer: Answer) -> Change {
        if self
            .asking
            .as_ref()
            .is_some_and(|(serial, _)| *serial == question.serial)
        {
            self.asking = None;
        }
        match answer {
            Answer::Approved => self
                .allow(&question.id, question.number.as_deref())
                .unwrap_or_else(|refusal| {
                    if let Refusal::NotSaved(error) = refusal {
                        eprintln!("Couldn't save the device that was allowed: {error}");
                    }
                    self.track(|_| Vec::new())
                }),
            Answer::Declined => {
                if let Some(device) = self
                    .unknown
                    .get(&question.id)
                    .and_then(|unknown| unknown.device.clone())
                {
                    self.declined.push(device);
                }
                self.track(|_| Vec::new())
            }
            Answer::Unanswered => self.track(|_| Vec::new()),
        }
    }

    pub fn switch(&mut self, signed_in: Option<SignedIn>) -> Change {
        self.track(|protection| {
            protection.unlocked.switch(signed_in);
            protection.settle()
        })
    }

    pub fn declare(&mut self, uid: u32, shell: OwnedUniqueName, locked: bool) -> Change {
        self.track(|protection| {
            protection.unlocked.declare(uid, shell, locked);
            protection.settle()
        })
    }

    pub fn shell_left(&mut self, name: &str) -> Change {
        self.track(|protection| {
            protection.unlocked.left(name);
            protection.settle()
        })
    }

    pub fn handle(&mut self, event: Event) -> Change {
        self.track(|protection| {
            match event {
                Event::Added(id) if usb::is_bus(&id) => usb::hold_bus(&id, protection.rules),
                Event::Added(id) => {
                    protection.consider(&id, true);
                }
                Event::Configured(id) => {
                    protection.consider(&id, false);
                }
                Event::Removed(id) => protection.gone(&id),
                Event::Missed => protection.catch_up(),
            }
            Vec::new()
        })
    }

    /// Lets in what waited for an unlock, as the service stops on purpose.
    /// Only Known devices keeps holding new devices until it is back.
    pub fn stop(&mut self) {
        if self.mode == Mode::KnownOnly {
            return;
        }
        usb::hold(Rules {
            mode: Mode::Off,
            locked: false,
        });
        self.rules = Rules {
            mode: self.mode,
            locked: false,
        };
        let held: Vec<String> = self.held.keys().cloned().collect();
        self.reconsider(held);
    }

    fn track(&mut self, apply: impl FnOnce(&mut Self) -> Vec<Device>) -> Change {
        let (mode, held, unknown, trusted) = (
            self.mode,
            self.held.clone(),
            self.waiting(),
            self.trusted.clone(),
        );
        let released = apply(self);
        Change {
            mode: mode != self.mode,
            held: held != self.held,
            waiting: unknown != self.waiting(),
            trusted: trusted != self.trusted,
            released,
        }
    }

    fn consider(&mut self, id: &str, announce: bool) -> Outcome {
        let outcome = match thunderbolt::named(id) {
            Some(name) => thunderbolt::admit(name, self.rules, &self.trusted),
            None => usb::admit(id, self.rules, &self.trusted),
        };
        if outcome != Outcome::WaitsForUnlock {
            self.held.remove(id);
        }
        if outcome != Outcome::WaitsForApproval {
            self.forget_waiting(id);
        }
        match outcome {
            Outcome::Connected => {}
            Outcome::WaitsForUnlock => {
                let announce = self.held.get(id).map_or(announce, |held| held.announce);
                self.held.insert(
                    id.to_owned(),
                    Held {
                        name: name(id),
                        announce,
                    },
                );
            }
            Outcome::WaitsForApproval => {
                if !self.unknown.contains_key(id) {
                    let device = as_known(id);
                    let asked = device
                        .as_ref()
                        .is_some_and(|device| self.declined.contains(device));
                    self.unknown.insert(
                        id.to_owned(),
                        Unknown {
                            device,
                            number: number(id),
                            asked,
                        },
                    );
                }
            }
        }
        outcome
    }

    fn forget_waiting(&mut self, id: &str) {
        self.unknown.remove(id);
        if self.asking.as_ref().is_some_and(|(_, asked)| asked == id) {
            self.cancel();
        }
    }

    fn cancel(&mut self) {
        if let Some((serial, _)) = self.asking.take() {
            self.cancelled = Some(serial);
        }
    }

    fn gone(&mut self, id: &str) {
        self.held.remove(id);
        self.forget_waiting(id);
    }

    fn settle(&mut self) -> Vec<Device> {
        let rules = Rules {
            mode: self.mode,
            locked: !self.unlocked.now(),
        };
        if rules == self.rules {
            return Vec::new();
        }
        self.rules = rules;
        usb::hold(rules);
        if rules.locked {
            self.unclaimed.clear();
            self.cancel();
            self.unknown.values_mut().for_each(|unknown| {
                unknown.asked = unknown
                    .device
                    .as_ref()
                    .is_some_and(|device| self.declined.contains(device))
            });
        }
        let ids: BTreeSet<String> = self
            .held
            .keys()
            .chain(self.unknown.keys())
            .cloned()
            .chain(usb::waiting())
            .chain(thunderbolt::waiting())
            .collect();
        let released = self.reconsider(ids);
        self.unclaimed.extend_from_slice(&released);
        released
    }

    fn reconsider(&mut self, ids: impl IntoIterator<Item = String>) -> Vec<Device> {
        let mut released = Vec::new();
        for id in ids {
            let was = self.held.get(&id).cloned();
            if self.consider(&id, true) == Outcome::Connected
                && let Some(was) = was
            {
                if was.announce && thunderbolt::named(&id).is_none() {
                    usb::announce(&id);
                }
                released.push((id, was.name));
            }
        }
        released
    }

    fn catch_up(&mut self) {
        self.held.retain(|id, _| exists(id));
        let gone: Vec<String> = self
            .unknown
            .iter()
            .filter(|(id, unknown)| !exists(id) || number(id) != unknown.number)
            .map(|(id, _)| id.clone())
            .collect();
        gone.iter().for_each(|id| self.forget_waiting(id));
        usb::hold(self.rules);
        for id in usb::waiting().chain(thunderbolt::waiting()) {
            self.consider(&id, true);
        }
    }
}
