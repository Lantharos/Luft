use std::io;
use std::os::fd::OwnedFd;

use rustix::io::Errno;
use rustix::net::netlink::{self, SocketAddrNetlink};
use rustix::net::{AddressFamily, RecvFlags, SocketFlags, SocketType, bind, recv, socket_with};
use tokio::io::unix::AsyncFd;

const KERNEL_EVENTS: u32 = 1;
const MESSAGE_SIZE: usize = 8192;

#[derive(Debug, PartialEq, Eq)]
pub enum Event {
    Added(String),
    Removed(String),
    Missed,
}

pub struct Events {
    socket: AsyncFd<OwnedFd>,
}

fn parse(message: &[u8]) -> Option<Event> {
    let mut action = None;
    let mut path = None;
    let mut is_device = false;
    for field in message
        .split(|byte| *byte == 0)
        .filter_map(|field| std::str::from_utf8(field).ok())
    {
        if let Some(value) = field.strip_prefix("ACTION=") {
            action = Some(value);
        } else if let Some(value) = field.strip_prefix("DEVPATH=") {
            path = Some(value);
        } else if field == "DEVTYPE=usb_device" {
            is_device = true;
        }
    }
    let id = path.filter(|_| is_device)?.rsplit('/').next()?.to_owned();
    match action? {
        "add" => Some(Event::Added(id)),
        "remove" => Some(Event::Removed(id)),
        _ => None,
    }
}

impl Events {
    pub fn open() -> io::Result<Self> {
        let socket = socket_with(
            AddressFamily::NETLINK,
            SocketType::DGRAM,
            SocketFlags::CLOEXEC | SocketFlags::NONBLOCK,
            Some(netlink::KOBJECT_UEVENT),
        )?;
        bind(&socket, &SocketAddrNetlink::new(0, KERNEL_EVENTS))?;
        Ok(Self {
            socket: AsyncFd::new(socket)?,
        })
    }

    pub async fn next(&self) -> io::Result<Event> {
        let mut message = [0u8; MESSAGE_SIZE];
        loop {
            let mut ready = self.socket.readable().await?;
            match recv(ready.get_inner(), &mut message, RecvFlags::DONTWAIT) {
                Ok((length, _)) => {
                    if let Some(event) = parse(&message[..length.min(MESSAGE_SIZE)]) {
                        return Ok(event);
                    }
                }
                Err(Errno::AGAIN) => ready.clear_ready(),
                Err(Errno::NOBUFS) => return Ok(Event::Missed),
                Err(error) => return Err(error.into()),
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_usb_devices_announced_by_the_kernel() {
        let device = b"add@/devices/pci0000:00/0000:00:14.0/usb3/3-2\0ACTION=add\0DEVPATH=/devices/pci0000:00/0000:00:14.0/usb3/3-2\0SUBSYSTEM=usb\0DEVTYPE=usb_device\0SEQNUM=5012\0";
        assert_eq!(parse(device), Some(Event::Added("3-2".to_owned())));
        let interface = b"add@/devices/pci0000:00/0000:00:14.0/usb3/3-2/3-2:1.0\0ACTION=add\0DEVPATH=/devices/pci0000:00/0000:00:14.0/usb3/3-2/3-2:1.0\0SUBSYSTEM=usb\0DEVTYPE=usb_interface\0SEQNUM=5013\0";
        assert_eq!(parse(interface), None);
    }
}
