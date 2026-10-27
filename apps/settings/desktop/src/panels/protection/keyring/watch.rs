use std::future::ready;

use futures_util::StreamExt;
use luft_app::Events;
use luft_app::dbus::{self, objects};
use sabine::BridgeEvent;
use zbus::fdo::PropertiesChanged;
use zbus::message::Message;

use super::bus::{ACCESS, PATH, PROPERTIES, SERVICE, SSH, STATUS};
use super::snapshot::{self, Keyring};

pub const CHANGED: BridgeEvent<Keyring> = BridgeEvent::new("keyring.changed");

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

pub fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(session) = dbus::session().await else {
            return;
        };
        let Ok(signals) = objects::signals(session, SERVICE, PATH).await else {
            return;
        };
        let mut changes =
            signals.filter(|message| ready(message.as_ref().is_ok_and(concerns_keyring)));
        while objects::settle(&mut changes).await {
            if let Ok(Some(keyring)) = snapshot::read().await {
                events.emit(CHANGED, keyring);
            }
        }
    });
}
