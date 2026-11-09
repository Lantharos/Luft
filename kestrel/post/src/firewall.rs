use std::sync::Arc;

use futures_util::StreamExt;
use zbus::Connection;
use zbus::fdo::DBusProxy;

use crate::app::App;
use crate::config::Visibility;

const FIREWALL: &str = "com.lantharos.Firewall1";
const FIREWALL_PATH: &str = "/com/lantharos/Firewall1";

/// Tells the firewall whether devices on home networks may reach Post, whenever that changes and whenever the firewall
/// starts again.
pub async fn run(app: Arc<App>, system: Connection) {
    let Ok(bus) = DBusProxy::new(&system).await else { return };
    let Ok(mut restarts) = bus.receive_name_owner_changed_with_args(&[(0, FIREWALL)]).await else { return };
    let mut changes = app.config.subscribe();
    let mut told = None;
    loop {
        let open = app.visibility() != Visibility::NoOne;
        if told != Some(open) {
            match tell(&system, open).await {
                Ok(()) => told = Some(open),
                Err(error) => eprintln!("kestrel-post: couldn't tell the firewall: {error}"),
            }
        }
        tokio::select! {
            changed = changes.changed() => if changed.is_err() { return },
            restarted = restarts.next() => match restarted {
                Some(_) => told = None,
                None => return,
            },
        }
    }
}

async fn tell(system: &Connection, open: bool) -> zbus::Result<()> {
    system.call_method(Some(FIREWALL), FIREWALL_PATH, Some(FIREWALL), "SetPostOpen", &open).await.map(drop)
}
