use std::{
    io,
    os::{fd::AsRawFd, unix::net::UnixStream},
    process::{Child, Command},
    sync::Arc,
};

use smithay::reexports::wayland_server::DisplayHandle;
use tracing::{info, warn};

use crate::ClientState;

#[derive(Debug)]
pub struct LockProcess {
    display: DisplayHandle,
    command: String,
    child: Option<Child>,
}

impl LockProcess {
    pub fn new(display: DisplayHandle, command: String) -> Self {
        Self {
            display,
            command,
            child: None,
        }
    }

    pub fn set_command(&mut self, command: String) {
        self.command = command;
    }

    pub fn start(&mut self) -> io::Result<()> {
        self.tick();
        if self.child.is_some() {
            return Ok(());
        }

        let (server, client) = UnixStream::pair()?;
        self.display
            .insert_client(
                server,
                Arc::new(ClientState {
                    privileged: true,
                    ..ClientState::default()
                }),
            )
            .map_err(|error| io::Error::other(error.to_string()))?;
        let flags = rustix::io::fcntl_getfd(&client)?;
        rustix::io::fcntl_setfd(&client, flags & !rustix::io::FdFlags::CLOEXEC)?;

        let child = Command::new("sh")
            .args(["-lc", &self.command])
            .env_remove("WAYLAND_DISPLAY")
            .env("WAYLAND_SOCKET", client.as_raw_fd().to_string())
            .spawn()?;
        info!(pid = child.id(), "started session lock");
        self.child = Some(child);
        Ok(())
    }

    pub fn tick(&mut self) {
        let Some(child) = self.child.as_mut() else {
            return;
        };
        match child.try_wait() {
            Ok(None) => {}
            Ok(Some(status)) => {
                info!(?status, "session lock exited");
                let mut child = self.child.take().expect("session lock child exists");
                let _ = child.wait();
            }
            Err(error) => {
                warn!(%error, "failed to inspect session lock process");
            }
        }
    }
}

impl Drop for LockProcess {
    fn drop(&mut self) {
        if let Some(mut child) = self.child.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}
