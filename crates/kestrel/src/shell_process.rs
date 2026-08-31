use std::{
    env, io,
    os::{fd::AsRawFd, unix::net::UnixStream},
    path::{Path, PathBuf},
    process::{Child, Command},
    time::{Duration, Instant},
};

use luft_ipc::{SHELL_CAPABILITY_ENV, SOCKET_ENV, ShellStatus};
use tracing::{info, warn};

use crate::wayland_broker::{BROKER_FD_ENV, BROKER_KEY_ENV};

const STABLE_PROCESS_WINDOW: Duration = Duration::from_secs(30);

pub struct ShellProcessConfig {
    pub enabled: bool,
    pub app_wayland_socket: String,
    pub ipc_socket: PathBuf,
    pub ipc_capability: String,
    pub xwayland_display: Option<String>,
    pub skip_startup_apps: bool,
}

pub struct ShellProcess {
    broker: UnixStream,
    broker_key: String,
    child: Option<Child>,
    enabled: bool,
    app_wayland_socket: String,
    ipc_socket: PathBuf,
    ipc_capability: String,
    xwayland_display: Option<String>,
    skip_startup_apps: bool,
    restart_at: Instant,
    started_at: Option<Instant>,
    failures: u32,
}

impl std::fmt::Debug for ShellProcess {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("ShellProcess")
            .field("pid", &self.child.as_ref().map(Child::id))
            .field("enabled", &self.enabled)
            .field("app_wayland_socket", &self.app_wayland_socket)
            .field("ipc_socket", &self.ipc_socket)
            .field("xwayland_display", &self.xwayland_display)
            .field("skip_startup_apps", &self.skip_startup_apps)
            .field("restart_at", &self.restart_at)
            .field("started_at", &self.started_at)
            .field("failures", &self.failures)
            .finish_non_exhaustive()
    }
}

impl ShellProcess {
    pub fn new(broker: UnixStream, broker_key: String, config: ShellProcessConfig) -> Self {
        let mut process = Self {
            broker,
            broker_key,
            child: None,
            enabled: config.enabled,
            app_wayland_socket: config.app_wayland_socket,
            ipc_socket: config.ipc_socket,
            ipc_capability: config.ipc_capability,
            xwayland_display: config.xwayland_display,
            skip_startup_apps: config.skip_startup_apps,
            restart_at: Instant::now(),
            started_at: None,
            failures: 0,
        };
        process.publish_activation_environment();
        process.tick();
        process
    }

    pub fn tick(&mut self) {
        if !self.enabled {
            return;
        }

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
                Ok(Some(status)) => warn!(?status, "Luft shell exited"),
                Err(error) => {
                    warn!(%error, "failed to inspect Luft shell process");
                    return;
                }
            }
            let mut child = self.child.take().expect("shell child exists");
            let _ = child.wait();
            self.started_at = None;
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
                self.started_at = Some(Instant::now());
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
        self.publish_activation_environment();
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

    fn spawn(&mut self) -> io::Result<Child> {
        let broker = rustix::io::fcntl_dupfd_cloexec(&self.broker, 0)?;
        let flags = rustix::io::fcntl_getfd(&broker)?;
        rustix::io::fcntl_setfd(&broker, flags & !rustix::io::FdFlags::CLOEXEC)?;
        let mut command = Command::new(resolve_shell_binary());
        command
            .env_remove("WAYLAND_SOCKET")
            .env("WAYLAND_DISPLAY", &self.app_wayland_socket)
            .env("LUFT_WAYLAND_DISPLAY", &self.app_wayland_socket)
            .env(SOCKET_ENV, &self.ipc_socket)
            .env(SHELL_CAPABILITY_ENV, &self.ipc_capability)
            .env(BROKER_FD_ENV, broker.as_raw_fd().to_string())
            .env(BROKER_KEY_ENV, &self.broker_key);
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

    fn publish_activation_environment(&self) {
        let mut names = vec![
            "WAYLAND_DISPLAY",
            "XDG_CURRENT_DESKTOP",
            "XDG_SESSION_DESKTOP",
            "XDG_SESSION_TYPE",
        ];
        let mut environment = vec![
            ("WAYLAND_DISPLAY", self.app_wayland_socket.as_str()),
            ("XDG_CURRENT_DESKTOP", "Luft"),
            ("XDG_SESSION_DESKTOP", "luft"),
            ("XDG_SESSION_TYPE", "wayland"),
        ];
        if let Some(display) = self.xwayland_display.as_deref() {
            names.push("DISPLAY");
            environment.push(("DISPLAY", display));
        }

        let mut dbus = Command::new("dbus-update-activation-environment");
        dbus.args(&names);
        for (name, value) in &environment {
            dbus.env(name, value);
        }
        match dbus.status() {
            Ok(status) if status.success() => {}
            Ok(status) => warn!(?status, "failed to update D-Bus activation environment"),
            Err(error) if error.kind() == io::ErrorKind::NotFound => {}
            Err(error) => warn!(%error, "failed to update D-Bus activation environment"),
        }

        if env::var_os("LUFT_PRIVATE_DBUS").is_none() {
            let mut systemd = Command::new("systemctl");
            systemd.args(["--user", "import-environment"]).args(&names);
            for (name, value) in &environment {
                systemd.env(name, value);
            }
            match systemd.status() {
                Ok(status) if status.success() => {}
                Ok(status) => warn!(?status, "failed to update user service environment"),
                Err(error) if error.kind() == io::ErrorKind::NotFound => {}
                Err(error) => warn!(%error, "failed to update user service environment"),
            }
        }
    }

    fn stop(&mut self) {
        let Some(mut child) = self.child.take() else {
            return;
        };
        self.started_at = None;
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
