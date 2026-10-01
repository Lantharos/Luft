use std::io;
use std::os::fd::{AsFd, BorrowedFd, OwnedFd};
use std::path::PathBuf;

use rustix::net::netlink::{self, SocketAddrNetlink};
use rustix::net::{AddressFamily, RecvFlags, SocketFlags, SocketType, bind, recv, socket_with};

const KERNEL_EVENTS: u32 = 1;

#[derive(Debug, PartialEq, Eq)]
pub enum CardEvent {
    Added(PathBuf),
    Removed(PathBuf),
    Changed(PathBuf),
}

pub struct CardEvents {
    socket: OwnedFd,
}

impl AsFd for CardEvents {
    fn as_fd(&self) -> BorrowedFd<'_> {
        self.socket.as_fd()
    }
}

fn parse(message: &[u8]) -> Option<CardEvent> {
    let mut action = None;
    let mut device = None;
    let mut is_drm = false;
    for field in message
        .split(|byte| *byte == 0)
        .filter_map(|field| std::str::from_utf8(field).ok())
    {
        if let Some(value) = field.strip_prefix("ACTION=") {
            action = Some(value);
        } else if let Some(value) = field.strip_prefix("DEVNAME=") {
            device = Some(value);
        } else if field == "SUBSYSTEM=drm" {
            is_drm = true;
        }
    }
    let device = device.filter(|name| is_drm && name.starts_with("dri/card"))?;
    let path = PathBuf::from("/dev").join(device);
    match action? {
        "add" => Some(CardEvent::Added(path)),
        "remove" => Some(CardEvent::Removed(path)),
        "change" => Some(CardEvent::Changed(path)),
        _ => None,
    }
}

impl CardEvents {
    pub fn open() -> io::Result<Self> {
        let socket = socket_with(
            AddressFamily::NETLINK,
            SocketType::DGRAM,
            SocketFlags::CLOEXEC | SocketFlags::NONBLOCK,
            Some(netlink::KOBJECT_UEVENT),
        )?;
        bind(&socket, &SocketAddrNetlink::new(0, KERNEL_EVENTS))?;
        Ok(Self { socket })
    }

    pub fn drain(&self) -> Vec<CardEvent> {
        let mut events = Vec::new();
        let mut buffer = [0u8; 8192];
        while let Ok((length, _)) = recv(&self.socket, &mut buffer, RecvFlags::DONTWAIT) {
            events.extend(parse(&buffer[..length.min(buffer.len())]));
        }
        events
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_card_hotplug_messages() {
        let message = b"add@/devices/pci0000:00/0000:00:02.0/drm/card1\0ACTION=add\0DEVPATH=/devices/pci0000:00/0000:00:02.0/drm/card1\0SUBSYSTEM=drm\0DEVNAME=dri/card1\0DEVTYPE=drm_minor\0";
        assert_eq!(
            parse(message),
            Some(CardEvent::Added(PathBuf::from("/dev/dri/card1")))
        );
        let render =
            b"add@/devices/x/drm/renderD128\0ACTION=add\0SUBSYSTEM=drm\0DEVNAME=dri/renderD128\0";
        assert_eq!(parse(render), None);
    }
}
