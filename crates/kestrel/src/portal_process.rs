use std::{
    env, io,
    os::fd::AsRawFd,
    os::unix::net::UnixStream,
    path::PathBuf,
    process::{Child, Command},
    sync::Arc,
    time::{Duration, Instant},
};

use smithay::reexports::wayland_server::DisplayHandle;
use tracing::{info, warn};

use crate::ClientState;

const STABLE_PROCESS_WINDOW: Duration = Duration::from_secs(30);

#[derive(Debug)]
pub struct PortalProcess {
    display: DisplayHandle,
    child: Option<Child>,
    restart_at: Instant,
    started_at: Option<Instant>,
    failures: u32,
}

impl PortalProcess {
    pub fn new(display: DisplayHandle) -> Self {
        let mut process = Self {
            display,
            child: None,
            restart_at: Instant::now(),
            started_at: None,
            failures: 0,
        };
        process.tick();
        process
    }

    pub fn tick(&mut self) {
        if let Some(child) = self.child.as_mut() {
            match child.try_wait() {
                Ok(None) => {
                    if self
                        .started_at
                        .is_some_and(|started| started.elapsed() >= STABLE_PROCESS_WINDOW)
                    {
                        self.failures = 0;
                        self.started_at = None;
                    }
                    return;
                }
                Ok(Some(status)) => warn!(?status, "Luft portal exited"),
                Err(error) => warn!(%error, "failed to inspect Luft portal process"),
            }
            self.child = None;
            self.started_at = None;
            self.failures = self.failures.saturating_add(1);
            let delay = 1_u64.checked_shl(self.failures.min(4)).unwrap_or(16);
            self.restart_at = Instant::now() + Duration::from_secs(delay);
        }

        if Instant::now() < self.restart_at {
            return;
        }

        match spawn(&mut self.display) {
            Ok(child) => {
                info!(pid = child.id(), "started Luft portal");
                self.child = Some(child);
                self.started_at = Some(Instant::now());
            }
            Err(error) => {
                warn!(%error, "failed to start Luft portal");
                self.failures = self.failures.saturating_add(1);
                self.restart_at = Instant::now() + Duration::from_secs(5);
            }
        }
    }
}

impl Drop for PortalProcess {
    fn drop(&mut self) {
        if let Some(mut child) = self.child.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}

fn spawn(display: &mut DisplayHandle) -> io::Result<Child> {
    let (server, client) = UnixStream::pair()?;
    display
        .insert_client(
            server,
            Arc::new(ClientState {
                capture_privileged: true,
                ..ClientState::default()
            }),
        )
        .map_err(|error| io::Error::other(error.to_string()))?;

    let flags = rustix::io::fcntl_getfd(&client)?;
    rustix::io::fcntl_setfd(&client, flags & !rustix::io::FdFlags::CLOEXEC)?;
    let mut command = Command::new(resolve_portal_binary());
    command
        .env_remove("WAYLAND_DISPLAY")
        .env("WAYLAND_SOCKET", client.as_raw_fd().to_string());
    let child = command.spawn()?;
    drop(client);
    Ok(child)
}

fn resolve_portal_binary() -> PathBuf {
    if let Some(path) = env::var_os("LUFT_PORTAL") {
        return PathBuf::from(path);
    }
    if let Ok(mut path) = env::current_exe() {
        path.set_file_name("luft-portal");
        if path.exists() {
            return path;
        }
    }
    PathBuf::from("luft-portal")
}
