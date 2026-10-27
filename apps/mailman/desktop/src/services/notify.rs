use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, OnceLock};

use futures_util::StreamExt;
use luft_app::{Events, dbus};
use parking_lot::Mutex;
use sabine::SabineProcessHandle;
use serde::Serialize;
use specta::Type;
use zbus::{Proxy, Variant};

use crate::APP_ID;
use crate::events::OPEN_THREAD;
use crate::store::Notable;

const DESTINATION: &str = "org.freedesktop.Notifications";
const PATH: &str = "/org/freedesktop/Notifications";
const DEFAULT_ACTION: &str = "default";
const NORMAL_URGENCY: u8 = 1;
const NEW_MAIL_SOUND: &str = "message-new-email";
const SENT_SOUND: &str = "message-sent-email";
const KESTREL: &str = "com.lantharos.Kestrel";
const SOUNDS_PATH: &str = "/com/lantharos/Kestrel/Sounds";
const SOUNDS: &str = "com.lantharos.Kestrel.Sounds";

struct Activation {
    thread: Option<i64>,
    token: Option<String>,
}

#[derive(Serialize, Type)]
pub struct Opening {
    thread: Option<i64>,
}

#[derive(Clone, Default)]
pub struct Notifier {
    shown: Arc<Mutex<HashMap<u32, Activation>>>,
    opening: Arc<Mutex<Option<Opening>>>,
    process: Arc<OnceLock<SabineProcessHandle>>,
    focused: Arc<AtomicBool>,
    enabled: Arc<AtomicBool>,
}

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, DESTINATION, PATH, DESTINATION)
        .await
        .map_err(dbus::failed)
}

async fn notify(title: &str, body: &str, sound: Option<&str>) -> Result<u32, String> {
    let mut hints = HashMap::from([
        ("desktop-entry", Variant::from(APP_ID)),
        ("urgency", Variant::from(NORMAL_URGENCY)),
        ("category", Variant::from("email.arrived")),
    ]);
    if let Some(sound) = sound {
        hints.insert("sound-name", Variant::from(sound));
    }
    proxy()
        .await?
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
        .await
        .map_err(dbus::failed)
}

async fn play_sent_sound() -> Result<(), String> {
    Proxy::new(dbus::session().await?, KESTREL, SOUNDS_PATH, SOUNDS)
        .await
        .map_err(dbus::failed)?
        .call::<_, _, ()>("Play", &(SENT_SOUND,))
        .await
        .map_err(dbus::failed)
}

impl Notifier {
    pub fn attach(&self, process: SabineProcessHandle) {
        let _ = self.process.set(process);
    }

    pub fn take_opening(&self) -> Option<Opening> {
        self.opening.lock().take()
    }

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
        self.present(&title, &body, thread, Some(NEW_MAIL_SOUND));
    }

    pub fn sent(&self) {
        luft_app::spawn(async {
            let _ = play_sent_sound().await;
        });
    }

    pub fn show(&self, title: &str, body: &str, thread: Option<i64>) {
        self.present(title, body, thread, None);
    }

    fn present(&self, title: &str, body: &str, thread: Option<i64>, sound: Option<&'static str>) {
        if !self.enabled.load(Ordering::Relaxed) {
            return;
        }
        let shown = self.shown.clone();
        let (title, body) = (title.to_owned(), body.to_owned());
        luft_app::spawn(async move {
            if let Ok(id) = notify(&title, &body, sound).await {
                shown.lock().insert(
                    id,
                    Activation {
                        thread,
                        token: None,
                    },
                );
            }
        });
    }

    fn open(&self, activation: Activation, events: &Events) {
        *self.opening.lock() = Some(Opening {
            thread: activation.thread,
        });
        events.emit(OPEN_THREAD, ());
        if let Some(process) = self.process.get() {
            process.present(activation.token);
        }
    }

    pub fn watch(&self, events: Events) {
        let notifier = self.clone();
        let shown = self.shown.clone();
        luft_app::spawn(async move {
            let Ok(proxy) = proxy().await else { return };
            let Ok(mut signals) = proxy.receive_all_signals().await else {
                return;
            };
            while let Some(signal) = signals.next().await {
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
                            notifier.open(activation, &events);
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
