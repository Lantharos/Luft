use std::sync::mpsc::{self, Sender};

use luft_app::Events;
use luft_app::dbus;
use luft_app::dbus::objects::{self, failed};
use zbus::MatchRule;
use zbus::blocking::MessageIterator;
use zbus::message::Type;

use super::{detect, pointers};
use crate::panels::bluetooth::rfkill;

const CHANGED: &str = "hardware.changed";
const BUS: &str = "org.freedesktop.DBus";
const BLUEZ: &str = "org.bluez";
const OBJECT_MANAGER: &str = "org.freedesktop.DBus.ObjectManager";
const UPOWER: &str = "/org/freedesktop/UPower";

fn rules() -> zbus::Result<[MatchRule<'static>; 3]> {
    let signals = || MatchRule::builder().msg_type(Type::Signal);
    Ok([
        signals()
            .sender(BUS)?
            .member("NameOwnerChanged")?
            .arg(0, BLUEZ)?
            .build(),
        signals()
            .sender(BLUEZ)?
            .interface(OBJECT_MANAGER)?
            .path("/")?
            .build(),
        signals().path_namespace(UPOWER)?.build(),
    ])
}

pub fn start(events: Events) {
    let (changes, settled) = mpsc::channel();
    pointers::watch(changes.clone());
    rfkill::watch(changes.clone());
    match rules() {
        Ok(rules) => {
            for rule in rules {
                let changes = changes.clone();
                std::thread::spawn(move || {
                    if let Err(error) = forward(rule, &changes) {
                        eprintln!("hardware: {error}");
                    }
                });
            }
        }
        Err(error) => eprintln!("hardware: {error}"),
    }
    std::thread::spawn(move || {
        let mut known = detect();
        while objects::settle(&settled) {
            let current = detect();
            if current != known {
                known = current;
                events.emit(CHANGED, current);
            }
        }
    });
}

fn forward(rule: MatchRule<'static>, changes: &Sender<()>) -> Result<(), String> {
    for _ in MessageIterator::for_match_rule(rule, dbus::system()?, None).map_err(failed)? {
        if changes.send(()).is_err() {
            break;
        }
    }
    Ok(())
}
