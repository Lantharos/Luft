use std::{
    env, io,
    path::Path,
    process::{Child, Command},
    time::{Duration, Instant},
};

use luft_ipc::XwaylandStatus;
use tracing::{info, warn};

const STABLE_PROCESS_WINDOW: Duration = Duration::from_secs(30);

#[derive(Debug)]
pub struct XwaylandProcess {
    child: Option<Child>,
    enabled: bool,
    available: bool,
    display: Option<String>,
    wayland_socket: String,
    restart_at: Instant,
    started_at: Option<Instant>,
    failures: u32,
}

impl XwaylandProcess {
    pub fn new(enabled: bool, wayland_socket: String) -> Self {
        let display = enabled.then(find_display).flatten();
        let mut process = Self {
            child: None,
            enabled,
            available: true,
            display,
            wayland_socket,
            restart_at: Instant::now(),
            started_at: None,
            failures: 0,
        };
        process.tick();
        process
    }

    pub fn tick(&mut self) {
        if !self.enabled || !self.available {
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
                Ok(Some(status)) => warn!(?status, "xwayland-satellite exited"),
                Err(error) => {
                    warn!(%error, "failed to inspect xwayland-satellite");
                    return;
                }
            }
            let mut child = self.child.take().expect("xwayland child exists");
            let _ = child.wait();
            self.started_at = None;
            self.failures = self.failures.saturating_add(1);
            self.restart_at = Instant::now()
                + Duration::from_secs(1_u64.checked_shl(self.failures.min(4)).unwrap_or(16));
        }
        if Instant::now() < self.restart_at {
            return;
        }

        let Some(xdisplay) = self.display.as_deref() else {
            self.available = false;
            return;
        };
        match Command::new("xwayland-satellite")
            .arg(xdisplay)
            .env("WAYLAND_DISPLAY", &self.wayland_socket)
            .spawn()
        {
            Ok(child) => {
                info!(pid = child.id(), xdisplay, "started xwayland-satellite");
                self.child = Some(child);
                self.started_at = Some(Instant::now());
            }
            Err(error) if error.kind() == io::ErrorKind::NotFound => {
                self.available = false;
                warn!("xwayland-satellite is enabled but not installed");
            }
            Err(error) => {
                self.failures = self.failures.saturating_add(1);
                self.restart_at = Instant::now() + Duration::from_secs(5);
                warn!(%error, "failed to start xwayland-satellite");
            }
        }
    }

    pub fn reconfigure(&mut self, enabled: bool) {
        if self.enabled == enabled {
            return;
        }
        self.stop();
        self.enabled = enabled;
        self.available = true;
        self.failures = 0;
        self.restart_at = Instant::now();
        self.display = enabled.then(find_display).flatten();
        self.tick();
    }

    pub fn display(&self) -> Option<&str> {
        self.enabled.then_some(self.display.as_deref()).flatten()
    }

    pub fn status(&self) -> XwaylandStatus {
        if !self.enabled {
            XwaylandStatus::Disabled
        } else if !self.available {
            XwaylandStatus::Unavailable
        } else if self.child.is_some() {
            XwaylandStatus::Running
        } else if self.failures > 0 {
            XwaylandStatus::Restarting
        } else {
            XwaylandStatus::Failed
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

impl Drop for XwaylandProcess {
    fn drop(&mut self) {
        self.stop();
    }
}

fn find_display() -> Option<String> {
    if let Ok(display) = env::var("LUFT_XWAYLAND_DISPLAY")
        && valid_display(&display)
    {
        return Some(display);
    }

    (12..=99)
        .find(|number| {
            !Path::new(&format!("/tmp/.X11-unix/X{number}")).exists()
                && !Path::new(&format!("/tmp/.X{number}-lock")).exists()
        })
        .map(|number| format!(":{number}"))
}

fn valid_display(display: &str) -> bool {
    display.strip_prefix(':').is_some_and(|number| {
        !number.is_empty() && number.bytes().all(|byte| byte.is_ascii_digit())
    })
}
