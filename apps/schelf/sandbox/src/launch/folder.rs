use std::fs::{self, File, OpenOptions};
use std::os::fd::AsRawFd;
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::os::unix::net::UnixStream;
use std::path::{Path, PathBuf};
use std::process::Child;
use std::thread::sleep;
use std::time::{Duration, Instant};

const SERVER_WAIT: Duration = Duration::from_secs(10);
const QUIT_WAIT: Duration = Duration::from_secs(20);
const UNSANDBOXED_APP: &str = "app";
const SERVER_POLL: Duration = Duration::from_millis(50);
pub const INSIDE_SERVER: &str = "/run/luft-sandbox";
pub const SERVER_SOCKET: &str = "launch";

/// The app's folder in the runtime directory, shared by every launch while
/// its sandbox runs.
pub struct Folder {
    path: PathBuf,
}

pub enum Lock {
    Ours(File),
    Running,
}

pub fn runtime_dir() -> Result<PathBuf, String> {
    std::env::var_os("XDG_RUNTIME_DIR")
        .map(PathBuf::from)
        .ok_or_else(|| "There's no runtime folder for this session.".to_owned())
}

fn private_folder(path: &Path) -> Result<(), String> {
    fs::DirBuilder::new()
        .recursive(true)
        .mode(0o700)
        .create(path)
        .map_err(|error| format!("{}: {error}", path.display()))
}

impl Folder {
    pub fn of(id: &str) -> Result<Self, String> {
        let path = runtime_dir()?.join("luft-sandbox").join(id);
        private_folder(&path)?;
        Ok(Self { path })
    }

    pub fn lock(&self) -> Result<Lock, String> {
        let file = OpenOptions::new()
            .create(true)
            .truncate(false)
            .write(true)
            .mode(0o600)
            .open(self.path.join("lock"))
            .map_err(|error| error.to_string())?;
        let locked = unsafe { libc::flock(file.as_raw_fd(), libc::LOCK_EX | libc::LOCK_NB) };
        Ok(if locked == 0 {
            Lock::Ours(file)
        } else {
            Lock::Running
        })
    }

    pub fn server(&self) -> PathBuf {
        self.path.join("server")
    }

    pub fn connect(&self) -> Result<UnixStream, String> {
        UnixStream::connect(self.server().join(SERVER_SOCKET)).map_err(|error| error.to_string())
    }

    /// Waits until the sandbox is set up and its server listens, or the
    /// sandbox ends first.
    pub fn wait_for_server_or(&self, sandbox: &mut Child) {
        let socket = self.server().join(SERVER_SOCKET);
        let started = Instant::now();
        while !socket.exists()
            && started.elapsed() < SERVER_WAIT
            && sandbox.try_wait().is_ok_and(|status| status.is_none())
        {
            sleep(SERVER_POLL);
        }
    }

    pub fn wait_for_server(&self) -> Result<(), String> {
        let socket = self.server().join(SERVER_SOCKET);
        let started = Instant::now();
        while !socket.exists() {
            if started.elapsed() > SERVER_WAIT {
                return Err("The app is still starting.".into());
            }
            sleep(SERVER_POLL);
        }
        Ok(())
    }

    /// Remembers the app a launch started without a sandbox, so later
    /// launches and Schelf can tell it's running and ask it to quit.
    pub fn record_unsandboxed(&self, pid: u32) -> Result<(), String> {
        fs::write(self.path.join(UNSANDBOXED_APP), pid.to_string())
            .map_err(|error| error.to_string())
    }

    pub fn forget_unsandboxed(&self) {
        let _ = fs::remove_file(self.path.join(UNSANDBOXED_APP));
    }

    pub fn unsandboxed(&self) -> Option<libc::pid_t> {
        fs::read_to_string(self.path.join(UNSANDBOXED_APP))
            .ok()?
            .trim()
            .parse()
            .ok()
    }

    pub fn wait_until_closed(&self) -> Result<(), String> {
        let started = Instant::now();
        while matches!(self.lock()?, Lock::Running) {
            if started.elapsed() > QUIT_WAIT {
                return Err("The app didn't quit.".into());
            }
            sleep(SERVER_POLL);
        }
        Ok(())
    }

    pub fn mount_point(&self) -> PathBuf {
        self.path.join("app")
    }

    pub fn proxy(&self) -> PathBuf {
        self.path.join("bus")
    }

    /// Where the app's relay to its bus proxy listens.
    pub fn relay(&self) -> PathBuf {
        self.proxy().join("app")
    }

    pub fn wayland_socket(&self) -> PathBuf {
        self.path.join("wayland")
    }

    pub fn x11_authority(&self) -> PathBuf {
        self.path.join("Xauthority")
    }

    pub fn decoys(&self) -> PathBuf {
        self.path.join("devices")
    }

    pub fn temporary(&self) -> PathBuf {
        self.path.join("tmp")
    }

    pub fn prepare(&self) -> Result<(), String> {
        self.clean();
        for folder in [
            self.mount_point(),
            self.proxy(),
            self.server(),
            self.decoys(),
            self.temporary(),
        ] {
            private_folder(&folder)?;
        }
        Ok(())
    }

    /// Where the desktop portal looks for the sandbox's process, as it does
    /// for a running Flatpak.
    pub fn instance(&self) -> Result<PathBuf, String> {
        Ok(runtime_dir()?
            .join(".flatpak")
            .join(std::process::id().to_string()))
    }

    /// Writes the sandbox's `.flatpak-info`, which names the app and, as
    /// Flatpak's does, the session bus names its proxy lets it reach.
    pub fn write_sandbox_info<'a>(
        &self,
        id: &str,
        talk: impl IntoIterator<Item = &'a str>,
    ) -> Result<PathBuf, String> {
        let path = self.path.join("flatpak-info");
        let instance = std::process::id();
        let mut info = format!(
            "[Application]\nname={id}\n\n[Instance]\ninstance-id={instance}\nsession-bus-proxy=true\n\n[Session Bus Policy]\n{id}=own\n{id}.*=own\n"
        );
        for name in talk {
            info.push_str(&format!("{name}=talk\n"));
        }
        fs::write(&path, info).map_err(|error| error.to_string())?;
        Ok(path)
    }

    /// Removes what the last sandbox left, keeping the lock and the app's
    /// shared temporary files.
    pub fn clean(&self) {
        super::mount::unmount_leftover(&self.mount_point());
        for name in [
            "bus",
            "server",
            "devices",
            "wayland",
            "Xauthority",
            "flatpak-info",
            UNSANDBOXED_APP,
        ] {
            let path = self.path.join(name);
            let _ = fs::remove_dir_all(&path).or_else(|_| fs::remove_file(&path));
        }
    }
}
