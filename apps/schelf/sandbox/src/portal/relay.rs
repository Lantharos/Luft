use std::os::fd::OwnedFd;
use std::os::unix::net::{UnixListener, UnixStream};
use std::path::Path;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::{Arc, Mutex};

use super::Portal;
use super::message::{self, Frame, METHOD_CALL};
use super::wire;

pub const PORTAL_NAME: &str = "org.freedesktop.portal.Flatpak";
const AUTHENTICATED: &[u8] = b"BEGIN\r\n";

/// The app's end of one connection to the bus, where the relay writes the
/// messages coming from the bus and the portal's answers.
pub struct Client {
    pub id: u64,
    stream: Mutex<UnixStream>,
    serial: AtomicU32,
}

impl Client {
    pub fn send(&self, outgoing: &message::Outgoing<'_>) {
        let serial = self.serial.fetch_add(1, Ordering::Relaxed);
        let stream = self.stream.lock().expect("client stream");
        let _ = wire::send(&stream, &outgoing.bytes(serial), &[]);
    }

    fn forward(&self, frame: &Frame) -> std::io::Result<()> {
        let stream = self.stream.lock().expect("client stream");
        wire::send(&stream, &frame.bytes, &frame.fds)
    }
}

/// Accepts the app's connections to its session bus and relays each to
/// `upstream`, the bus proxy, answering the Flatpak portal itself.
pub fn serve(listener: UnixListener, upstream: &Path, portal: Arc<Portal>) {
    let upstream = upstream.to_path_buf();
    std::thread::spawn(move || {
        for (id, app) in listener.incoming().flatten().enumerate() {
            let Ok(bus) = UnixStream::connect(&upstream) else {
                continue;
            };
            relay(id as u64, app, bus, portal.clone());
        }
    });
}

fn relay(id: u64, app: UnixStream, bus: UnixStream, portal: Arc<Portal>) {
    let (Ok(app_reader), Ok(bus_writer)) = (app.try_clone(), bus.try_clone()) else {
        return;
    };
    let client = Arc::new(Client {
        id,
        stream: Mutex::new(app),
        serial: AtomicU32::new(1),
    });
    let authenticated = Arc::new(AtomicBool::new(false));
    let downstream = (client.clone(), authenticated.clone());
    std::thread::spawn(move || from_bus(bus, &downstream.0, &downstream.1));
    std::thread::spawn(move || {
        from_app(&app_reader, &bus_writer, &client, &authenticated, &portal);
        portal.disconnected(client.id);
        let _ = bus_writer.shutdown(std::net::Shutdown::Both);
    });
}

/// Takes whole messages off the front of `bytes`, with their descriptors.
fn frames(
    bytes: &mut Vec<u8>,
    fds: &mut Vec<OwnedFd>,
) -> Result<Vec<(message::Header, Frame)>, String> {
    let mut found = Vec::new();
    while let Some(length) = message::length(bytes) {
        let length = length?;
        if bytes.len() < length {
            break;
        }
        let header = message::header(&bytes[..length])?;
        let count = (header.unix_fds as usize).min(fds.len());
        let frame = Frame {
            bytes: bytes.drain(..length).collect(),
            fds: fds.drain(..count).collect(),
        };
        found.push((header, frame));
    }
    Ok(found)
}

fn authentication_end(bytes: &[u8]) -> Option<usize> {
    bytes
        .windows(AUTHENTICATED.len())
        .enumerate()
        .find(|(at, window)| *window == AUTHENTICATED && (*at == 0 || bytes[at - 1] == b'\n'))
        .map(|(at, _)| at + AUTHENTICATED.len())
}

fn from_app(
    app: &UnixStream,
    bus: &UnixStream,
    client: &Arc<Client>,
    authenticated: &AtomicBool,
    portal: &Arc<Portal>,
) {
    let mut receiver = wire::Receiver::default();
    let mut bytes = Vec::new();
    let mut fds = Vec::new();
    while !authenticated.load(Ordering::Acquire) {
        if !matches!(receiver.receive(app, &mut bytes, &mut fds), Ok(true)) {
            return;
        }
        let Some(end) = authentication_end(&bytes) else {
            let keep = bytes
                .iter()
                .rposition(|byte| *byte == b'\n')
                .map_or(0, |at| at + 1);
            if wire::send(bus, &bytes[..keep], &[]).is_err() {
                return;
            }
            bytes.drain(..keep);
            continue;
        };
        authenticated.store(true, Ordering::Release);
        if wire::send(bus, &bytes[..end], &[]).is_err() {
            return;
        }
        bytes.drain(..end);
    }
    loop {
        let Ok(found) = frames(&mut bytes, &mut fds) else {
            return;
        };
        for (header, frame) in found {
            if header.kind == METHOD_CALL && header.destination == PORTAL_NAME {
                portal.answer(client, &header, frame);
            } else if wire::send(bus, &frame.bytes, &frame.fds).is_err() {
                return;
            }
        }
        if !matches!(receiver.receive(app, &mut bytes, &mut fds), Ok(true)) {
            return;
        }
    }
}

fn from_bus(bus: UnixStream, client: &Client, authenticated: &AtomicBool) {
    let mut receiver = wire::Receiver::default();
    let mut bytes = Vec::new();
    let mut fds = Vec::new();
    while let Ok(true) = receiver.receive(&bus, &mut bytes, &mut fds) {
        if !authenticated.load(Ordering::Acquire) {
            let stream = client.stream.lock().expect("client stream");
            if wire::send(&stream, &bytes, &[]).is_err() {
                return;
            }
            bytes.clear();
            continue;
        }
        let Ok(found) = frames(&mut bytes, &mut fds) else {
            break;
        };
        for (_, frame) in found {
            if client.forward(&frame).is_err() {
                return;
            }
        }
    }
    let stream = client.stream.lock().expect("client stream");
    let _ = stream.shutdown(std::net::Shutdown::Both);
}
