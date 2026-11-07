use std::sync::Arc;

use luft_dbus_macros::introspect;
use tokio::sync::Mutex;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, OwnedObjectPath, interface};

use crate::error::Error;
use crate::firewall::Firewall;
use crate::network;
use crate::ports::{HIGHEST_GUARDED, Port};

pub const NAME: &str = "com.lantharos.Firewall1";
pub const PATH: &str = "/com/lantharos/Firewall1";
const CLASSIFY: &str = "com.lantharos.firewall.classify";
const OPEN: &str = "com.lantharos.firewall.open-ports";
const TYPES: [&str; 2] = ["home", "public"];

pub struct Service {
    firewall: Arc<Mutex<Firewall>>,
}

impl Service {
    pub fn new(firewall: Arc<Mutex<Firewall>>) -> Self {
        Self { firewall }
    }

    async fn change_port(
        &self,
        connection: &Connection,
        header: &Header<'_>,
        port: u16,
        protocol: &str,
        open: bool,
    ) -> Result<(), Error> {
        let port = Port::guarded(port, protocol).ok_or_else(|| {
            Error::InvalidArgs(format!(
                "Only TCP and UDP ports from 1 to {HIGHEST_GUARDED} are closed on home networks"
            ))
        })?;
        if !luft_dbus::polkit::is_authorized(connection, header, OPEN).await? {
            return Err(Error::not_authorized());
        }
        let mut firewall = self.firewall.lock().await;
        let mut ports = firewall.ports().clone();
        if open {
            ports.insert(port);
        } else {
            ports.remove(&port);
        }
        firewall.set_ports(ports).await.map_err(Error::Failed)
    }
}

#[introspect]
#[interface(name = "com.lantharos.Firewall1")]
impl Service {
    #[zbus(property)]
    async fn unclassified(&self) -> Vec<(OwnedObjectPath, String)> {
        self.firewall.lock().await.unclassified().to_vec()
    }

    #[zbus(property)]
    async fn open_ports(&self) -> Vec<(u16, String)> {
        self.firewall
            .lock()
            .await
            .ports()
            .iter()
            .map(|port| (port.number, port.protocol.name().to_owned()))
            .collect()
    }

    async fn set_network_type(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        network: OwnedObjectPath,
        kind: &str,
    ) -> Result<(), Error> {
        if !TYPES.contains(&kind) {
            return Err(Error::InvalidArgs(format!(
                "A network is home or public, not {kind}"
            )));
        }
        if !luft_dbus::polkit::is_authorized(connection, &header, CLASSIFY).await? {
            return Err(Error::not_authorized());
        }
        Ok(network::classify(connection, network.as_str(), kind).await?)
    }

    async fn open_port(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        port: u16,
        protocol: &str,
    ) -> Result<(), Error> {
        self.change_port(connection, &header, port, protocol, true)
            .await?;
        Ok(self.open_ports_changed(&emitter).await?)
    }

    async fn close_port(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        port: u16,
        protocol: &str,
    ) -> Result<(), Error> {
        self.change_port(connection, &header, port, protocol, false)
            .await?;
        Ok(self.open_ports_changed(&emitter).await?)
    }
}
