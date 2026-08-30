use std::{
    env, io,
    path::{Path, PathBuf},
    process::{Child, Command},
    time::{Duration, Instant},
};

use luft_ipc::{SOCKET_ENV, ShellStatus};
use tracing::{info, warn};

#[derive(Debug)]
pub struct ShellProcess {
    child: Option<Child>,
    enabled: bool,
    wayland_socket: String,
    app_wayland_socket: String,
    ipc_socket: PathBuf,
    xwayland_display: Option<String>,
    skip_startup_apps: bool,
    restart_at: Instant,
    failures: u32,
}

impl ShellProcess {
    pub fn new(
        enabled: bool,
        wayland_socket: String,
        app_wayland_socket: String,
        ipc_socket: PathBuf,
        xwayland_display: Option<String>,
        skip_startup_apps: bool,
    ) -> Self {
        let mut process = Self {
            child: None,
            enabled,
            wayland_socket,
            app_wayland_socket,
            ipc_socket,
            xwayland_display,
            skip_startup_apps,
            restart_at: Instant::now(),
            failures: 0,
        };
        process.tick();
        process
    }

    pub fn tick(&mut self) {
        if !self.enabled {
            return;
        }

        if let Some(child) = self.child.as_mut() {
            match child.try_wait() {
                Ok(None) => return,
                Ok(Some(status)) => warn!(?status, "Luft shell exited"),
                Err(error) => warn!(%error, "failed to inspect Luft shell process"),
            }
            self.child = None;
            self.failures = self.failures.saturating_add(1);
            let delay = 1_u64.checked_shl(self.failures.min(4)).unwrap_or(16);
            self.restart_at = Instant::now() + Duration::from_secs(delay);
        }

        if Instant::now() < self.restart_at {
            return;
        }

        match self.spawn() {
            Ok(child) => {
                info!(pid = child.id(), "started Luft shell");
                self.child = Some(child);
            }
            Err(error) => {
                warn!(%error, "failed to start Luft shell");
                self.failures = self.failures.saturating_add(1);
                self.restart_at = Instant::now() + Duration::from_secs(5);
            }
        }
    }

    pub fn restart(&mut self) {
        self.stop();
        self.failures = 0;
        self.restart_at = Instant::now();
        self.tick();
    }

    pub fn set_xwayland_display(&mut self, display: Option<String>) {
        if self.xwayland_display == display {
            return;
        }
        self.xwayland_display = display;
        self.restart();
    }

    pub fn status(&self) -> ShellStatus {
        if !self.enabled {
            ShellStatus::NotStarted
        } else if self.child.is_some() {
            ShellStatus::Running
        } else if self.failures == 0 {
            ShellStatus::NotStarted
        } else {
            ShellStatus::Restarting
        }
    }

    fn spawn(&self) -> io::Result<Child> {
        let mut command = Command::new(resolve_shell_binary());
        command
            .env("WAYLAND_DISPLAY", &self.wayland_socket)
            .env("LUFT_PRIVILEGED_WAYLAND_DISPLAY", &self.wayland_socket)
            .env("LUFT_WAYLAND_DISPLAY", &self.app_wayland_socket)
            .env(SOCKET_ENV, &self.ipc_socket);
        if self.skip_startup_apps {
            command.env("LUFT_SKIP_STARTUP_APPS", "1");
        }
        if let Some(display) = &self.xwayland_display {
            command
                .env("DISPLAY", display)
                .env("_JAVA_AWT_WM_NONREPARENTING", "1");
        }
        command.spawn()
    }

    fn stop(&mut self) {
        let Some(mut child) = self.child.take() else {
            return;
        };
        let _ = child.kill();
        let _ = child.wait();
    }
}

impl Drop for ShellProcess {
    fn drop(&mut self) {
        self.stop();
    }
}

fn resolve_shell_binary() -> PathBuf {
    if let Some(path) = env::var_os("LUFT_SHELL") {
        return PathBuf::from(path);
    }
    if let Ok(mut path) = env::current_exe() {
        path.set_file_name("luft-shell");
        if path.is_file() {
            return path;
        }
    }
    Path::new("luft-shell").to_path_buf()
}
