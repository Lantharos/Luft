use std::collections::{HashMap, HashSet};

use zbus::Connection;
use zbus::fdo::PropertiesProxy;
use zbus::names::InterfaceName;

const FIREWALL: &str = "com.lantharos.Firewall1";
const INTERFACE: InterfaceName<'static> = InterfaceName::from_static_str_unchecked(FIREWALL);
const PATH: &str = "/com/lantharos/Firewall1";
const LOOPBACK: &str = "lo";

pub struct Trusted {
    names: HashMap<i32, String>,
    home: HashSet<String>,
}

impl Trusted {
    pub async fn read(system: &Connection) -> Self {
        Self {
            names: interface_names(),
            home: home_interfaces(system).await.unwrap_or_else(|error| {
                eprintln!("Couldn't see which networks are home networks: {error}");
                HashSet::new()
            }),
        }
    }

    pub fn reaches(&self, interface: i32) -> bool {
        self.names
            .get(&interface)
            .is_some_and(|name| name == LOOPBACK || self.home.contains(name))
    }
}

fn interface_names() -> HashMap<i32, String> {
    let Ok(interfaces) = std::fs::read_dir("/sys/class/net") else {
        return HashMap::new();
    };
    interfaces
        .flatten()
        .filter_map(|interface| {
            let index = std::fs::read_to_string(interface.path().join("ifindex")).ok()?;
            Some((
                index.trim().parse().ok()?,
                interface.file_name().into_string().ok()?,
            ))
        })
        .collect()
}

async fn home_interfaces(system: &Connection) -> zbus::Result<HashSet<String>> {
    let interfaces = PropertiesProxy::builder(system)
        .destination(FIREWALL)
        .path(PATH)
        .build()
        .await?
        .get(INTERFACE, "HomeInterfaces")
        .await?;
    Ok(Vec::<String>::try_from(interfaces)?.into_iter().collect())
}
