mod descriptors;
mod events;
mod port;
mod sysfs;

pub use descriptors::Function;
pub use events::{Event, Events};

use crate::mode::Rules;
use crate::sign_in::SignInDevices;
use crate::trust::{Bus as Kind, Identity, Known, Trusted};
use sysfs::{Bus, Device};

/// What became of a device that was looked at.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Outcome {
    Connected,
    WaitsForUnlock,
    WaitsForApproval,
}

/// Sets what connects by itself on every bus, and on buses that appear later.
pub fn hold(rules: Rules) {
    if rules.holds_anything() {
        sysfs::hold_on_new_buses();
    } else {
        sysfs::welcome_on_new_buses();
    }
    Bus::all().for_each(|bus| bus.hold(rules.holds_devices(), rules.holds_parts()));
}

pub fn hold_bus(id: &str, rules: Rules) {
    Bus::named(id).hold(rules.holds_devices(), rules.holds_parts());
}

pub fn is_bus(id: &str) -> bool {
    sysfs::is_root_hub(id)
}

pub fn exists(id: &str) -> bool {
    Device::named(id).descriptors().is_some()
}

pub fn name(id: &str) -> String {
    Device::named(id).name()
}

pub fn number(id: &str) -> Option<String> {
    Device::named(id).number()
}

pub fn announce(id: &str) {
    Device::named(id).announce();
}

fn devices() -> impl Iterator<Item = String> {
    let mut ids: Vec<(usize, String)> = Device::ids()
        .filter(|id| !is_bus(id))
        .map(|id| (id.matches('.').count(), id))
        .collect();
    ids.sort();
    ids.into_iter().map(|(_, id)| id)
}

pub fn waiting() -> impl Iterator<Item = String> {
    devices().filter(|id| {
        let device = Device::named(id);
        !device.is_authorized()
            || device
                .interfaces()
                .any(|interface| !interface.is_authorized())
    })
}

pub fn identity(id: &str) -> Option<Identity> {
    let device = Device::named(id);
    let (vendor, product) = device.vendor_product()?;
    let descriptors = device.descriptors()?;
    Some(Identity::new(
        Kind::Usb,
        vendor,
        product,
        &device.serial(),
        descriptors::functions(&descriptors),
    ))
}

pub fn place(id: &str) -> Option<String> {
    port::of(id)
}

pub fn knows(id: &str, trusted: &Trusted) -> bool {
    port::built_in(id)
        || identity(id)
            .zip(port::of(id))
            .is_some_and(|(identity, port)| trusted.knows(&identity, &port))
}

/// Connects what `rules` let in of the device `id`, and the part an enrolled
/// security key or card reader signs in with, and says whether anything of
/// it still waits.
pub fn admit(id: &str, rules: Rules, trusted: &Trusted, sign_in: &SignInDevices) -> Outcome {
    let device = Device::named(id);
    let Some(descriptors) = device.descriptors() else {
        return Outcome::Connected;
    };
    let known = knows(id, trusted);
    let enrolled = identity(id).filter(|identity| sign_in.signs_in(identity));
    let approved = !rules.needs_approval(known);
    if !device.is_authorized() {
        let functions: Vec<Function> = descriptors::functions(&descriptors).collect();
        if enrolled.is_none() {
            if !approved {
                return Outcome::WaitsForApproval;
            }
            if !rules.admits_device(known, &functions) {
                return Outcome::WaitsForUnlock;
            }
        }
        device.authorize();
    }
    let mut outcome = Outcome::Connected;
    for interface in device
        .interfaces()
        .filter(|interface| !interface.is_authorized())
    {
        let Some(function) = interface.function() else {
            continue;
        };
        let drive = interface.is_drive(function);
        let signs_in = enrolled
            .as_ref()
            .is_some_and(|identity| sign_in.signs_in_with(identity, function));
        if signs_in || (approved && rules.admits_part(function, drive)) {
            interface.authorize();
        } else if !approved {
            outcome = Outcome::WaitsForApproval;
        } else if rules.waits_for_unlock(function, drive) && outcome == Outcome::Connected {
            outcome = Outcome::WaitsForUnlock;
        }
    }
    outcome
}

/// The devices connected now that aren't part of the computer, to trust
/// them where they are.
pub fn connected() -> impl Iterator<Item = Known> {
    devices()
        .filter(|id| Device::named(id).is_authorized() && !port::built_in(id))
        .filter_map(|id| Some(Known::new(identity(&id)?, &port::of(&id)?, &name(&id))))
}

/// Disconnects every device that is neither part of the computer nor
/// trusted where it is. Hubs come before what is plugged into them, so
/// what an unknown hub carried is gone with it.
pub fn turn_away_unknown(trusted: &Trusted) {
    for id in devices() {
        let device = Device::named(&id);
        if exists(&id) && device.is_authorized() && !knows(&id, trusted) {
            eprintln!(
                "Disconnected {}, which isn't trusted where it is",
                device.name()
            );
            device.deauthorize();
        }
    }
}

pub fn turn_away_drives() {
    for id in devices() {
        let device = Device::named(&id);
        for interface in device.interfaces().filter(|interface| {
            interface.is_authorized()
                && interface
                    .function()
                    .is_some_and(|function| interface.is_drive(function))
        }) {
            eprintln!("Disconnected the drive of {}", device.name());
            interface.deauthorize();
        }
    }
}
