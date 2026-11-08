use std::collections::BTreeSet;
use std::sync::Arc;

use luft_dbus_macros::introspect;
use tokio::sync::Mutex;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, OwnedObjectPath, interface};

use crate::apps::identity::{self, Origin};
use crate::apps::{Access, Identity};
use crate::error::Error;
use crate::firewall::Firewall;
use crate::network;
use crate::ports::{Networks, Port};

pub const NAME: &str = "com.lantharos.Firewall1";
pub const PATH: &str = "/com/lantharos/Firewall1";
const CLASSIFY: &str = "com.lantharos.firewall.classify";
const OPEN: &str = "com.lantharos.firewall.open-ports";
const OPEN_ANYWHERE: &str = "com.lantharos.firewall.open-ports-anywhere";
const APPS: &str = "com.lantharos.firewall.apps";
const ANYWHERE: &str = "com.lantharos.firewall.apps-anywhere";
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
        networks: Option<Networks>,
    ) -> Result<(), Error> {
        let port = Port::new(port, protocol).ok_or_else(|| {
            Error::InvalidArgs("A port is a number from 1 to 65535 over TCP or UDP".into())
        })?;
        let action = if networks == Some(Networks::Anywhere) {
            OPEN_ANYWHERE
        } else {
            OPEN
        };
        authorize(connection, header, action).await?;
        let mut firewall = self.firewall.lock().await;
        let mut ports = firewall.ports().clone();
        match networks {
            Some(networks) => ports.insert(port, networks),
            None => ports.remove(&port),
        };
        firewall.set_ports(ports).await.map_err(Error::Failed)
    }
}

async fn authorize(
    connection: &Connection,
    header: &Header<'_>,
    action: &str,
) -> Result<(), Error> {
    if luft_dbus::polkit::is_authorized(connection, header, action).await? {
        Ok(())
    } else {
        Err(Error::not_authorized())
    }
}

async fn session_unit(connection: &Connection, header: &Header<'_>) -> Result<String, Error> {
    let sender = header.sender().ok_or_else(Error::not_authorized)?;
    let pid = DBusProxy::new(connection)
        .await?
        .get_connection_unix_process_id(sender.clone().into())
        .await
        .map_err(zbus::Error::from)?;
    match identity::of_process(pid) {
        Some(Origin::Session { unit }) => Ok(unit),
        _ => Err(Error::not_authorized()),
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
    async fn open_ports(&self) -> Vec<(u16, String, String)> {
        self.firewall
            .lock()
            .await
            .ports()
            .iter()
            .map(|(port, networks)| {
                (
                    port.number,
                    port.protocol.name().to_owned(),
                    networks.name().to_owned(),
                )
            })
            .collect()
    }

    #[zbus(property)]
    async fn apps(&self) -> Vec<(String, String, String)> {
        self.firewall
            .lock()
            .await
            .decisions()
            .iter()
            .map(|(identity, access)| {
                (
                    identity.kind().to_owned(),
                    identity.id().to_owned(),
                    access.name().to_owned(),
                )
            })
            .collect()
    }

    #[zbus(property)]
    async fn waiting(&self) -> Vec<(String, String, u32)> {
        self.firewall
            .lock()
            .await
            .waiting()
            .into_iter()
            .map(|(identity, uid)| (identity.kind().to_owned(), identity.id().to_owned(), uid))
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
        authorize(connection, &header, CLASSIFY).await?;
        Ok(network::classify(connection, network.as_str(), kind).await?)
    }

    async fn open_port(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        port: u16,
        protocol: &str,
        networks: &str,
    ) -> Result<(), Error> {
        let networks = Networks::parse(networks).ok_or_else(|| {
            Error::InvalidArgs(format!(
                "A port opens on home networks or anywhere, not {networks}"
            ))
        })?;
        self.change_port(connection, &header, port, protocol, Some(networks))
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
        self.change_port(connection, &header, port, protocol, None)
            .await?;
        Ok(self.open_ports_changed(&emitter).await?)
    }

    async fn set_app_access(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        kind: &str,
        id: &str,
        access: &str,
    ) -> Result<(), Error> {
        let identity = Identity::parse(kind, id)
            .ok_or_else(|| Error::InvalidArgs(format!("{kind} {id} isn't an app or a program")))?;
        let access = Access::parse(access).ok_or_else(|| {
            Error::InvalidArgs(format!(
                "An app is allowed home, anywhere or blocked, not {access}"
            ))
        })?;
        let action = if access == Access::Anywhere {
            ANYWHERE
        } else {
            APPS
        };
        authorize(connection, &header, action).await?;
        self.firewall
            .lock()
            .await
            .decide(identity, access)
            .await
            .map_err(Error::Failed)?;
        self.apps_changed(&emitter).await?;
        Ok(self.waiting_changed(&emitter).await?)
    }

    async fn set_extension_ports(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        ports: Vec<(u16, String)>,
    ) -> Result<(), Error> {
        let ports = ports
            .iter()
            .map(|(number, protocol)| Port::new(*number, protocol))
            .collect::<Option<BTreeSet<Port>>>()
            .ok_or_else(|| {
                Error::InvalidArgs("Extensions listen on TCP or UDP ports from 1 to 65535".into())
            })?;
        let unit = session_unit(connection, &header).await?;
        self.firewall
            .lock()
            .await
            .declare(unit, ports)
            .await
            .map_err(Error::Failed)
    }
}
