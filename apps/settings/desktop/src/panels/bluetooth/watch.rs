use std::sync::OnceLock;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{self, Sender};

use luft_app::Events;
use luft_app::dbus;
use luft_app::dbus::objects::{self, failed};
use zbus::blocking::MessageIterator;
use zbus::message::Type;

use super::{SERVICE, actions, rfkill};

pub const CHANGED: &str = "bluetooth.changed";

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

fn rules() -> zbus::Result<[zbus::MatchRule<'static>; 2]> {
    let signals = || {
        zbus::MatchRule::builder()
            .msg_type(Type::Signal)
            .sender(SERVICE)
    };
    Ok([
        signals()?.path_namespace("/org/bluez")?.build(),
        signals()?.interface(OBJECT_MANAGER)?.path("/")?.build(),
    ])
}

fn start(events: Events) {
    let (changes, refreshes) = mpsc::channel();
    rfkill::watch(changes.clone());
    for rule in rules().into_iter().flatten() {
        let changes = changes.clone();
        std::thread::spawn(move || {
            if let Err(error) = forward(rule, &changes) {
                eprintln!("bluetooth: {error}");
            }
        });
    }
    std::thread::spawn(move || {
        while objects::settle(&refreshes) {
            if !OPEN.load(Ordering::Relaxed) {
                continue;
            }
            if let Ok(bluetooth) = super::bluetooth() {
                if let Some(adapter) = &bluetooth.adapter {
                    actions::browse(adapter);
                }
                events.emit(CHANGED, bluetooth);
            }
        }
    });
}

fn forward(rule: zbus::MatchRule<'static>, changes: &Sender<()>) -> Result<(), String> {
    for _ in MessageIterator::for_match_rule(rule, dbus::system()?, None).map_err(failed)? {
        if changes.send(()).is_err() {
            break;
        }
    }
    Ok(())
}
