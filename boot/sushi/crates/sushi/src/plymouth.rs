use std::io::{self, Read, Write};
use std::os::fd::{AsFd, BorrowedFd};
use std::os::linux::net::SocketAddrExt;
use std::os::unix::net::{SocketAddr, UnixListener, UnixStream};
use std::path::PathBuf;

use rustix::net::sockopt::socket_peercred;

const SOCKET: &str = "/org/freedesktop/plymouthd";
const WITH_ARGUMENT: u8 = 2;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Request {
    Ping,
    ChangeMode(String),
    SystemUpdate(u8),
    ShowMessage(String),
    HideMessage(String),
    ShowSplash,
    HideSplash,
    Deactivate,
    Reactivate,
    Quit { retain_splash: bool },
    NewRoot(PathBuf),
    HasActiveVt,
    CachedPassword,
    Interactive,
    Notice,
    Unknown,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Response {
    Ack,
    Nak,
    NoAnswer,
}

impl Response {
    fn byte(self) -> u8 {
        match self {
            Self::Ack => 0x06,
            Self::Nak => 0x15,
            Self::NoAnswer => 0x05,
        }
    }
}

#[derive(Debug, PartialEq, Eq)]
struct Malformed;

fn text(argument: &[u8]) -> String {
    String::from_utf8_lossy(argument).into_owned()
}

fn request(command: u8, argument: &[u8]) -> Request {
    match command {
        b'P' => Request::Ping,
        b'C' => Request::ChangeMode(text(argument)),
        b'u' => Request::SystemUpdate(
            text(argument)
                .parse()
                .ok()
                .filter(|percent| *percent <= 100)
                .unwrap_or(0),
        ),
        b'M' => Request::ShowMessage(text(argument)),
        b'm' => Request::HideMessage(text(argument)),
        b'$' => Request::ShowSplash,
        b'H' => Request::HideSplash,
        b'D' => Request::Deactivate,
        b'r' => Request::Reactivate,
        b'Q' => Request::Quit {
            retain_splash: argument.first().is_some_and(|flag| *flag != 0),
        },
        b'R' => Request::NewRoot(PathBuf::from(text(argument))),
        b'V' => Request::HasActiveVt,
        b'c' => Request::CachedPassword,
        b'*' | b'W' | b'K' => Request::Interactive,
        b'U' | b'S' | b'!' | b'l' | b'L' | b'A' | b'a' => Request::Notice,
        _ => Request::Unknown,
    }
}

fn parse(received: &[u8]) -> Result<Option<(Request, usize)>, Malformed> {
    let Some(&[command, marker]) = received.first_chunk::<2>() else {
        return Ok(None);
    };
    match marker {
        0 => Ok(Some((request(command, &[]), 2))),
        WITH_ARGUMENT => {
            let Some(&size) = received.get(2) else {
                return Ok(None);
            };
            let size = usize::from(size);
            let Some(argument) = received.get(3..3 + size) else {
                return Ok(None);
            };
            match argument.split_last() {
                Some((0, argument)) => Ok(Some((request(command, argument), 3 + size))),
                _ => Err(Malformed),
            }
        }
        _ => Err(Malformed),
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Client(u64);

struct Connection {
    client: Client,
    stream: UnixStream,
    received: Vec<u8>,
    from_root: bool,
}

impl Connection {
    fn read(&mut self) -> (Vec<Request>, bool) {
        let mut buffer = [0u8; 1024];
        let open = loop {
            match self.stream.read(&mut buffer) {
                Ok(0) => break false,
                Ok(length) => self.received.extend_from_slice(&buffer[..length]),
                Err(error) if error.kind() == io::ErrorKind::WouldBlock => break true,
                Err(error) if error.kind() == io::ErrorKind::Interrupted => {}
                Err(_) => break false,
            }
        };
        let mut requests = Vec::new();
        let mut consumed = 0;
        loop {
            match parse(&self.received[consumed..]) {
                Ok(Some((request, length))) => {
                    requests.push(request);
                    consumed += length;
                }
                Ok(None) => break,
                Err(Malformed) => return (requests, false),
            }
        }
        self.received.drain(..consumed);
        (requests, open)
    }
}

pub struct Server {
    listener: UnixListener,
    connections: Vec<Connection>,
    next: u64,
}

impl Server {
    pub fn listen() -> io::Result<Self> {
        let listener = UnixListener::bind_addr(&SocketAddr::from_abstract_name(SOCKET)?)?;
        listener.set_nonblocking(true)?;
        Ok(Self {
            listener,
            connections: Vec::new(),
            next: 0,
        })
    }

    pub fn fds(&self) -> impl Iterator<Item = BorrowedFd<'_>> {
        std::iter::once(self.listener.as_fd()).chain(
            self.connections
                .iter()
                .map(|connection| connection.stream.as_fd()),
        )
    }

    fn accept(&mut self) {
        while let Ok((stream, _)) = self.listener.accept() {
            if stream.set_nonblocking(true).is_err() {
                continue;
            }
            let from_root = socket_peercred(&stream).is_ok_and(|peer| peer.uid.is_root());
            self.connections.push(Connection {
                client: Client(self.next),
                stream,
                received: Vec::new(),
                from_root,
            });
            self.next += 1;
        }
    }

    pub fn receive(&mut self) -> Vec<(Client, Request)> {
        self.accept();
        let mut received = Vec::new();
        self.connections.retain_mut(|connection| {
            let (requests, open) = connection.read();
            for request in requests {
                if connection.from_root {
                    received.push((connection.client, request));
                } else {
                    let _ = connection.stream.write_all(&[Response::Nak.byte()]);
                }
            }
            open
        });
        received
    }

    pub fn reply(&mut self, client: Client, response: Response) {
        if let Some(connection) = self
            .connections
            .iter_mut()
            .find(|connection| connection.client == client)
        {
            let _ = connection.stream.write_all(&[response.byte()]);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_requests_as_the_plymouth_client_sends_them() {
        let mut stream = b"P\0".to_vec();
        stream.extend(b"C\x02\x08updates\0");
        stream.extend(b"u\x02\x0342\0");
        stream.extend(b"Q\x02\x02\x01\0");
        stream.extend(b"Q\x02\x01\0");
        stream.extend(b"M\x02\x05");
        let mut requests = Vec::new();
        let mut at = 0;
        while let Ok(Some((request, length))) = parse(&stream[at..]) {
            requests.push(request);
            at += length;
        }
        assert_eq!(
            requests,
            [
                Request::Ping,
                Request::ChangeMode("updates".into()),
                Request::SystemUpdate(42),
                Request::Quit {
                    retain_splash: true
                },
                Request::Quit {
                    retain_splash: false
                },
            ]
        );
        assert_eq!(at, stream.len() - 3);
    }
}
