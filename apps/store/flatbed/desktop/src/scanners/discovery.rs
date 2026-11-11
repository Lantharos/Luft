use std::collections::BTreeSet;
use std::net::IpAddr;
use std::sync::Mutex;

use mdns_sd::{ResolvedService, ServiceDaemon, ServiceEvent};

use super::{escl, found_escl, known, lost, sane};

const PLAIN: &str = "_uscan._tcp.local.";
const SECURE: &str = "_uscans._tcp.local.";
const BJNP: &str = "_canon-bjnp1._tcp.local.";

static BJNP_HOSTS: Mutex<BTreeSet<IpAddr>> = Mutex::new(BTreeSet::new());

pub fn start() {
    let daemon = match ServiceDaemon::new() {
        Ok(daemon) => daemon,
        Err(error) => {
            eprintln!("flatbed: can't look for scanners on the network: {error}");
            return;
        }
    };
    for (service, secure) in [(PLAIN, false), (SECURE, true)] {
        browse(&daemon, service, move |found| escl_found(found, secure));
    }
    browse(&daemon, BJNP, bjnp_found);
}

fn browse(
    daemon: &ServiceDaemon,
    service: &'static str,
    found: impl Fn(&ResolvedService) + Send + 'static,
) {
    let Ok(events) = daemon.browse(service) else {
        return;
    };
    std::thread::Builder::new()
        .name("discovery".into())
        .spawn(move || {
            while let Ok(event) = events.recv() {
                match event {
                    ServiceEvent::ServiceResolved(service) => found(&service),
                    ServiceEvent::ServiceRemoved(_, fullname) => lost(&format!("escl:{fullname}")),
                    _ => {}
                }
            }
        })
        .expect("a thread for finding scanners");
}

/// The name a scanner found on the network goes by, whichever way it's spoken to.
pub fn instance(id: &str) -> Option<&str> {
    let fullname = id.strip_prefix("escl:")?;
    [PLAIN, SECURE]
        .iter()
        .find_map(|service| fullname.strip_suffix(service))
}

fn address(service: &ResolvedService) -> Option<IpAddr> {
    let mut addresses: Vec<IpAddr> = service
        .addresses
        .iter()
        .map(|address| address.to_ip_addr())
        .collect();
    addresses.sort_by_key(|address| !address.is_ipv4());
    addresses.into_iter().next()
}

fn escl_found(service: &ResolvedService, secure: bool) {
    let Some(address) = address(service) else {
        return;
    };
    let known_secure = service
        .fullname
        .strip_suffix(PLAIN)
        .is_some_and(|instance| known::pinned(&format!("escl:{instance}{SECURE}")));
    if !secure && known_secure {
        return;
    }
    let name = service
        .get_property_val_str("ty")
        .unwrap_or_default()
        .to_owned();
    let root = service
        .get_property_val_str("rs")
        .unwrap_or("eSCL")
        .to_owned();
    let endpoint = escl::Endpoint::new(secure, &address.to_string(), service.port, &root);
    let key = service.fullname.clone();
    std::thread::spawn(move || found_escl(key, name, endpoint, Some(address)));
}

fn bjnp_found(service: &ResolvedService) {
    let Some(address) = address(service).filter(IpAddr::is_ipv4) else {
        return;
    };
    let hosts = {
        let mut hosts = BJNP_HOSTS.lock().expect("bjnp hosts lock");
        if !hosts.insert(address) {
            return;
        }
        hosts.iter().copied().collect()
    };
    sane::look_again(hosts);
}
