use std::thread;

use futures_util::StreamExt;
use kestrel_toolkit::app::Sender;
use tokio::sync::mpsc::{UnboundedReceiver, UnboundedSender, unbounded_channel};
use zbus::{Connection, Proxy};

use crate::Message;

const PROFILES: &str = "org.freedesktop.UPower.PowerProfiles";
const PROFILES_PATH: &str = "/org/freedesktop/UPower/PowerProfiles";
const ACTIVE_PROFILE: &str = "ActiveProfile";
const NETWORK: &str = "org.freedesktop.NetworkManager";
const NETWORK_PATH: &str = "/org/freedesktop/NetworkManager";
const PRIMARY_CONNECTION: &str = "PrimaryConnectionType";

pub fn next_profile(profile: &str) -> &'static str {
    match profile {
        "power-saver" => "balanced",
        "balanced" => "performance",
        _ => "power-saver",
    }
}

/// What quick settings reads from the system over D-Bus.
pub struct System {
    profiles: UnboundedSender<&'static str>,
}

impl System {
    pub fn watch(messages: Sender<Message>) -> Self {
        let (profiles, wanted) = unbounded_channel();
        thread::spawn(move || {
            let runtime = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .expect("a runtime");
            runtime.block_on(async {
                let Ok(system) = Connection::system().await else {
                    return std::future::pending().await;
                };
                futures_util::join!(
                    follow(
                        &system,
                        NETWORK,
                        NETWORK_PATH,
                        PRIMARY_CONNECTION,
                        messages.clone(),
                        Message::Network
                    ),
                    follow(
                        &system,
                        PROFILES,
                        PROFILES_PATH,
                        ACTIVE_PROFILE,
                        messages.clone(),
                        Message::Profile
                    ),
                    choose(&system, wanted),
                );
            });
        });
        Self { profiles }
    }

    pub fn set_profile(&self, profile: &'static str) {
        let _ = self.profiles.send(profile);
    }
}

async fn follow(
    system: &Connection,
    name: &str,
    path: &str,
    property: &'static str,
    messages: Sender<Message>,
    message: fn(String) -> Message,
) {
    let Ok(proxy) = Proxy::new(system, name.to_owned(), path.to_owned(), name.to_owned()).await
    else {
        return;
    };
    if let Ok(value) = proxy.get_property::<String>(property).await {
        messages.send(message(value));
    }
    let mut changes = proxy.receive_property_changed::<String>(property).await;
    while let Some(change) = changes.next().await {
        if let Ok(value) = change.get().await {
            messages.send(message(value));
        }
    }
}

async fn choose(system: &Connection, mut wanted: UnboundedReceiver<&'static str>) {
    let Ok(proxy) = Proxy::new(system, PROFILES, PROFILES_PATH, PROFILES).await else {
        return;
    };
    while let Some(profile) = wanted.recv().await {
        let _ = proxy.set_property(ACTIVE_PROFILE, profile).await;
    }
}
