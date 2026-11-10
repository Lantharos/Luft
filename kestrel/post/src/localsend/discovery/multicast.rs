use std::collections::HashSet;
use std::io;
use std::net::{Ipv4Addr, SocketAddr, SocketAddrV4};
use std::sync::Mutex;

use socket2::{Domain, Protocol, SockRef, Socket, Type};
use tokio::net::UdpSocket;

use super::interfaces;
use crate::localsend::protocol::PORT;

pub const GROUP: Ipv4Addr = Ipv4Addr::new(224, 0, 0, 167);

pub struct Multicast {
    socket: UdpSocket,
    joined: Mutex<HashSet<Ipv4Addr>>,
    sending: tokio::sync::Mutex<()>,
}

impl Multicast {
    pub fn bind() -> io::Result<Self> {
        let socket = Socket::new(Domain::IPV4, Type::DGRAM, Some(Protocol::UDP))?;
        socket.set_reuse_address(true)?;
        socket.set_reuse_port(true)?;
        socket.set_multicast_loop_v4(true)?;
        socket.set_multicast_ttl_v4(1)?;
        socket.set_nonblocking(true)?;
        socket.bind(&SocketAddr::from(SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, PORT)).into())?;
        Ok(Self { socket: UdpSocket::from_std(socket.into())?, joined: Mutex::default(), sending: Default::default() })
    }

    pub fn follow(&self, home: &HashSet<String>) -> bool {
        let current: HashSet<Ipv4Addr> = interfaces::multicast_addresses(home).into_iter().collect();
        let mut joined = self.joined.lock().unwrap();
        joined.retain(|address| {
            let home = current.contains(address);
            if !home {
                let _ = self.socket.leave_multicast_v4(GROUP, *address);
            }
            home
        });
        let mut any = false;
        for address in current {
            if joined.contains(&address) {
                continue;
            }
            let fresh = match self.socket.join_multicast_v4(GROUP, address) {
                Ok(()) => true,
                Err(error) => error.raw_os_error() == Some(nix::libc::EADDRINUSE),
            };
            if fresh {
                joined.insert(address);
                any = true;
            }
        }
        any
    }

    pub async fn send(&self, message: &[u8]) {
        let _one_at_a_time = self.sending.lock().await;
        let addresses: Vec<Ipv4Addr> = self.joined.lock().unwrap().iter().copied().collect();
        for address in addresses {
            if SockRef::from(&self.socket).set_multicast_if_v4(&address).is_ok() {
                let _ = self.socket.send_to(message, (GROUP, PORT)).await;
            }
        }
    }

    pub async fn receive(&self, buffer: &mut [u8]) -> io::Result<(usize, SocketAddr)> {
        self.socket.recv_from(buffer).await
    }
}
