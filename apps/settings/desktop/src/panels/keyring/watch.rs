use std::sync::mpsc::{self, Sender};

use luft_app::Events;
use luft_app::dbus::{self, objects};
use zbus::MatchRule;
use zbus::blocking::MessageIterator;
use zbus::fdo::PropertiesChanged;
use zbus::message::{Message, Type as MessageType};

use super::bus::{ACCESS, PATH, PROPERTIES, SERVICE, SSH, STATUS};
use super::snapshot;

pub const CHANGED: &str = "keyring.changed";

fn concerns_keyring(message: &Message) -> bool {
    let header = message.header();
    let interface = header.interface().map(|name| name.as_str());
    let member = header.member().map(|name| name.as_str());
    match (interface, member) {
        (Some(ACCESS | SSH), Some("Changed")) => true,
        (Some(PROPERTIES), Some("PropertiesChanged")) => {
            PropertiesChanged::from_message(message.clone()).is_some_and(|signal| {
                signal
                    .args()
                    .is_ok_and(|args| matches!(args.interface_name.as_str(), STATUS | SSH))
            })
        }
        _ => false,
    }
}

fn listen(changes: Sender<()>) {
    let Ok(session) = dbus::session() else {
        return;
    };
    let Ok(rule) = MatchRule::builder()
        .msg_type(MessageType::Signal)
        .sender(SERVICE)
        .and_then(|rule| rule.path(PATH))
        .map(|rule| rule.build())
    else {
        return;
    };
    let Ok(messages) = MessageIterator::for_match_rule(rule, session, None) else {
        return;
    };
    for message in messages.flatten() {
        if concerns_keyring(&message) && changes.send(()).is_err() {
            return;
        }
    }
}

pub fn watch(events: Events) {
    let (changes, settled) = mpsc::channel();
    std::thread::spawn(move || listen(changes));
    std::thread::spawn(move || {
        while objects::settle(&settled) {
            if let Ok(Some(keyring)) = snapshot::read() {
                events.emit(CHANGED, keyring);
            }
        }
    });
}
