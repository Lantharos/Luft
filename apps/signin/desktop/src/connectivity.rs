use futures_util::StreamExt;
use luft_app::{Events, dbus};
use serde_json::Value;
use zbus::Proxy;

const SERVICE: &str = "org.freedesktop.NetworkManager";
const PATH: &str = "/org/freedesktop/NetworkManager";
const FULL: u32 = 4;
const ONLINE: &str = "signin.online";

async fn network_manager() -> Option<Proxy<'static>> {
    let connection = dbus::system().await.ok()?;
    Proxy::new(connection, SERVICE, PATH, SERVICE).await.ok()
}

pub fn watch(events: Events) {
    luft_app::spawn(async move {
        let Some(manager) = network_manager().await else {
            return;
        };
        let mut changes = manager
            .receive_property_changed::<u32>("Connectivity")
            .await;
        if manager.get_property::<u32>("Connectivity").await == Ok(FULL) {
            events.emit(ONLINE, ());
        }
        while let Some(change) = changes.next().await {
            if change.get().await == Ok(FULL) {
                events.emit(ONLINE, ());
            }
        }
    });
}

pub async fn check(events: Events, _: Value) -> Result<(), String> {
    if let Some(manager) = network_manager().await
        && manager.call::<_, _, u32>("CheckConnectivity", &()).await == Ok(FULL)
    {
        events.emit(ONLINE, ());
    }
    Ok(())
}
