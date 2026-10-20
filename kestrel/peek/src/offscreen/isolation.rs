use std::fs::{self, DirBuilder};
use std::io;
use std::os::unix::fs::{DirBuilderExt, symlink};
use std::path::{Path, PathBuf};
use std::process::Command;

use super::paths::{cache_home, display, runtime, wayland_socket};

const SHARED_SERVICES: [&str; 11] = [
    "bus",
    "dbus-1",
    "systemd",
    "pipewire-0",
    "pipewire-0-manager",
    "pulse",
    "at-spi",
    "dconf",
    "doc",
    "gvfsd",
    "gnupg",
];
const SHARED_CACHES: [&str; 4] = [
    "fontconfig",
    "mesa_shader_cache",
    "mesa_shader_cache_db",
    "nvidia",
];

pub struct Isolation {
    runtime: PathBuf,
    cache: PathBuf,
}

fn private_directory(path: &Path) -> io::Result<()> {
    DirBuilder::new().mode(0o700).recursive(true).create(path)
}

fn remove_abandoned(caches: &Path) {
    let Ok(entries) = fs::read_dir(caches) else {
        return;
    };
    for entry in entries.flatten() {
        let handle = entry.file_name();
        if display(&handle.to_string_lossy()).is_ok_and(|display| !display.exists()) {
            let _ = fs::remove_dir_all(entry.path());
        }
    }
}

fn link_all<'a>(
    from: &Path,
    to: &Path,
    names: impl IntoIterator<Item = &'a str>,
) -> io::Result<()> {
    names
        .into_iter()
        .try_for_each(|name| symlink(from.join(name), to.join(name)))
}

impl Isolation {
    pub fn prepare(handle: &str, directory: &Path) -> io::Result<Self> {
        let runtime_dir = directory.join("runtime");
        private_directory(&runtime_dir)?;
        let socket = wayland_socket(handle);
        link_all(
            &runtime()?,
            &runtime_dir,
            SHARED_SERVICES.into_iter().chain([socket.as_str()]),
        )?;
        let shared_cache = cache_home()?;
        let caches = shared_cache.join("peek");
        remove_abandoned(&caches);
        let cache = caches.join(handle);
        private_directory(&cache)?;
        link_all(&shared_cache, &cache, SHARED_CACHES)?;
        Ok(Self {
            runtime: runtime_dir,
            cache,
        })
    }

    pub fn apply(&self, program: &mut Command) {
        program
            .env("XDG_RUNTIME_DIR", &self.runtime)
            .env("XDG_CACHE_HOME", &self.cache);
    }

    pub fn remove(&self) {
        let _ = fs::remove_dir_all(&self.cache);
    }
}
