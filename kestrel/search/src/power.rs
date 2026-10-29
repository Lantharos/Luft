use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::Sender;

use futures_util::StreamExt;
use luft_dbus_macros::introspect;
use zbus::{Connection, proxy};

use crate::index::Wake;

#[introspect]
#[proxy(
    interface = "org.freedesktop.UPower",
    default_service = "org.freedesktop.UPower",
    default_path = "/org/freedesktop/UPower"
)]
trait UPower {
    #[zbus(property)]
    fn on_battery(&self) -> zbus::Result<bool>;
}

pub async fn follow(on_battery: Arc<AtomicBool>, wake: Sender<Wake>) -> zbus::Result<()> {
    let system = Connection::system().await?;
    let upower = UPowerProxy::new(&system).await?;
    let mut changes = upower.receive_on_battery_changed().await;
    on_battery.store(
        upower.on_battery().await.unwrap_or(false),
        Ordering::Relaxed,
    );
    while let Some(change) = changes.next().await {
        let now = change.get().await.unwrap_or(false);
        if on_battery.swap(now, Ordering::Relaxed) != now && !now {
            let _ = wake.send(Wake::Power);
        }
    }
    Ok(())
}
