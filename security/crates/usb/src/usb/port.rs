use std::fs;
use std::path::{Path, PathBuf};

use super::sysfs::Device;

const DEVICES: &str = "/sys/bus/usb/devices";
const SYSTEM_DEVICES: &str = "/sys/devices/";
const HIGH_SPEED: u32 = 480;

/// A port on a root hub, numbered as that hub counts them.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct RootPort {
    pub bus: u32,
    pub number: u32,
    pub speed: u32,
}

/// A device's place in the tree: its bus and the port on each hub down to it.
#[derive(PartialEq, Eq, Debug)]
pub struct Chain {
    pub bus: u32,
    pub ports: Vec<u32>,
}

impl Chain {
    pub fn of(id: &str) -> Option<Self> {
        let (bus, ports) = id.split_once('-')?;
        Some(Self {
            bus: bus.parse().ok()?,
            ports: ports
                .split('.')
                .map(|port| port.parse().ok())
                .collect::<Option<_>>()?,
        })
    }

    /// The hubs between the computer and the device, nearest first.
    pub fn hubs(&self) -> impl Iterator<Item = String> + '_ {
        (1..self.ports.len()).map(|depth| self.id(depth))
    }

    fn id(&self, depth: usize) -> String {
        let ports: Vec<String> = self.ports[..depth].iter().map(u32::to_string).collect();
        format!("{}-{}", self.bus, ports.join("."))
    }
}

/// Names the socket a device is in the same way whichever speed it came in
/// at: a USB 3 port is two ports to the kernel, one on each of a
/// controller's two root hubs, so the port is named after its slower half.
pub fn place(controller: &str, root: RootPort, peer: Option<RootPort>, below: &[u32]) -> String {
    let named = peer.filter(|peer| peer.speed < root.speed).unwrap_or(root);
    let speed = if named.speed > HIGH_SPEED { "s" } else { "" };
    let mut place = format!("{controller}/{speed}{}", named.number);
    for port in below {
        place.push_str(&format!(".{port}"));
    }
    place
}

fn root_hub(bus: u32) -> PathBuf {
    Path::new(DEVICES).join(format!("usb{bus}"))
}

fn speed(bus: u32) -> Option<u32> {
    fs::read_to_string(root_hub(bus).join("speed"))
        .ok()?
        .trim()
        .parse()
        .ok()
}

fn root_port(bus: u32, number: u32) -> Option<RootPort> {
    Some(RootPort {
        bus,
        number,
        speed: speed(bus)?,
    })
}

fn peer(root: RootPort) -> Option<RootPort> {
    let port = root_hub(root.bus).join(format!(
        "{bus}-0:1.0/usb{bus}-port{number}/peer",
        bus = root.bus,
        number = root.number
    ));
    let linked = fs::read_link(port).ok()?;
    let name = linked.file_name()?.to_str()?;
    let (hub, number) = name.strip_prefix("usb")?.split_once("-port")?;
    root_port(hub.parse().ok()?, number.parse().ok()?)
}

fn controller(bus: u32) -> Option<String> {
    let hub = fs::canonicalize(root_hub(bus)).ok()?;
    let controller = hub.parent()?.to_str()?;
    Some(controller.strip_prefix(SYSTEM_DEVICES)?.to_owned())
}

/// Where the device `id`, such as `3-2.1`, is plugged in.
pub fn of(id: &str) -> Option<String> {
    let chain = Chain::of(id)?;
    let (first, below) = chain.ports.split_first()?;
    let root = root_port(chain.bus, *first)?;
    Some(place(&controller(chain.bus)?, root, peer(root), below))
}

/// Whether the device is wired inside the computer, as its firmware says of
/// the port, along with every hub on the way. A hub that says its own ports
/// are fixed proves nothing unless it is fixed too.
pub fn built_in(id: &str) -> bool {
    Chain::of(id).is_some_and(|chain| {
        Device::named(id).is_fixed() && chain.hubs().all(|hub| Device::named(&hub).is_fixed())
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    const XHCI: &str = "pci0000:00/0000:00:14.0";

    fn port(bus: u32, number: u32, speed: u32) -> RootPort {
        RootPort { bus, number, speed }
    }

    #[test]
    fn a_socket_has_one_name_at_either_speed() {
        let high = port(3, 2, 480);
        let super_speed = port(4, 1, 5000);
        let at_usb2 = place(XHCI, high, Some(super_speed), &[]);
        let at_usb3 = place(XHCI, super_speed, Some(high), &[]);
        assert_eq!(at_usb2, at_usb3);
        assert_eq!(at_usb2, format!("{XHCI}/2"));
    }

    #[test]
    fn a_super_speed_only_port_isnt_mistaken_for_a_usb2_one() {
        let only = place(XHCI, port(4, 2, 10000), None, &[]);
        assert_ne!(only, place(XHCI, port(3, 2, 480), None, &[]));
    }

    #[test]
    fn ports_of_other_controllers_and_hubs_differ() {
        let root = port(3, 2, 480);
        assert_ne!(
            place(XHCI, root, None, &[]),
            place("pci0000:00/0000:00:0d.0", root, None, &[])
        );
        assert_eq!(place(XHCI, root, None, &[4, 1]), format!("{XHCI}/2.4.1"));
        assert_ne!(place(XHCI, root, None, &[4]), place(XHCI, root, None, &[1]));
    }

    #[test]
    fn reads_the_hubs_on_the_way_to_a_device() {
        let chain = Chain::of("3-2.4.1").unwrap();
        assert_eq!(
            chain,
            Chain {
                bus: 3,
                ports: vec![2, 4, 1]
            }
        );
        assert_eq!(chain.hubs().collect::<Vec<_>>(), ["3-2", "3-2.4"]);
        assert!(Chain::of("usb3").is_none());
        assert!(Chain::of("3-2:1.0").is_none());
    }
}
