//! Devices Pigeon finds nearby, so files can be sent to them from the context menu while it runs.

use std::sync::Once;

use futures_util::{StreamExt, stream};
use luft_app::{Commands, Empty, Events};
use luft_dbus_macros::introspect;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::{Connection, proxy};

use crate::app::events::NEARBY_CHANGED;

static WATCH: Once = Once::new();

#[introspect]
#[proxy(
    interface = "com.lantharos.Pigeon",
    default_service = "com.lantharos.Pigeon",
    default_path = "/com/lantharos/Pigeon"
)]
trait Pigeon {
    #[zbus(property)]
    fn devices(&self) -> zbus::Result<Vec<(String, String, String)>>;

    fn send(&self, device: &str, paths: &[String]) -> zbus::Result<()>;

    fn scan(&self) -> zbus::Result<()>;
}

#[derive(Clone, Serialize, Type)]
pub struct NearbyDevice {
    id: String,
    name: String,
    /// `mobile`, `desktop`, `web`, `headless` or `server`.
    kind: String,
}

#[derive(Deserialize, Type)]
struct Sending {
    device: String,
    paths: Vec<String>,
}

async fn pigeon() -> zbus::Result<PigeonProxy<'static>> {
    PigeonProxy::new(&Connection::session().await?).await
}

async fn current(proxy: &PigeonProxy<'_>) -> Vec<NearbyDevice> {
    let running = proxy.inner().get_property::<Vec<(String, String, String)>>("Devices").await;
    running
        .unwrap_or_default()
        .into_iter()
        .map(|(id, name, kind)| NearbyDevice { id, name, kind })
        .collect()
}

/// Follows Pigeon coming and going and its devices changing, from the first time the list is asked for.
async fn watch(events: Events) -> zbus::Result<()> {
    let proxy = pigeon().await?;
    let owners = proxy.inner().receive_owner_changed().await?.map(|owner| owner.is_some());
    let changes = proxy.receive_devices_changed().await.map(|_| true);
    let mut running = stream::select(owners, changes);
    while let Some(running) = running.next().await {
        let devices = if running { current(&proxy).await } else { Vec::new() };
        events.emit(NEARBY_CHANGED, devices);
    }
    Ok(())
}

async fn devices(events: Events, Empty {}: Empty) -> Result<Vec<NearbyDevice>, String> {
    WATCH.call_once(|| {
        luft_app::spawn(async move {
            let _ = watch(events).await;
        });
    });
    let proxy = pigeon().await.map_err(|error| error.to_string())?;
    Ok(current(&proxy).await)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("nearby_devices", events, devices)
        .command_async("send_to_device", |Sending { device, paths }| async move {
            let proxy = pigeon().await.map_err(|error| error.to_string())?;
            proxy.send(&device, &paths).await.map_err(|error| error.to_string())
        })
        .command_async("look_for_devices", |Empty {}| async move {
            let proxy = pigeon().await.map_err(|error| error.to_string())?;
            proxy.scan().await.map_err(|error| error.to_string())
        })
}
