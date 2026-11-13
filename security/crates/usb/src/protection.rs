use std::collections::BTreeMap;
use std::io;

use zbus::names::OwnedUniqueName;

use crate::seat::SignedIn;
use crate::store;
use crate::unlocked::Unlocked;
use crate::usb::{self, Admission, Event};

pub type Device = (String, String);

#[derive(Clone, PartialEq, Eq)]
struct Held {
    name: String,
    announce: bool,
}

pub struct Change {
    pub enabled: bool,
    pub guarding: bool,
    pub held: bool,
    pub released: Vec<Device>,
}

pub struct Protection {
    enabled: bool,
    unlocked: Unlocked,
    guarding: bool,
    held: BTreeMap<String, Held>,
    unclaimed: Vec<Device>,
}

impl Protection {
    pub fn start(signed_in: Option<SignedIn>) -> Self {
        let mut protection = Self {
            enabled: store::enabled(),
            unlocked: Unlocked::at(signed_in),
            guarding: false,
            held: BTreeMap::new(),
            unclaimed: Vec::new(),
        };
        let waiting: Vec<String> = usb::waiting().collect();
        if protection.should_guard() {
            protection.guarding = true;
            usb::hold_new_devices();
            waiting.iter().for_each(|id| protection.hold(id, true));
        } else {
            usb::welcome_new_devices();
            waiting.iter().for_each(|id| usb::admit(id));
        }
        protection
    }

    pub fn enabled(&self) -> bool {
        self.enabled
    }

    pub fn guarding(&self) -> bool {
        self.guarding
    }

    pub fn held(&self) -> Vec<Device> {
        self.held
            .iter()
            .map(|(id, held)| (id.clone(), held.name.clone()))
            .collect()
    }

    pub fn signed_in(&self) -> Option<u32> {
        self.unlocked.person()
    }

    pub fn take_released(&mut self) -> Vec<Device> {
        std::mem::take(&mut self.unclaimed)
    }

    pub fn set_enabled(&mut self, enabled: bool) -> io::Result<Change> {
        store::save(enabled)?;
        Ok(self.track(|protection| {
            protection.enabled = enabled;
            protection.settle()
        }))
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
                Event::Added(id) if protection.guarding => protection.welcome(&id),
                Event::Configured(id) if protection.guarding => protection.hold(&id, false),
                Event::Added(_) | Event::Configured(_) => {}
                Event::Removed(id) => {
                    protection.held.remove(&id);
                }
                Event::Missed => protection.catch_up(),
            }
            Vec::new()
        })
    }

    pub fn stop(&mut self) {
        if self.guarding {
            self.release();
        }
    }

    fn track(&mut self, apply: impl FnOnce(&mut Self) -> Vec<Device>) -> Change {
        let (enabled, guarding, held) = (self.enabled, self.guarding, self.held.clone());
        let released = apply(self);
        Change {
            enabled: enabled != self.enabled,
            guarding: guarding != self.guarding,
            held: held != self.held,
            released,
        }
    }

    fn should_guard(&self) -> bool {
        self.enabled && !self.unlocked.now()
    }

    fn settle(&mut self) -> Vec<Device> {
        let guarding = self.should_guard();
        if guarding == self.guarding {
            return Vec::new();
        }
        self.guarding = guarding;
        if guarding {
            self.unclaimed.clear();
            usb::hold_new_devices();
            Vec::new()
        } else {
            let released = self.release();
            self.unclaimed.extend_from_slice(&released);
            released
        }
    }

    fn release(&mut self) -> Vec<Device> {
        usb::welcome_new_devices();
        std::mem::take(&mut self.held)
            .into_iter()
            .map(|(id, held)| {
                if held.announce {
                    usb::admit(&id);
                } else {
                    usb::admit_parts(&id);
                }
                (id, held.name)
            })
            .collect()
    }

    fn welcome(&mut self, id: &str) {
        if usb::is_root_hub(id) {
            usb::hold_new_devices_on(id);
        } else {
            self.hold(id, true);
        }
    }

    fn hold(&mut self, id: &str, announce: bool) {
        match usb::admit_usable_part(id) {
            Admission::Waiting => {
                let announce = self.held.get(id).map_or(announce, |held| held.announce);
                let name = usb::name(id);
                self.held.insert(id.to_owned(), Held { name, announce });
            }
            Admission::Complete => {
                self.held.remove(id);
            }
        }
    }

    fn catch_up(&mut self) {
        self.held.retain(|id, _| usb::exists(id));
        if self.guarding {
            usb::hold_new_devices();
            usb::waiting().for_each(|id| self.hold(&id, true));
        }
    }
}
