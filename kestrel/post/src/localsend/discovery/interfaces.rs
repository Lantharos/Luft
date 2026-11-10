use std::collections::HashSet;
use std::net::Ipv4Addr;

use nix::ifaddrs::getifaddrs;
use nix::net::if_::InterfaceFlags;

pub fn multicast_addresses(home: &HashSet<String>) -> Vec<Ipv4Addr> {
    let Ok(interfaces) = getifaddrs() else {
        return Vec::new();
    };
    let mut addresses: Vec<Ipv4Addr> = interfaces
        .filter(|interface| {
            let flags = interface.flags;
            flags.contains(InterfaceFlags::IFF_UP | InterfaceFlags::IFF_RUNNING | InterfaceFlags::IFF_MULTICAST)
                && !flags.contains(InterfaceFlags::IFF_LOOPBACK)
                && home.contains(&interface.interface_name)
        })
        .filter_map(|interface| Some(interface.address?.as_sockaddr_in()?.ip()))
        .collect();
    addresses.sort();
    addresses.dedup();
    addresses
}

pub fn same_subnet_addresses(address: Ipv4Addr) -> impl Iterator<Item = Ipv4Addr> {
    let [a, b, c, own] = address.octets();
    (1..=254).filter(move |host| *host != own).map(move |host| Ipv4Addr::new(a, b, c, host))
}
