use std::sync::mpsc;

use luft_app::Events;
use luft_app::dbus;
use luft_app::dbus::objects::{self, failed};
use zbus::blocking::MessageIterator;
use zbus::message::Type;

use super::{ROOT, SERVICE, snapshot};

pub const CHANGED: &str = "disks.changed";

pub fn start(events: Events) {
    let (changes, refreshes) = mpsc::channel();
    std::thread::spawn(move || {
        if let Err(error) = forward(&changes) {
            eprintln!("disks: {error}");
        }
    });
    std::thread::spawn(move || {
        while objects::settle(&refreshes) {
            if let Ok(objects) = super::objects() {
                events.emit(CHANGED, snapshot::build(&objects));
            }
        }
    });
}

fn forward(changes: &mpsc::Sender<()>) -> Result<(), String> {
    let rule = zbus::MatchRule::builder()
        .msg_type(Type::Signal)
        .sender(SERVICE)
        .map_err(failed)?
        .path_namespace(ROOT)
        .map_err(failed)?
        .build();
    for _ in MessageIterator::for_match_rule(rule, dbus::system()?, None).map_err(failed)? {
        if changes.send(()).is_err() {
            break;
        }
    }
    Ok(())
}
