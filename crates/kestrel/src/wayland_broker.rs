use std::{
    fs::File,
    io::{self, IoSlice, Read, Write},
    mem::MaybeUninit,
    os::{fd::AsFd, unix::net::UnixStream},
    sync::Arc,
    thread::{self, JoinHandle},
};

use rustix::net::{SendAncillaryBuffer, SendAncillaryMessage, SendFlags, sendmsg};
use smithay::reexports::wayland_server::DisplayHandle;

use crate::ClientState;

pub const BROKER_FD_ENV: &str = "SABINE_WAYLAND_BROKER_FD";
pub const BROKER_KEY_ENV: &str = "SABINE_WAYLAND_BROKER_KEY";

pub struct WaylandConnectionBroker {
    client: UnixStream,
    key: String,
    shutdown: UnixStream,
    thread: Option<JoinHandle<()>>,
}

impl std::fmt::Debug for WaylandConnectionBroker {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("WaylandConnectionBroker")
            .field("worker_running", &self.thread.is_some())
            .finish_non_exhaustive()
    }
}

impl WaylandConnectionBroker {
    pub fn new(mut display: DisplayHandle) -> io::Result<Self> {
        let (mut server, client) = UnixStream::pair()?;
        server.set_write_timeout(Some(std::time::Duration::from_secs(2)))?;
        client.set_read_timeout(Some(std::time::Duration::from_secs(2)))?;
        client.set_write_timeout(Some(std::time::Duration::from_secs(2)))?;
        let key = random_key()?;
        let shutdown = server.try_clone()?;
        let thread = thread::spawn(move || {
            let mut requests = [0_u8; 32];
            while let Ok(count) = server.read(&mut requests) {
                if count == 0 {
                    break;
                }
                for _ in 0..count {
                    let Ok((wayland_server, wayland_client)) = UnixStream::pair() else {
                        let _ = server.write_all(&[0]);
                        continue;
                    };
                    let client_state = ClientState {
                        privileged: true,
                        ..ClientState::default()
                    };
                    if display
                        .insert_client(wayland_server, Arc::new(client_state))
                        .is_err()
                    {
                        let _ = server.write_all(&[0]);
                        continue;
                    }
                    if send_connection(&server, &wayland_client).is_err() {
                        return;
                    }
                }
            }
        });
        Ok(Self {
            client,
            key,
            shutdown,
            thread: Some(thread),
        })
    }

    pub fn client(&self) -> io::Result<UnixStream> {
        self.client.try_clone()
    }

    pub fn key(&self) -> &str {
        &self.key
    }
}

fn random_key() -> io::Result<String> {
    let mut bytes = [0_u8; 32];
    File::open("/dev/urandom")?.read_exact(&mut bytes)?;
    let mut key = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        use std::fmt::Write as _;
        write!(&mut key, "{byte:02x}").expect("writing to a String cannot fail");
    }
    Ok(key)
}

impl Drop for WaylandConnectionBroker {
    fn drop(&mut self) {
        let _ = self.shutdown.shutdown(std::net::Shutdown::Both);
        if let Some(thread) = self.thread.take() {
            let _ = thread.join();
        }
    }
}

fn send_connection(broker: &UnixStream, connection: &UnixStream) -> io::Result<()> {
    let descriptor = [connection.as_fd()];
    let mut space = [MaybeUninit::uninit(); rustix::cmsg_space!(ScmRights(1))];
    let mut control = SendAncillaryBuffer::new(&mut space);
    control.push(SendAncillaryMessage::ScmRights(&descriptor));
    let sent = sendmsg(
        broker,
        &[IoSlice::new(&[1])],
        &mut control,
        SendFlags::NOSIGNAL,
    )?;
    if sent != 1 {
        return Err(io::Error::new(
            io::ErrorKind::WriteZero,
            "Wayland broker response was truncated",
        ));
    }
    Ok(())
}
