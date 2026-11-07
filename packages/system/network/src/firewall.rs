use luft_app::Empty;
use luft_app::dbus::{self, error_message, failed};
use serde::{Deserialize, Serialize};
use specta::Type;
use zbus::proxy::{Builder, CacheProperties, MethodFlags};
use zbus::{OwnedObjectPath, Proxy};

use super::saved::{self, Kind};
use super::{ACTIVE, objects};

const NAME: &str = "com.lantharos.Firewall1";
const PATH: &str = "/com/lantharos/Firewall1";
const ACTIVATED: u32 = 2;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum NetworkType {
    Home,
    Public,
}

impl NetworkType {
    pub fn parse(zone: &str) -> Option<Self> {
        match zone {
            "" => None,
            "home" => Some(Self::Home),
            _ => Some(Self::Public),
        }
    }

    fn name(self) -> &'static str {
        match self {
            Self::Home => "home",
            Self::Public => "public",
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum Protocol {
    Tcp,
    Udp,
}

impl Protocol {
    fn name(self) -> &'static str {
        match self {
            Self::Tcp => "tcp",
            Self::Udp => "udp",
        }
    }
}

#[derive(Serialize, Deserialize, Type)]
#[serde(rename_all = "lowercase")]
pub enum Medium {
    Wifi,
    Wired,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct GuardedNetwork {
    connection: String,
    name: String,
    medium: Medium,
    network_type: Option<NetworkType>,
    connected: bool,
}

#[derive(Serialize, Type)]
pub struct NewNetwork {
    connection: String,
    name: String,
}

#[derive(Serialize, Deserialize, Type)]
pub struct OpenPort {
    port: u16,
    protocol: Protocol,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Firewall {
    networks: Vec<GuardedNetwork>,
    unclassified: Vec<NewNetwork>,
    open_ports: Vec<OpenPort>,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Classify {
    connection: String,
    network_type: NetworkType,
}

async fn proxy() -> Result<Proxy<'static>, String> {
    Builder::new(dbus::system().await?)
        .destination(NAME)
        .path(PATH)
        .interface(NAME)
        .cache_properties(CacheProperties::No)
        .build()
        .await
        .map_err(failed)
}

async fn call(
    method: &str,
    body: &(impl serde::Serialize + zbus::zvariant::DynamicType),
) -> Result<(), String> {
    proxy()
        .await?
        .call_with_flags::<_, _, ()>(method, MethodFlags::ALLOW_INTERACTIVE_AUTH, body)
        .await
        .map(drop)
        .map_err(|error| error_message(&error).map_or_else(|| failed(&error), str::to_owned))
}

pub async fn read(Empty {}: Empty) -> Result<Option<Firewall>, String> {
    let firewall = proxy().await?;
    let Ok(ports) = firewall
        .get_property::<Vec<(u16, String)>>("OpenPorts")
        .await
    else {
        return Ok(None);
    };
    let unclassified: Vec<(OwnedObjectPath, String)> = firewall
        .get_property("Unclassified")
        .await
        .map_err(failed)?;
    let objects = objects().await?;
    let connected: Vec<String> = objects
        .implementing(ACTIVE)
        .filter(|active| active.get::<u32>("State") == Some(ACTIVATED))
        .filter_map(|active| active.link("Connection"))
        .collect();
    let mut networks: Vec<GuardedNetwork> = saved::all(&objects)
        .await
        .into_iter()
        .filter_map(|saved| {
            let medium = match saved.kind {
                Kind::Wifi { .. } => Medium::Wifi,
                Kind::Wired => Medium::Wired,
                Kind::Vpn | Kind::Other => return None,
            };
            Some(GuardedNetwork {
                connected: connected.contains(&saved.path),
                connection: saved.path,
                name: saved.name,
                medium,
                network_type: saved.network_type,
            })
        })
        .collect();
    networks.sort_by(|left, right| {
        right
            .connected
            .cmp(&left.connected)
            .then_with(|| left.name.to_lowercase().cmp(&right.name.to_lowercase()))
    });
    Ok(Some(Firewall {
        networks,
        unclassified: unclassified
            .into_iter()
            .map(|(path, name)| NewNetwork {
                connection: path.to_string(),
                name,
            })
            .collect(),
        open_ports: ports
            .into_iter()
            .filter_map(|(port, protocol)| {
                let protocol = match protocol.as_str() {
                    "tcp" => Protocol::Tcp,
                    "udp" => Protocol::Udp,
                    _ => return None,
                };
                Some(OpenPort { port, protocol })
            })
            .collect(),
    }))
}

pub async fn classify(
    Classify {
        connection,
        network_type,
    }: Classify,
) -> Result<(), String> {
    let connection = OwnedObjectPath::try_from(connection).map_err(failed)?;
    call("SetNetworkType", &(connection, network_type.name())).await
}

pub async fn open_port(OpenPort { port, protocol }: OpenPort) -> Result<(), String> {
    call("OpenPort", &(port, protocol.name())).await
}

pub async fn close_port(OpenPort { port, protocol }: OpenPort) -> Result<(), String> {
    call("ClosePort", &(port, protocol.name())).await
}
