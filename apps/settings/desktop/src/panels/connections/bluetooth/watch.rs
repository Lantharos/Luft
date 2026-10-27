use std::pin::pin;
use std::sync::OnceLock;
use std::sync::atomic::{AtomicBool, Ordering};

use futures_util::{Stream, StreamExt, stream};
use luft_app::Events;
use luft_app::dbus::{self, failed, objects};
use sabine::BridgeEvent;
use zbus::message::Type;
use zbus::{MatchRule, MessageStream};

use super::snapshot::Bluetooth;
use super::{SERVICE, actions, rfkill};

pub const CHANGED: BridgeEvent<Bluetooth> = BridgeEvent::new("bluetooth.changed");

const OBJECT_MANAGER: &str = "org.freedesktop.DBus.ObjectManager";

static OPEN: AtomicBool = AtomicBool::new(false);
static STARTED: OnceLock<()> = OnceLock::new();

pub fn open(events: &Events) {
    OPEN.store(true, Ordering::Relaxed);
    STARTED.get_or_init(|| start(events.clone()));
}

pub fn close() {
    OPEN.store(false, Ordering::Relaxed);
}

async fn bluez() -> Result<impl Stream<Item = ()>, String> {
    let system = dbus::system().await?;
    let devices = objects::signals(system, SERVICE, "/org/bluez").await?;
    let rule = MatchRule::builder()
        .msg_type(Type::Signal)
        .sender(SERVICE)
        .interface(OBJECT_MANAGER)
        .path("/")
        .build()
        .map_err(failed)?;
    let interfaces = MessageStream::for_match_rule(rule, system, None)
        .await
        .map_err(failed)?;
    Ok(stream::select(devices, interfaces).map(drop))
}

fn start(events: Events) {
    luft_app::spawn(async move {
        let bluez = bluez()
            .await
            .inspect_err(|error| eprintln!("bluetooth: {error}"))
            .ok();
        let mut changes = pin!(stream::select(
            stream::iter(bluez).flatten(),
            rfkill::changes()
        ));
        while objects::settle(&mut changes).await {
            if !OPEN.load(Ordering::Relaxed) {
                continue;
            }
            if let Ok(bluetooth) = super::bluetooth().await {
                if let Some(adapter) = &bluetooth.adapter {
                    actions::browse(adapter).await;
                }
                events.emit(CHANGED, bluetooth);
            }
        }
    });
}
