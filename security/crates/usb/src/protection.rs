use std::collections::BTreeMap;
use std::io;

use crate::store;
use crate::usb::{self, Admission, Event};

pub type Device = (String, String);

pub struct Change {
    pub enabled: bool,
    pub guarding: bool,
    pub held: bool,
    pub released: Vec<Device>,
}

pub struct Protection {
    enabled: bool,
    unlocked: bool,
    guarding: bool,
    held: BTreeMap<String, String>,
}

impl Protection {
    pub fn start(unlocked: bool) -> Self {
        let mut protection = Self {
            enabled: store::enabled(),
            unlocked,
            guarding: false,
            held: BTreeMap::new(),
        };
        let waiting: Vec<String> = usb::waiting().collect();
        if protection.should_guard() {
            protection.guarding = true;
            usb::hold_new_devices();
            waiting.iter().for_each(|id| protection.hold(id));
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
        self.held.clone().into_iter().collect()
    }

    pub fn set_enabled(&mut self, enabled: bool) -> io::Result<Change> {
        store::save(enabled)?;
        Ok(self.track(|protection| {
            protection.enabled = enabled;
            protection.settle()
        }))
    }

    pub fn set_unlocked(&mut self, unlocked: bool) -> Change {
        self.track(|protection| {
            protection.unlocked = unlocked;
            protection.settle()
        })
    }

    pub fn handle(&mut self, event: Event) -> Change {
        self.track(|protection| {
            match event {
                Event::Added(id) if protection.guarding => protection.welcome(&id),
                Event::Added(_) => {}
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
        self.enabled && !self.unlocked
    }

    fn settle(&mut self) -> Vec<Device> {
        let guarding = self.should_guard();
        if guarding == self.guarding {
            return Vec::new();
        }
        self.guarding = guarding;
        if guarding {
            usb::hold_new_devices();
            Vec::new()
        } else {
            self.release()
        }
    }

    fn release(&mut self) -> Vec<Device> {
        usb::welcome_new_devices();
        let released = std::mem::take(&mut self.held);
        released.keys().for_each(|id| usb::admit(id));
        released.into_iter().collect()
    }

    fn welcome(&mut self, id: &str) {
        if usb::is_root_hub(id) {
            usb::hold_new_devices_on(id);
        } else {
            self.hold(id);
        }
    }

    fn hold(&mut self, id: &str) {
        match usb::admit_usable_part(id) {
            Admission::Waiting => {
                self.held.insert(id.to_owned(), usb::name(id));
            }
            Admission::Complete => {
                self.held.remove(id);
            }
        }
    }

    fn catch_up(&mut self) {
        self.held.retain(|id, _| usb::exists(id));
        if self.guarding {
            usb::waiting().for_each(|id| self.hold(&id));
        }
    }
}
