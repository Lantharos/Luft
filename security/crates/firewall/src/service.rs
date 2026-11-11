use std::collections::BTreeSet;
use std::sync::Arc;

use luft_dbus::polkit::{self, Details};
use luft_dbus_macros::introspect;
use luft_identity::caller;
use luft_identity::unit::SessionUnit;
use tokio::sync::Mutex;
use zbus::fdo::DBusProxy;
use zbus::message::Header;
use zbus::object_server::SignalEmitter;
use zbus::{Connection, OwnedObjectPath, interface};

use crate::apps::{Access, Identity};
use crate::error::Error;
use crate::firewall::Firewall;
use crate::network;
use crate::ports::{Networks, Port};

pub const NAME: &str = "com.lantharos.Firewall1";
pub const PATH: &str = "/com/lantharos/Firewall1";
const RESTRICT: &str = "com.lantharos.firewall.restrict";
const CLASSIFY: &str = "com.lantharos.firewall.classify";
const OPEN: &str = "com.lantharos.firewall.open-ports";
const OPEN_ANYWHERE: &str = "com.lantharos.firewall.open-ports-anywhere";
const APPS: &str = "com.lantharos.firewall.apps";
const ANYWHERE: &str = "com.lantharos.firewall.apps-anywhere";
const POST: (&str, &str) = ("kestrel-post.service", "/usr/libexec/kestrel-post");
const KESTREL: (&str, &str) = ("kestrel.service", "/usr/bin/kestrel");
const HOME: &str = "home";
const PUBLIC: &str = "public";

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
        let (action, question) = match networks {
            Some(Networks::Anywhere) => (
                OPEN_ANYWHERE,
                format!("Open port {port} to devices on every network, public ones too"),
            ),
            Some(Networks::Home) => (
                OPEN,
                format!("Open port {port} to devices on home networks"),
            ),
            None => (OPEN, format!("Close port {port}")),
        };
        authorize(connection, header, action, &question).await?;
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
    question: &str,
) -> Result<(), Error> {
    if polkit::is_authorized_to(connection, header, action, &Details::message(question)).await? {
        Ok(())
    } else {
        Err(Error::not_authorized())
    }
}

async fn user(connection: &Connection, header: &Header<'_>) -> Result<u32, Error> {
    let sender = header.sender().ok_or_else(Error::not_authorized)?;
    Ok(DBusProxy::new(connection)
        .await?
        .get_connection_unix_user(sender.clone().into())
        .await
        .map_err(zbus::Error::from)?)
}

fn identity(kind: &str, id: &str) -> Result<Identity, Error> {
    Identity::parse(kind, id)
        .ok_or_else(|| Error::InvalidArgs(format!("{kind} {id} isn't an app or a program")))
}

async fn session_unit(
    connection: &Connection,
    header: &Header<'_>,
    (name, _): (&str, &str),
) -> Result<SessionUnit, Error> {
    caller::session_unit(connection, header)
        .await
        .filter(|unit| unit.name == name)
        .ok_or_else(Error::not_authorized)
}

/// Opening ports takes the program itself, from the system image: anything
/// else of yours could place itself in its unit. Closing them takes only the
/// unit, so a desktop whose program can't be confirmed can always close
/// what it opened.
async fn require_program(
    connection: &Connection,
    header: &Header<'_>,
    (name, program): (&str, &str),
) -> Result<(), Error> {
    match caller::luft_program(connection, header, &[program]).await {
        Some(_) => Ok(()),
        None => {
            eprintln!(
                "Refused to open ports for a caller in {name} that isn't {program} from the system image"
            );
            Err(Error::not_authorized())
        }
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
    async fn home_interfaces(&self) -> Vec<String> {
        self.firewall.lock().await.home_interfaces()
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
    async fn apps(&self) -> Vec<(String, String, String, u32)> {
        self.firewall
            .lock()
            .await
            .decisions()
            .iter()
            .map(|((uid, identity), access)| {
                (
                    identity.kind().to_owned(),
                    identity.id().to_owned(),
                    access.name().to_owned(),
                    *uid,
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
            .map(|(uid, identity)| (identity.kind().to_owned(), identity.id().to_owned(), uid))
            .collect()
    }

    async fn set_network_type(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        network: OwnedObjectPath,
        kind: &str,
    ) -> Result<(), Error> {
        let uid = user(connection, &header).await?;
        let saved = network::classifiable(connection, network.as_str(), uid)
            .await?
            .ok_or_else(|| {
                Error::InvalidArgs("Only your Wi-Fi and wired networks are home or public".into())
            })?;
        let name = saved.name();
        let (action, question) = match kind {
            HOME => (
                CLASSIFY,
                format!(
                    "Make “{name}” a home network, where other devices can find this computer and connect to the apps you allowed"
                ),
            ),
            PUBLIC => (RESTRICT, format!("Make “{name}” a public network")),
            _ => {
                return Err(Error::InvalidArgs(format!(
                    "A network is home or public, not {kind}"
                )));
            }
        };
        authorize(connection, &header, action, &question).await?;
        Ok(saved.classify(kind).await?)
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
        let identity = identity(kind, id)?;
        let access = Access::parse(access).ok_or_else(|| {
            Error::InvalidArgs(format!(
                "An app is allowed home, anywhere or blocked, not {access}"
            ))
        })?;
        let owner = (user(connection, &header).await?, identity);
        let allowed = self.firewall.lock().await.decisions().get(&owner).copied();
        let (action, question) = match (allowed, access) {
            (_, Access::Blocked) => (
                RESTRICT,
                format!("Stop other devices from connecting to the {kind} “{id}”"),
            ),
            (Some(Access::Anywhere), Access::Home) => (
                RESTRICT,
                format!("Let only devices on home networks connect to the {kind} “{id}”"),
            ),
            (_, Access::Home) => (
                APPS,
                format!("Let other devices on home networks connect to the {kind} “{id}”"),
            ),
            (_, Access::Anywhere) => (
                ANYWHERE,
                format!(
                    "Let devices on every network, public ones too, connect to the {kind} “{id}”"
                ),
            ),
        };
        authorize(connection, &header, action, &question).await?;
        let mut firewall = self.firewall.lock().await;
        if firewall.decisions().get(&owner).copied() != allowed {
            return Err(Error::Failed(
                "What it may do changed meanwhile. Try again.".into(),
            ));
        }
        firewall
            .decide(owner, access)
            .await
            .map_err(Error::Failed)?;
        drop(firewall);
        self.apps_changed(&emitter).await?;
        Ok(self.waiting_changed(&emitter).await?)
    }

    async fn forget_app(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        #[zbus(signal_emitter)] emitter: SignalEmitter<'_>,
        kind: &str,
        id: &str,
    ) -> Result<(), Error> {
        let owner = (user(connection, &header).await?, identity(kind, id)?);
        authorize(
            connection,
            &header,
            RESTRICT,
            &format!("Forget what the {kind} “{id}” is allowed on the network"),
        )
        .await?;
        self.firewall
            .lock()
            .await
            .forget(&owner)
            .await
            .map_err(Error::Failed)?;
        self.apps_changed(&emitter).await?;
        Ok(self.waiting_changed(&emitter).await?)
    }

    async fn set_post_open(
        &self,
        #[zbus(connection)] connection: &Connection,
        #[zbus(header)] header: Header<'_>,
        open: bool,
    ) -> Result<(), Error> {
        let post = session_unit(connection, &header, POST).await?;
        if open {
            require_program(connection, &header, POST).await?;
        }
        self.firewall
            .lock()
            .await
            .open_post(post.cgroup, open)
            .await
            .map_err(Error::Failed)
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
        let SessionUnit { uid, cgroup, .. } = session_unit(connection, &header, KESTREL).await?;
        if self.firewall.lock().await.widens(&cgroup, &ports) {
            require_program(connection, &header, KESTREL).await?;
        }
        let new = self.firewall.lock().await.new_to(uid, &ports);
        if !new.is_empty() {
            let new: Vec<String> = new.iter().map(Port::to_string).collect();
            authorize(
                connection,
                &header,
                APPS,
                &format!(
                    "Let other devices on home networks connect to Kestrel’s extensions on {}",
                    new.join(", ")
                ),
            )
            .await?;
        }
        self.firewall
            .lock()
            .await
            .declare(uid, cgroup, ports)
            .await
            .map_err(Error::Failed)
    }
}
