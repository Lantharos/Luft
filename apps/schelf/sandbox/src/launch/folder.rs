use std::fs::{self, File, OpenOptions};
use std::os::fd::AsRawFd;
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::os::unix::net::UnixStream;
use std::path::{Path, PathBuf};
use std::process::Child;
use std::thread::sleep;
use std::time::{Duration, Instant};

const SERVER_WAIT: Duration = Duration::from_secs(10);
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

    pub fn mount_point(&self) -> PathBuf {
        self.path.join("app")
    }

    pub fn proxy(&self) -> PathBuf {
        self.path.join("bus")
    }

    pub fn wayland_socket(&self) -> PathBuf {
        self.path.join("wayland")
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

    pub fn write_sandbox_info(&self, id: &str) -> Result<PathBuf, String> {
        let path = self.path.join("flatpak-info");
        let instance = std::process::id();
        fs::write(
            &path,
            format!(
                "[Application]\nname={id}\n\n[Instance]\ninstance-id={instance}\nsession-bus-proxy=true\n"
            ),
        )
        .map_err(|error| error.to_string())?;
        Ok(path)
    }

    /// Removes what the last sandbox left, keeping the lock and the app's
    /// shared temporary files.
    pub fn clean(&self) {
        super::mount::unmount_leftover(&self.mount_point());
        for name in ["bus", "server", "devices", "wayland", "flatpak-info"] {
            let path = self.path.join(name);
            let _ = fs::remove_dir_all(&path).or_else(|_| fs::remove_file(&path));
        }
    }
}
