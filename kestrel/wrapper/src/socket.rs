use std::fs::{self, File, TryLockError};
use std::io;
use std::os::fd::{AsRawFd, RawFd};
use std::os::unix::net::UnixListener;
use std::path::{Path, PathBuf};

use rustix::io::{FdFlags, fcntl_setfd};

const DISPLAYS: u32 = 32;

pub struct WaylandSocket {
    pub name: String,
    path: PathBuf,
    lock_path: PathBuf,
    listener: UnixListener,
    _lock: File,
}

impl WaylandSocket {
    pub fn create() -> io::Result<Self> {
        let runtime = std::env::var_os("XDG_RUNTIME_DIR")
            .map(PathBuf::from)
            .ok_or_else(|| io::Error::other("XDG_RUNTIME_DIR isn't set"))?;
        for display in 0..DISPLAYS {
            let name = format!("wayland-{display}");
            let path = runtime.join(&name);
            let lock_path = runtime.join(format!("{name}.lock"));
            let lock = File::options()
                .read(true)
                .write(true)
                .create(true)
                .truncate(false)
                .open(&lock_path)?;
            match lock.try_lock() {
                Ok(()) => {}
                Err(TryLockError::WouldBlock) => continue,
                Err(TryLockError::Error(error)) => return Err(error),
            }
            let listener = listen(&path).inspect_err(|_| {
                let _ = fs::remove_file(&lock_path);
            })?;
            return Ok(Self {
                name,
                path,
                lock_path,
                listener,
                _lock: lock,
            });
        }
        Err(io::Error::other("Every Wayland display name is taken"))
    }

    pub fn fd(&self) -> RawFd {
        self.listener.as_raw_fd()
    }
}

fn listen(path: &Path) -> io::Result<UnixListener> {
    match fs::remove_file(path) {
        Err(error) if error.kind() != io::ErrorKind::NotFound => return Err(error),
        _ => {}
    }
    let listener = UnixListener::bind(path)?;
    fcntl_setfd(&listener, FdFlags::empty())?;
    Ok(listener)
}

impl Drop for WaylandSocket {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
        let _ = fs::remove_file(&self.lock_path);
    }
}
