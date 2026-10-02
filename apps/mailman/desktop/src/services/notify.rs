use std::collections::HashMap;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

use luft_app::{Events, dbus};
use parking_lot::Mutex;
use serde::Serialize;
use zbus::blocking::Proxy;
use zbus::zvariant::Value;

use crate::APP_ID;
use crate::events::OPEN_THREAD;
use crate::store::Notable;

const DESTINATION: &str = "org.freedesktop.Notifications";
const PATH: &str = "/org/freedesktop/Notifications";
const DEFAULT_ACTION: &str = "default";
const LOW_URGENCY: u8 = 0;

#[derive(Clone, Serialize)]
struct Activation {
    thread: Option<i64>,
    token: Option<String>,
}

#[derive(Clone, Default)]
pub struct Notifier {
    shown: Arc<Mutex<HashMap<u32, Activation>>>,
    focused: Arc<AtomicBool>,
    enabled: Arc<AtomicBool>,
}

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session()?, DESTINATION, PATH, DESTINATION).map_err(|error| error.to_string())
}

impl Notifier {
    pub fn set_focused(&self, focused: bool) {
        self.focused.store(focused, Ordering::Relaxed);
    }

    pub fn set_enabled(&self, enabled: bool) {
        self.enabled.store(enabled, Ordering::Relaxed);
    }

    pub fn new_mail(&self, notable: &[Notable]) {
        if notable.is_empty()
            || self.focused.load(Ordering::Relaxed)
            || !self.enabled.load(Ordering::Relaxed)
        {
            return;
        }
        let (title, body, thread) = match notable {
            [only] => (only.sender.clone(), only.subject.clone(), Some(only.thread)),
            many => {
                let mut senders: Vec<&str> =
                    many.iter().map(|message| message.sender.as_str()).collect();
                senders.dedup();
                (
                    format!("{} new messages", many.len()),
                    senders.join(", "),
                    None,
                )
            }
        };
        self.show(&title, &body, thread);
    }

    pub fn show(&self, title: &str, body: &str, thread: Option<i64>) {
        if !self.enabled.load(Ordering::Relaxed) {
            return;
        }
        let hints = HashMap::from([
            ("desktop-entry", Value::from(APP_ID)),
            ("urgency", Value::from(LOW_URGENCY)),
            ("category", Value::from("email.arrived")),
        ]);
        let shown: Result<u32, String> = proxy().and_then(|proxy| {
            proxy
                .call(
                    "Notify",
                    &(
                        "Mailman",
                        0u32,
                        APP_ID,
                        title,
                        body,
                        vec![DEFAULT_ACTION, "Open"],
                        hints,
                        -1i32,
                    ),
                )
                .map_err(|error| error.to_string())
        });
        if let Ok(id) = shown {
            self.shown.lock().insert(
                id,
                Activation {
                    thread,
                    token: None,
                },
            );
        }
    }

    pub fn watch(&self, events: Events) {
        let shown = self.shown.clone();
        std::thread::spawn(move || {
            let Ok(signals) = proxy().and_then(|proxy| {
                proxy
                    .receive_all_signals()
                    .map_err(|error| error.to_string())
            }) else {
                return;
            };
            for signal in signals {
                let header = signal.header();
                match header.member().map(|member| member.as_str()) {
                    Some("ActivationToken") => {
                        if let Ok((id, token)) = signal.body().deserialize::<(u32, String)>()
                            && let Some(activation) = shown.lock().get_mut(&id)
                        {
                            activation.token = Some(token);
                        }
                    }
                    Some("ActionInvoked") => {
                        if let Ok((id, action)) = signal.body().deserialize::<(u32, String)>()
                            && action == DEFAULT_ACTION
                            && let Some(activation) = shown.lock().remove(&id)
                        {
                            events.emit(OPEN_THREAD, activation);
                        }
                    }
                    Some("NotificationClosed") => {
                        if let Ok((id, _)) = signal.body().deserialize::<(u32, u32)>() {
                            shown.lock().remove(&id);
                        }
                    }
                    _ => {}
                }
            }
        });
    }
}
