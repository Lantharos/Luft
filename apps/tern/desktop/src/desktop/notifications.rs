use std::collections::HashMap;
use std::sync::Arc;

use luft_app::{Events, dbus};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use zbus::blocking::Proxy;
use zbus::zvariant::Value;

use crate::APP_ID;
use crate::events::NOTIFICATION_ACTIVATED;

const DESTINATION: &str = "org.freedesktop.Notifications";
const PATH: &str = "/org/freedesktop/Notifications";
const INTERFACE: &str = "org.freedesktop.Notifications";
const DEFAULT_ACTION: &str = "default";
const NORMAL_URGENCY: u8 = 1;

#[derive(Deserialize)]
pub struct Notification {
    tab: String,
    title: String,
    body: String,
}

#[derive(Clone, Serialize)]
struct Activation {
    tab: String,
    token: Option<String>,
}

#[derive(Clone, Default)]
pub struct Notifications {
    shown: Arc<Mutex<HashMap<u32, Activation>>>,
}

impl Notifications {
    pub fn show(&self, notification: Notification) -> Result<(), String> {
        let hints = HashMap::from([
            ("desktop-entry", Value::from(APP_ID)),
            ("urgency", Value::from(NORMAL_URGENCY)),
        ]);
        let id: u32 = proxy()?
            .call(
                "Notify",
                &(
                    "Tern",
                    0u32,
                    APP_ID,
                    notification.title.as_str(),
                    notification.body.as_str(),
                    vec![DEFAULT_ACTION, "Show"],
                    hints,
                    -1i32,
                ),
            )
            .map_err(|error| error.to_string())?;
        self.shown.lock().insert(
            id,
            Activation {
                tab: notification.tab,
                token: None,
            },
        );
        Ok(())
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
                let Some(member) = header.member() else {
                    continue;
                };
                match member.as_str() {
                    "ActivationToken" => {
                        if let Ok((id, token)) = signal.body().deserialize::<(u32, String)>()
                            && let Some(activation) = shown.lock().get_mut(&id)
                        {
                            activation.token = Some(token);
                        }
                    }
                    "ActionInvoked" => {
                        if let Ok((id, action)) = signal.body().deserialize::<(u32, String)>()
                            && action == DEFAULT_ACTION
                            && let Some(activation) = shown.lock().remove(&id)
                        {
                            events.emit(NOTIFICATION_ACTIVATED, activation);
                        }
                    }
                    "NotificationClosed" => {
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

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session()?, DESTINATION, PATH, INTERFACE).map_err(|error| error.to_string())
}
