use std::io;
use std::os::fd::{AsFd, BorrowedFd, OwnedFd};
use std::path::PathBuf;

use rustix::net::netlink::{self, SocketAddrNetlink};
use rustix::net::sockopt::set_socket_recv_buffer_size_force;
use rustix::net::{AddressFamily, RecvFlags, SocketFlags, SocketType, bind, recv, socket_with};

const UDEV_EVENTS: u32 = 2;
const UDEV_PREFIX: &[u8] = b"libudev\0";
const UDEV_MAGIC: u32 = 0xfeed_cafe;
const RECEIVE_BUFFER: usize = 4 << 20;

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

fn properties(message: &[u8]) -> Option<&[u8]> {
    let header = message.strip_prefix(UDEV_PREFIX)?;
    let word = |at: usize| header.get(at..)?.first_chunk::<4>().copied();
    if u32::from_be_bytes(word(0)?) != UDEV_MAGIC {
        return None;
    }
    let offset = u32::from_ne_bytes(word(8)?) as usize;
    let length = u32::from_ne_bytes(word(12)?) as usize;
    message.get(offset..offset.checked_add(length)?)
}

fn parse(message: &[u8]) -> Option<CardEvent> {
    let mut action = None;
    let mut device = None;
    let mut is_drm = false;
    for field in properties(message)?
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
    let path = PathBuf::from(device.filter(|name| is_drm && name.starts_with("/dev/dri/card"))?);
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
        set_socket_recv_buffer_size_force(&socket, RECEIVE_BUFFER)?;
        bind(&socket, &SocketAddrNetlink::new(0, UDEV_EVENTS))?;
        Ok(Self { socket })
    }

    pub fn drain(&self) -> Vec<CardEvent> {
        let mut events = Vec::new();
        let mut buffer = [0u8; 16384];
        while let Ok((length, _)) = recv(&self.socket, &mut buffer, RecvFlags::DONTWAIT) {
            events.extend(parse(&buffer[..length.min(buffer.len())]));
        }
        events
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn udev_message(properties: &[u8]) -> Vec<u8> {
        let header_size = 40u32;
        let mut message = UDEV_PREFIX.to_vec();
        message.extend(UDEV_MAGIC.to_be_bytes());
        message.extend(header_size.to_ne_bytes());
        message.extend(header_size.to_ne_bytes());
        message.extend((properties.len() as u32).to_ne_bytes());
        message.resize(header_size as usize, 0);
        message.extend(properties);
        message
    }

    #[test]
    fn reads_cards_announced_by_udev() {
        let card = udev_message(
            b"ACTION=add\0DEVPATH=/devices/pci0000:00/0000:00:02.0/drm/card1\0SUBSYSTEM=drm\0DEVNAME=/dev/dri/card1\0DEVTYPE=drm_minor\0SEQNUM=2304\0",
        );
        assert_eq!(
            parse(&card),
            Some(CardEvent::Added(PathBuf::from("/dev/dri/card1")))
        );
        let render =
            udev_message(b"ACTION=add\0SUBSYSTEM=drm\0DEVNAME=/dev/dri/renderD128\0SEQNUM=2305\0");
        assert_eq!(parse(&render), None);
    }
}
