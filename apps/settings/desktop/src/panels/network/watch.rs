use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Sender};
use std::sync::{LazyLock, Mutex, OnceLock};

use serde::Serialize;
use zbus::Message;
use zbus::blocking::MessageIterator;
use zbus::message::Type;

use crate::dbus::objects::{self, failed};
use super::{CONNECTION, DEVICE, MANAGER_PATH, SERVICE, airplane, saved, snapshot};
use crate::dbus;
use crate::events::Events;

pub const CHANGED: &str = "network.changed";
pub const FAILED: &str = "network.failed";

const DEVICE_FAILED: u32 = 120;
const DEVICE_ACTIVATED: u32 = 100;
const REASON_NO_SECRETS: u32 = 7;
const REASON_SUPPLICANT_DISCONNECT: u32 = 8;
const ACTIVE_DEACTIVATED: u32 = 4;
const TUNNEL_FAILURE_REASONS: [u32; 6] = [5, 6, 7, 8, 9, 10];

#[derive(Serialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
enum Reason {
    Password,
    Other,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Failure {
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
    let (changes, refreshes) = mpsc::channel();
    airplane::watch(changes.clone());
    let signal_events = events.clone();
    std::thread::spawn(move || {
        if let Err(error) = listen(&signal_events, &changes) {
            eprintln!("network: {error}");
        }
    });
    std::thread::spawn(move || {
        while objects::settle(&refreshes) {
            if !OPEN.load(Ordering::Relaxed) {
                continue;
            }
            if let Ok(network) = super::network() {
                events.emit(CHANGED, network);
            }
        }
    });
}

fn listen(events: &Events, changes: &Sender<()>) -> Result<(), String> {
    let rule = zbus::MatchRule::builder()
        .msg_type(Type::Signal)
        .sender(SERVICE)
        .map_err(failed)?
        .path_namespace(MANAGER_PATH)
        .map_err(failed)?
        .build();
    for message in MessageIterator::for_match_rule(rule, dbus::system()?, None).map_err(failed)? {
        let Ok(message) = message else {
            continue;
        };
        inspect(events, &message);
        if changes.send(()).is_err() {
            break;
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
        }
        DEVICE_FAILED => {
            if let Some(pending) = take_pending(device) {
                let _ = saved::delete(&pending.connection);
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
