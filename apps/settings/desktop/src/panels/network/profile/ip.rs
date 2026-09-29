use std::collections::HashMap;
use std::net::IpAddr;

use serde::{Deserialize, Serialize};
use zbus::zvariant::Value;

use super::settings::{Group, put, put_text, read};

const LEGACY: [&str; 3] = ["addresses", "routes", "dns"];

type Entry = HashMap<String, Value<'static>>;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Route {
    destination: String,
    gateway: String,
    metric: Option<u32>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Ip {
    method: String,
    addresses: Vec<String>,
    gateway: String,
    dns: Vec<String>,
    search: Vec<String>,
    automatic_dns: bool,
    automatic_routes: bool,
    routes: Vec<Route>,
}

fn entries(group: Option<&Group>, key: &str) -> Vec<Group> {
    read(group, key).unwrap_or_default()
}

fn cidr(entry: &Group, key: &str) -> Option<String> {
    let address: String = read(Some(entry), key)?;
    let prefix: u32 = read(Some(entry), "prefix")?;
    Some(format!("{address}/{prefix}"))
}

pub fn load(group: Option<&Group>) -> Ip {
    Ip {
        method: read(group, "method").unwrap_or_else(|| "auto".to_owned()),
        addresses: entries(group, "address-data")
            .iter()
            .filter_map(|entry| cidr(entry, "address"))
            .collect(),
        gateway: read(group, "gateway").unwrap_or_default(),
        dns: read(group, "dns-data").unwrap_or_default(),
        search: read(group, "dns-search").unwrap_or_default(),
        automatic_dns: !read(group, "ignore-auto-dns").unwrap_or(false),
        automatic_routes: !read(group, "ignore-auto-routes").unwrap_or(false),
        routes: entries(group, "route-data")
            .iter()
            .filter_map(|entry| {
                Some(Route {
                    destination: cidr(entry, "dest")?,
                    gateway: read(Some(entry), "next-hop").unwrap_or_default(),
                    metric: read(Some(entry), "metric"),
                })
            })
            .collect(),
    }
}

fn split(text: &str) -> Result<(String, u32), String> {
    let (address, prefix) = text.split_once('/').unwrap_or((text, ""));
    let invalid = || format!("“{text}” isn't a valid address");
    let address: IpAddr = address.trim().parse().map_err(|_| invalid())?;
    let longest = if address.is_ipv4() { 32 } else { 128 };
    let prefix = match prefix.trim() {
        "" => longest,
        prefix => prefix
            .parse()
            .ok()
            .filter(|prefix| *prefix <= longest)
            .ok_or_else(invalid)?,
    };
    Ok((address.to_string(), prefix))
}

fn address(text: &str) -> Result<Entry, String> {
    let (address, prefix) = split(text)?;
    Ok(HashMap::from([
        ("address".to_owned(), Value::from(address)),
        ("prefix".to_owned(), Value::from(prefix)),
    ]))
}

pub fn address_data(texts: &[String]) -> Result<Vec<Entry>, String> {
    texts.iter().map(|text| address(text)).collect()
}

fn route(route: &Route) -> Result<Entry, String> {
    let (destination, prefix) = split(&route.destination)?;
    let mut entry = HashMap::from([
        ("dest".to_owned(), Value::from(destination)),
        ("prefix".to_owned(), Value::from(prefix)),
    ]);
    if !route.gateway.is_empty() {
        entry.insert("next-hop".to_owned(), Value::from(route.gateway.clone()));
    }
    if let Some(metric) = route.metric {
        entry.insert("metric".to_owned(), Value::from(metric));
    }
    Ok(entry)
}

pub fn store(group: &mut Group, ip: &Ip) -> Result<(), String> {
    for key in LEGACY {
        group.remove(key);
    }
    put(group, "method", ip.method.clone());
    put(group, "address-data", address_data(&ip.addresses)?);
    let routes = ip.routes.iter().map(route).collect::<Result<Vec<_>, _>>()?;
    put(group, "route-data", routes);
    put_text(group, "gateway", &ip.gateway);
    put(group, "dns-data", ip.dns.clone());
    put(group, "dns-search", ip.search.clone());
    put(group, "ignore-auto-dns", !ip.automatic_dns);
    put(group, "ignore-auto-routes", !ip.automatic_routes);
    Ok(())
}
