use luft_dbus_macros::introspect;
use zbus::proxy::CacheProperties;
use zbus::{Connection, proxy};

const SSH: u16 = 22;
const TCP: &str = "tcp";
const ANYWHERE: &str = "anywhere";
const HOME: &str = "home";

#[introspect]
#[proxy(
    interface = "com.lantharos.Firewall1",
    default_service = "com.lantharos.Firewall1",
    default_path = "/com/lantharos/Firewall1"
)]
trait Firewall {
    #[zbus(property)]
    fn open_ports(&self) -> zbus::Result<Vec<(u16, String, String)>>;

    fn open_port(&self, port: u16, protocol: &str, networks: &str) -> zbus::Result<()>;

    fn close_port(&self, port: u16, protocol: &str) -> zbus::Result<()>;
}

async fn firewall(connection: &Connection) -> zbus::Result<FirewallProxy<'_>> {
    FirewallProxy::builder(connection)
        .cache_properties(CacheProperties::No)
        .build()
        .await
}

pub async fn on_public_networks(connection: &Connection) -> zbus::Result<bool> {
    Ok(firewall(connection)
        .await?
        .open_ports()
        .await?
        .iter()
        .any(|(port, protocol, networks)| *port == SSH && protocol == TCP && networks == ANYWHERE))
}

pub async fn open(connection: &Connection, public: bool) -> zbus::Result<()> {
    let networks = if public { ANYWHERE } else { HOME };
    firewall(connection)
        .await?
        .open_port(SSH, TCP, networks)
        .await
}

pub async fn close(connection: &Connection) -> zbus::Result<()> {
    firewall(connection).await?.close_port(SSH, TCP).await
}
