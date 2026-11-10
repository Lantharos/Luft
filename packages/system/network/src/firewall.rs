use luft_app::Empty;
use luft_app::apps::App;
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

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum PortNetworks {
    Home,
    Anywhere,
}

impl PortNetworks {
    fn parse(name: &str) -> Option<Self> {
        match name {
            "home" => Some(Self::Home),
            "anywhere" => Some(Self::Anywhere),
            _ => None,
        }
    }

    fn name(self) -> &'static str {
        match self {
            Self::Home => "home",
            Self::Anywhere => "anywhere",
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum FirewallAccess {
    Home,
    Anywhere,
    Blocked,
}

impl FirewallAccess {
    fn parse(name: &str) -> Option<Self> {
        match name {
            "home" => Some(Self::Home),
            "anywhere" => Some(Self::Anywhere),
            "blocked" => Some(Self::Blocked),
            _ => None,
        }
    }

    fn name(self) -> &'static str {
        match self {
            Self::Home => "home",
            Self::Anywhere => "anywhere",
            Self::Blocked => "blocked",
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Type)]
#[serde(rename_all = "lowercase")]
pub enum FirewallAppKind {
    App,
    Program,
}

impl FirewallAppKind {
    fn parse(name: &str) -> Option<Self> {
        match name {
            "app" => Some(Self::App),
            "program" => Some(Self::Program),
            _ => None,
        }
    }

    fn name(self) -> &'static str {
        match self {
            Self::App => "app",
            Self::Program => "program",
        }
    }
}

#[derive(Serialize, Type)]
pub struct FirewallApp {
    kind: FirewallAppKind,
    id: String,
    name: String,
    icon: Option<String>,
    access: FirewallAccess,
}

impl FirewallApp {
    fn new(kind: &str, id: String, access: &str) -> Option<Self> {
        let kind = FirewallAppKind::parse(kind)?;
        let access = FirewallAccess::parse(access)?;
        let app = match kind {
            FirewallAppKind::App => App::by_id(&format!("{id}.desktop")),
            FirewallAppKind::Program => App::by_program(&id),
        };
        Some(Self {
            kind,
            name: app
                .as_ref()
                .map_or_else(|| id.clone(), |app| app.name.clone()),
            icon: app.and_then(|app| app.icon),
            id,
            access,
        })
    }
}

#[derive(Deserialize, Type)]
pub struct ForgetApp {
    kind: FirewallAppKind,
    id: String,
}

#[derive(Deserialize, Type)]
pub struct ChangeAppAccess {
    kind: FirewallAppKind,
    id: String,
    access: FirewallAccess,
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
    networks: PortNetworks,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Firewall {
    networks: Vec<GuardedNetwork>,
    unclassified: Vec<NewNetwork>,
    open_ports: Vec<OpenPort>,
    apps: Vec<FirewallApp>,
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

async fn own_user(connection: &zbus::Connection) -> Result<u32, String> {
    let name = connection
        .unique_name()
        .ok_or("The system bus gave this app no name")?;
    zbus::fdo::DBusProxy::new(connection)
        .await
        .map_err(failed)?
        .get_connection_unix_user(name.clone().into())
        .await
        .map_err(failed)
}

pub async fn read(Empty {}: Empty) -> Result<Option<Firewall>, String> {
    let firewall = proxy().await?;
    let Ok(ports) = firewall
        .get_property::<Vec<(u16, String, String)>>("OpenPorts")
        .await
    else {
        return Ok(None);
    };
    let unclassified: Vec<(OwnedObjectPath, String)> = firewall
        .get_property("Unclassified")
        .await
        .map_err(failed)?;
    let decided: Vec<(String, String, String, u32)> =
        firewall.get_property("Apps").await.map_err(failed)?;
    let me = own_user(firewall.connection()).await?;
    let mut apps: Vec<FirewallApp> = decided
        .into_iter()
        .filter(|(_, _, _, user)| *user == me)
        .filter_map(|(kind, id, access, _)| FirewallApp::new(&kind, id, &access))
        .collect();
    apps.sort_by_cached_key(|app| app.name.to_lowercase());
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
            .filter_map(|(port, protocol, networks)| {
                let protocol = match protocol.as_str() {
                    "tcp" => Protocol::Tcp,
                    "udp" => Protocol::Udp,
                    _ => return None,
                };
                Some(OpenPort {
                    port,
                    protocol,
                    networks: PortNetworks::parse(&networks)?,
                })
            })
            .collect(),
        apps,
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

pub async fn open_port(
    OpenPort {
        port,
        protocol,
        networks,
    }: OpenPort,
) -> Result<(), String> {
    call("OpenPort", &(port, protocol.name(), networks.name())).await
}

pub async fn close_port(OpenPort { port, protocol, .. }: OpenPort) -> Result<(), String> {
    call("ClosePort", &(port, protocol.name())).await
}

pub async fn forget_app(
    ForgetApp { kind, id }: ForgetApp,
) -> Result<(), String> {
    call("ForgetApp", &(kind.name(), id)).await
}

pub async fn set_app_access(
    ChangeAppAccess { kind, id, access }: ChangeAppAccess,
) -> Result<(), String> {
    call("SetAppAccess", &(kind.name(), id, access.name())).await
}
