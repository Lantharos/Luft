use std::collections::BTreeSet;
use std::net::IpAddr;
use std::sync::Mutex;

use mdns_sd::{ResolvedService, ServiceDaemon, ServiceEvent};

use super::{escl, found_escl, lost, sane};

const ESCL: [(&str, bool); 2] = [("_uscan._tcp.local.", false), ("_uscans._tcp.local.", true)];
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
    for (service, secure) in ESCL {
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
