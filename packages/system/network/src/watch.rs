use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{LazyLock, Mutex, OnceLock};

use futures_util::{StreamExt, stream};
use luft_app::Events;
use luft_app::dbus;
use luft_app::dbus::objects;
use sabine::BridgeEvent;
use serde::Serialize;
use specta::Type;
use zbus::Message;

use super::{CONNECTION, DEVICE, MANAGER_PATH, Network, SERVICE, airplane, saved, snapshot};

pub const CHANGED: BridgeEvent<Network> = BridgeEvent::new("network.changed");
pub const FAILED: BridgeEvent<Failure> = BridgeEvent::new("network.failed");

const DEVICE_FAILED: u32 = 120;
const DEVICE_ACTIVATED: u32 = 100;
const REASON_NO_SECRETS: u32 = 7;
const REASON_SUPPLICANT_DISCONNECT: u32 = 8;
const ACTIVE_DEACTIVATED: u32 = 4;
const TUNNEL_FAILURE_REASONS: [u32; 6] = [5, 6, 7, 8, 9, 10];

#[derive(Serialize, Clone, Copy, Type)]
#[serde(rename_all = "lowercase")]
pub enum Reason {
    Password,
    Other,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Failure {
    path: String,
    name: String,
    reason: Reason,
}

struct Pending {
    device: String,
    connection: String,
}

static OPEN: AtomicBool = AtomicBool::new(false);
static STARTED: OnceLock<()> = OnceLock::new();
static NAMES: LazyLock<Mutex<HashMap<String, String>>> = LazyLock::new(Mutex::default);
static PENDING: Mutex<Option<Pending>> = Mutex::new(None);

pub fn open(events: &Events) {
    OPEN.store(true, Ordering::Relaxed);
    STARTED.get_or_init(|| start(events.clone()));
}

pub fn close() {
    OPEN.store(false, Ordering::Relaxed);
}

pub fn expect(device: String, connection: String) {
    *PENDING.lock().unwrap() = Some(Pending { device, connection });
}

pub fn remember(objects: &objects::Objects) {
    *NAMES.lock().unwrap() = snapshot::names(objects);
}

fn start(events: Events) {
    luft_app::spawn(async move {
        if let Err(error) = listen(&events).await {
            eprintln!("network: {error}");
        }
    });
}

async fn listen(events: &Events) -> Result<(), String> {
    let messages = objects::signals(dbus::system().await?, SERVICE, MANAGER_PATH).await?;
    let manager = messages.map(|message| {
        if let Ok(message) = message {
            inspect(events, &message);
        }
    });
    let mut changes = match airplane::changes().await {
        Some(airplane) => stream::select(manager, airplane).boxed(),
        None => manager.boxed(),
    };
    while objects::settle(&mut changes).await {
        if !OPEN.load(Ordering::Relaxed) {
            continue;
        }
        if let Ok(network) = super::network().await {
            events.emit(CHANGED, network);
        }
    }
    Ok(())
}

fn inspect(events: &Events, message: &Message) {
    let header = message.header();
    let (Some(interface), Some(member), Some(path)) =
        (header.interface(), header.member(), header.path())
    else {
        return;
    };
    let path = path.as_str();
    match (interface.as_str(), member.as_str()) {
        (DEVICE, "StateChanged") => {
            if let Ok((state, _, reason)) = message.body().deserialize::<(u32, u32, u32)>() {
                device_changed(events, path, state, reason);
            }
        }
        (super::ACTIVE, "StateChanged") => {
            if let Ok((state, reason)) = message.body().deserialize::<(u32, u32)>()
                && state == ACTIVE_DEACTIVATED
                && TUNNEL_FAILURE_REASONS.contains(&reason)
                && let Some(name) = name(path)
            {
                report(events, path, name, Reason::Other);
            }
        }
        (CONNECTION, "Updated" | "Removed") => saved::invalidate(path),
        _ => {}
    }
}

fn device_changed(events: &Events, device: &str, state: u32, reason: u32) {
    match state {
        DEVICE_ACTIVATED => {
            take_pending(device);
            saved::invalidate_all();
        }
        DEVICE_FAILED => {
            if let Some(pending) = take_pending(device) {
                luft_app::spawn(async move {
                    let _ = saved::delete(&pending.connection).await;
                });
            }
            let reason = match reason {
                REASON_NO_SECRETS | REASON_SUPPLICANT_DISCONNECT => Reason::Password,
                _ => Reason::Other,
            };
            report(events, device, name(device).unwrap_or_default(), reason);
        }
        _ => {}
    }
}

fn take_pending(device: &str) -> Option<Pending> {
    PENDING
        .lock()
        .unwrap()
        .take_if(|pending| pending.device == device)
}

fn name(path: &str) -> Option<String> {
    NAMES.lock().unwrap().get(path).cloned()
}

fn report(events: &Events, path: &str, name: String, reason: Reason) {
    events.emit(
        FAILED,
        Failure {
            path: path.to_owned(),
            name,
            reason,
        },
    );
}
