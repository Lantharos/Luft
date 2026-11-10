use std::collections::HashSet;
use std::sync::Arc;

use futures_util::StreamExt;
use zbus::Connection;
use zbus::fdo::{DBusProxy, PropertiesProxy};
use zbus::names::InterfaceName;

use crate::app::App;
use crate::config::Visibility;

const FIREWALL: &str = "com.lantharos.Firewall1";
const FIREWALL_PATH: &str = "/com/lantharos/Firewall1";
const INTERFACE: InterfaceName<'static> = InterfaceName::from_static_str_unchecked(FIREWALL);

pub async fn run(app: Arc<App>, system: Connection) {
    let Ok(bus) = DBusProxy::new(&system).await else { return };
    let Ok(mut restarts) = bus.receive_name_owner_changed_with_args(&[(0, FIREWALL)]).await else { return };
    let Ok(firewall) = properties(&system).await else { return };
    let Ok(mut networks) = firewall.receive_properties_changed().await else { return };
    let mut changes = app.config.subscribe();
    let mut told = None;
    loop {
        let home = home_interfaces(&firewall).await.unwrap_or_default();
        app.home_interfaces.send_if_modified(|known| *known != home && {
            *known = home;
            true
        });
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
            Some(_) = networks.next() => {}
        }
    }
}

async fn properties(system: &Connection) -> zbus::Result<PropertiesProxy<'static>> {
    PropertiesProxy::builder(system).destination(FIREWALL).path(FIREWALL_PATH).build().await
}

async fn home_interfaces(firewall: &PropertiesProxy<'_>) -> zbus::Result<HashSet<String>> {
    let interfaces = Vec::<String>::try_from(firewall.get(INTERFACE, "HomeInterfaces").await?)?;
    Ok(interfaces.into_iter().collect())
}

async fn tell(system: &Connection, open: bool) -> zbus::Result<()> {
    system.call_method(Some(FIREWALL), FIREWALL_PATH, Some(FIREWALL), "SetPostOpen", &open).await.map(drop)
}
