use std::collections::{BTreeSet, HashMap};
use std::fmt;
use std::future::ready;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr};

use futures_util::{Stream, StreamExt};
use luft_dbus::failed;
use luft_dbus::objects::{self, Object, Objects};
use zbus::fdo::DBusProxy;
use zbus::names::BusName;
use zbus::{Connection, Message, OwnedObjectPath, OwnedVariant, Proxy, Variant};

const SERVICE: &str = "org.freedesktop.NetworkManager";
const CONNECTION: &str = "org.freedesktop.NetworkManager.Settings.Connection";
const ROOT: &str = "/org/freedesktop";
const ACTIVE: &str = "org.freedesktop.NetworkManager.Connection.Active";
const DEVICE: &str = "org.freedesktop.NetworkManager.Device";
const IP4: &str = "org.freedesktop.NetworkManager.IP4Config";
const IP6: &str = "org.freedesktop.NetworkManager.IP6Config";
const ACCESS_POINTS: &str = "/org/freedesktop/NetworkManager/AccessPoint/";
const CLASSIFIABLE: [&str; 2] = ["802-3-ethernet", "802-11-wireless"];
const ACTIVATING: u32 = 1;
const ACTIVATED: u32 = 2;

type Settings = HashMap<String, HashMap<String, OwnedVariant>>;

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Prefix {
    V4(Ipv4Addr, u8),
    V6(Ipv6Addr, u8),
}

impl Prefix {
    fn of(address: IpAddr, length: u8) -> Self {
        match address {
            IpAddr::V4(address) => {
                let mask = u32::MAX
                    .checked_shl(32 - u32::from(length.min(32)))
                    .unwrap_or(0);
                Self::V4(Ipv4Addr::from(address.to_bits() & mask), length.min(32))
            }
            IpAddr::V6(address) => {
                let mask = u128::MAX
                    .checked_shl(128 - u32::from(length.min(128)))
                    .unwrap_or(0);
                Self::V6(Ipv6Addr::from(address.to_bits() & mask), length.min(128))
            }
        }
    }
}

impl fmt::Display for Prefix {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::V4(network, length) => write!(formatter, "{network}/{length}"),
            Self::V6(network, length) => write!(formatter, "{network}/{length}"),
        }
    }
}

#[derive(Default, PartialEq)]
pub struct Layout {
    pub home: BTreeSet<(String, Prefix)>,
    pub hosted: BTreeSet<String>,
    pub unclassified: Vec<(OwnedObjectPath, String)>,
}

enum Role {
    Home,
    Unclassified,
    Hosted,
    Guarded,
}

fn text(settings: &Settings, group: &str, key: &str) -> String {
    settings
        .get(group)
        .and_then(|group| group.get(key))
        .and_then(|value| String::try_from(value.try_clone().ok()?).ok())
        .unwrap_or_default()
}

fn role(settings: &Settings) -> Role {
    let shared = ["ipv4", "ipv6"]
        .iter()
        .any(|family| text(settings, family, "method") == "shared");
    if shared {
        return Role::Hosted;
    }
    if !CLASSIFIABLE.contains(&text(settings, "connection", "type").as_str()) {
        return Role::Guarded;
    }
    match text(settings, "connection", "zone").as_str() {
        "" => Role::Unclassified,
        "home" => Role::Home,
        _ => Role::Guarded,
    }
}

async fn settings(connection: &Connection, path: &str) -> zbus::Result<Settings> {
    Proxy::new(connection, SERVICE, path, CONNECTION)
        .await?
        .call("GetSettings", &())
        .await
}

fn interfaces(objects: &Objects, active: &Object) -> Vec<String> {
    active
        .get::<Vec<OwnedObjectPath>>("Devices")
        .unwrap_or_default()
        .iter()
        .filter_map(|path| objects.get(path.as_str(), DEVICE))
        .filter_map(|device| {
            device
                .get::<String>("IpInterface")
                .filter(|name| !name.is_empty())
                .or_else(|| device.get("Interface"))
        })
        .collect()
}

fn prefixes(objects: &Objects, active: &Object) -> Vec<Prefix> {
    [("Ip4Config", IP4), ("Ip6Config", IP6)]
        .into_iter()
        .filter_map(|(property, interface)| objects.get(&active.link(property)?, interface))
        .flat_map(|config| {
            config
                .get::<Vec<HashMap<String, OwnedVariant>>>("AddressData")
                .unwrap_or_default()
        })
        .filter_map(|address| {
            let text = String::try_from(address.get("address")?.try_clone().ok()?).ok()?;
            let length = u32::try_from(address.get("prefix")?.try_clone().ok()?).ok()?;
            Some(Prefix::of(text.parse().ok()?, u8::try_from(length).ok()?))
        })
        .collect()
}

async fn running(connection: &Connection) -> Result<bool, String> {
    DBusProxy::new(connection)
        .await
        .map_err(failed)?
        .name_has_owner(BusName::from_static_str(SERVICE).map_err(failed)?)
        .await
        .map_err(failed)
}

pub async fn read(connection: &Connection) -> Result<Layout, String> {
    let mut layout = Layout::default();
    if !running(connection).await? {
        return Ok(layout);
    }
    let objects = Objects::fetch(connection, SERVICE, ROOT).await?;
    for active in objects.implementing(ACTIVE) {
        if !matches!(active.get::<u32>("State"), Some(ACTIVATING | ACTIVATED)) {
            continue;
        }
        let Some(path) = active.get::<OwnedObjectPath>("Connection") else {
            continue;
        };
        let settings = settings(connection, &path).await.map_err(failed)?;
        match role(&settings) {
            Role::Home => {
                let interfaces = interfaces(&objects, &active);
                for prefix in prefixes(&objects, &active) {
                    layout.home.extend(
                        interfaces
                            .iter()
                            .map(|interface| (interface.clone(), prefix)),
                    );
                }
            }
            Role::Hosted => layout.hosted.extend(interfaces(&objects, &active)),
            Role::Unclassified => layout
                .unclassified
                .push((path, active.get("Id").unwrap_or_default())),
            Role::Guarded => {}
        }
    }
    layout
        .unclassified
        .sort_by(|(left, _), (right, _)| left.as_str().cmp(right.as_str()));
    Ok(layout)
}

fn relevant(message: &Message) -> bool {
    message
        .header()
        .path()
        .is_some_and(|path| !path.as_str().starts_with(ACCESS_POINTS))
}

pub async fn changes(connection: &Connection) -> Result<impl Stream<Item = ()> + Unpin, String> {
    let messages = objects::signals(connection, SERVICE, ROOT).await?;
    Ok(messages.filter_map(|message| ready(message.ok().filter(relevant).map(drop))))
}

pub async fn classify(connection: &Connection, path: &str, kind: &str) -> zbus::Result<()> {
    let proxy = Proxy::new(connection, SERVICE, path, CONNECTION).await?;
    let mut settings: Settings = proxy.call("GetSettings", &()).await?;
    settings.entry("connection".to_owned()).or_default().insert(
        "zone".to_owned(),
        Variant::from(kind.to_owned()).try_into()?,
    );
    proxy.call("Update", &(settings,)).await
}
