mod descriptors;
mod events;
mod sysfs;

pub use events::{Event, Events};
pub use sysfs::is_root_hub;

use sysfs::{Bus, Device};

const HID: u8 = 0x03;
const HUB: u8 = 0x09;

fn usable_while_locked(class: u8) -> bool {
    matches!(class, HID | HUB)
}

pub fn hold_new_devices() {
    Bus::all().for_each(|bus| bus.hold_new_devices());
}

pub fn hold_new_devices_on(bus: &str) {
    Bus::named(bus).hold_new_devices();
}

pub fn welcome_new_devices() {
    Bus::all().for_each(|bus| bus.welcome_new_devices());
}

pub fn exists(id: &str) -> bool {
    Device::named(id).descriptors().is_some()
}

pub fn name(id: &str) -> String {
    Device::named(id).name()
}

pub fn waiting() -> impl Iterator<Item = String> {
    Device::ids().filter(|id| {
        let device = Device::named(id);
        !device.is_authorized()
            || device
                .interfaces()
                .any(|interface| !interface.is_authorized())
    })
}

pub enum Admission {
    Complete,
    Waiting,
}

pub fn admit_usable_part(id: &str) -> Admission {
    let device = Device::named(id);
    if !device.is_authorized() {
        let Some(descriptors) = device.descriptors() else {
            return Admission::Complete;
        };
        if !descriptors::interface_classes(&descriptors).any(usable_while_locked) {
            return Admission::Waiting;
        }
        device.authorize();
    }
    let mut admission = Admission::Complete;
    for interface in device
        .interfaces()
        .filter(|interface| !interface.is_authorized())
    {
        if interface.class().is_some_and(usable_while_locked) {
            interface.authorize();
        } else {
            admission = Admission::Waiting;
        }
    }
    admission
}

pub fn admit(id: &str) {
    let device = Device::named(id);
    if !device.is_authorized() {
        device.authorize();
    }
    device
        .interfaces()
        .filter(|interface| !interface.is_authorized())
        .for_each(|interface| interface.authorize());
}
