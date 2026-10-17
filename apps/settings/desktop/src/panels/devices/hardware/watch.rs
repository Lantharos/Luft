use std::pin::pin;

use futures_util::{Stream, StreamExt, stream};
use luft_app::Events;
use luft_app::dbus::{self, failed, objects};
use zbus::message::Type;
use zbus::{MatchRule, MessageStream};

use super::{detect, pointers};
use crate::panels::connections::bluetooth::rfkill;

const CHANGED: &str = "hardware.changed";
const BUS: &str = "org.freedesktop.DBus";
const BLUEZ: &str = "org.bluez";
const OBJECT_MANAGER: &str = "org.freedesktop.DBus.ObjectManager";
const UPOWER: &str = "/org/freedesktop/UPower";

fn rules() -> zbus::Result<[MatchRule<'static>; 3]> {
    let signals = || MatchRule::builder().msg_type(Type::Signal);
    Ok([
        signals()
            .sender(BUS)
            .member("NameOwnerChanged")
            .arg(0, BLUEZ)
            .build()?,
        signals()
            .sender(BLUEZ)
            .interface(OBJECT_MANAGER)
            .path("/")
            .build()?,
        signals().path_namespace(UPOWER).build()?,
    ])
}

async fn signals() -> Result<impl Stream<Item = ()>, String> {
    let system = dbus::system().await?;
    let subscribe = async |rule| {
        MessageStream::for_match_rule(rule, system, None)
            .await
            .map_err(failed)
    };
    let [owner, interfaces, power] = rules().map_err(failed)?;
    let bluez = stream::select(subscribe(owner).await?, subscribe(interfaces).await?);
    Ok(stream::select(bluez, subscribe(power).await?).map(drop))
}

pub fn start(events: Events) {
    luft_app::spawn(async move {
        let signals = signals()
            .await
            .inspect_err(|error| eprintln!("hardware: {error}"))
            .ok();
        let local = stream::select(pointers::changes(), rfkill::changes());
        let mut changes = pin!(stream::select(stream::iter(signals).flatten(), local));
        let mut known = detect().await;
        while objects::settle(&mut changes).await {
            let current = detect().await;
            if current != known {
                known = current;
                events.emit(CHANGED, current);
            }
        }
    });
}
