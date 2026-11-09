use std::net::Ipv4Addr;

use nix::ifaddrs::getifaddrs;
use nix::net::if_::InterfaceFlags;

/// Bridges for containers and virtual machines, which never lead to a phone or another computer.
const VIRTUAL: [&str; 5] = ["veth", "podman", "docker", "virbr", "br-"];

/// The IPv4 addresses of this computer's network connections that can carry multicast.
pub fn addresses() -> Vec<Ipv4Addr> {
    let Ok(interfaces) = getifaddrs() else {
        return Vec::new();
    };
    let mut addresses: Vec<Ipv4Addr> = interfaces
        .filter(|interface| {
            let flags = interface.flags;
            flags.contains(InterfaceFlags::IFF_UP | InterfaceFlags::IFF_RUNNING | InterfaceFlags::IFF_MULTICAST)
                && !flags.contains(InterfaceFlags::IFF_LOOPBACK)
                && !VIRTUAL.iter().any(|prefix| interface.interface_name.starts_with(prefix))
        })
        .filter_map(|interface| Some(interface.address?.as_sockaddr_in()?.ip()))
        .collect();
    addresses.sort();
    addresses.dedup();
    addresses
}

/// The other addresses of the /24 network around `address`, where the devices people use usually are.
pub fn neighbours(address: Ipv4Addr) -> impl Iterator<Item = Ipv4Addr> {
    let [a, b, c, own] = address.octets();
    (1..=254).filter(move |host| *host != own).map(move |host| Ipv4Addr::new(a, b, c, host))
}
