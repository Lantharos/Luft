mod environment;
mod system;

use std::ffi::OsString;
use std::path::{Path, PathBuf};

use super::devices::Decoys;
use super::display::x11;
use super::folder::{self, Folder, INSIDE_SERVER, SERVER_SOCKET};
use super::seccomp::FILTER_FD;
use crate::app::{App, Device, Grants};
use crate::portal::Layout;

pub const INFO_FD: i32 = 5;
const INSIDE_APP: &str = "/app";
pub const INSIDE_LAUNCHER: &str = "/run/luft-sandbox-server";
const XDG_OPEN: &str = "/usr/bin/xdg-open";
const PIPEWIRE_SOCKET: &str = "pipewire-0";
const HOME_READ_ONLY: [&str; 2] = [".local/share/fonts", ".local/share/icons"];
const X11_AUTHORITY: &str = "Xauthority";
const SOUND_CARDS: &str = "/dev/snd";

use system::SHARED_MEMORY;
pub use system::write_accounts;

/// Everything the app's sandbox is made of.
pub struct Profile<'a> {
    pub app: &'a App,
    pub grants: &'a Grants,
    pub folder: &'a Folder,
    pub info: &'a Path,
    pub mount: &'a Path,
    pub bus: &'a Path,
    pub wayland: Option<PathBuf>,
    pub x11: Option<&'a x11::Display>,
    pub decoys: &'a Decoys,
}

#[derive(Default)]
struct Arguments(Vec<OsString>);

/// Whether a sandbox shares the app's `/tmp` or gets an empty one.
enum Temporary {
    Shared,
    Own,
}

impl Arguments {
    fn flag(&mut self, flag: &str) -> &mut Self {
        self.0.push(flag.into());
        self
    }

    fn path(&mut self, path: impl AsRef<Path>) -> &mut Self {
        self.0.push(path.as_ref().into());
        self
    }

    fn bind(
        &mut self,
        kind: &str,
        source: impl AsRef<Path>,
        target: impl AsRef<Path>,
    ) -> &mut Self {
        self.0.push(kind.into());
        self.0.push(source.as_ref().into());
        self.0.push(target.as_ref().into());
        self
    }

    fn same(&mut self, kind: &str, path: impl AsRef<Path>) -> &mut Self {
        let path = path.as_ref();
        self.bind(kind, path, path)
    }

    fn set(&mut self, name: &str, value: impl Into<OsString>) -> &mut Self {
        self.0.push("--setenv".into());
        self.0.push(name.into());
        self.0.push(value.into());
        self
    }
}

pub(super) fn home() -> Result<PathBuf, String> {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .ok_or_else(|| "There's no home folder.".to_owned())
}

pub(super) fn data_folder(home: &Path, id: &str) -> Result<PathBuf, String> {
    let folder = home.join(".var/app").join(id);
    std::fs::create_dir_all(&folder).map_err(|error| error.to_string())?;
    Ok(folder)
}

fn nvidia_devices() -> Vec<PathBuf> {
    std::fs::read_dir("/dev")
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| entry.file_name().to_string_lossy().starts_with("nvidia"))
        .map(|entry| entry.path())
        .collect()
}

impl Profile<'_> {
    /// The app, and the `.flatpak-info` at both places tools look for it to
    /// know they're in a sandbox and go through portals: `xdg-open` reads the
    /// one in the runtime folder, GLib the one at the root.
    fn app_files(&self) -> Result<Arguments, String> {
        let mut arguments = Arguments::default();
        arguments
            .bind("--ro-bind", self.mount, INSIDE_APP)
            .bind("--ro-bind", self.info, "/.flatpak-info")
            .bind(
                "--ro-bind",
                self.info,
                folder::runtime_dir()?.join("flatpak-info"),
            );
        Ok(arguments)
    }

    fn gpu(&self) -> Arguments {
        let mut arguments = Arguments::default();
        arguments.same("--dev-bind-try", "/dev/dri");
        for device in nvidia_devices() {
            arguments.same("--dev-bind-try", device);
        }
        arguments
    }

    fn display(&self) -> Result<Arguments, String> {
        let mut arguments = Arguments::default();
        if let Some(wayland) = &self.wayland {
            arguments.bind("--bind", wayland, folder::runtime_dir()?.join("wayland-0"));
        }
        if let Some(x11) = self.x11 {
            arguments.bind("--ro-bind-try", &x11.socket, x11::SOCKET);
            if let Some(authority) = &x11.authority {
                arguments.bind(
                    "--ro-bind",
                    authority,
                    folder::runtime_dir()?.join(X11_AUTHORITY),
                );
            }
        }
        Ok(arguments)
    }

    /// The session's PipeWire socket, where the sound server knows the app
    /// by its sandbox, and the folder of the sandbox's own PulseAudio
    /// server, which the app's sandbox keeps and the others only reach.
    fn sound(&self, pulse: &str) -> Result<Arguments, String> {
        let runtime = folder::runtime_dir()?;
        let mut arguments = Arguments::default();
        arguments
            .same("--ro-bind-try", runtime.join(PIPEWIRE_SOCKET))
            .bind(
                pulse,
                self.folder.pulse(),
                runtime.join(crate::pulse::FOLDER),
            );
        Ok(arguments)
    }

    fn session_bus(&self) -> Result<Arguments, String> {
        let mut arguments = Arguments::default();
        arguments.bind("--bind", self.bus, folder::runtime_dir()?.join("bus"));
        Ok(arguments)
    }

    /// The devices the app was given. Every device still leaves out the
    /// computer's shared memory, and sound cards and cameras unless their
    /// own switches are on.
    fn devices(&self, arguments: &mut Arguments) {
        if self.grants.has(Device::All) {
            arguments
                .same("--dev-bind", "/dev")
                .flag("--tmpfs")
                .flag(SHARED_MEMORY);
            if !self.grants.microphone && Path::new(SOUND_CARDS).is_dir() {
                arguments.flag("--tmpfs").flag(SOUND_CARDS);
            }
        } else {
            arguments.0.extend(self.gpu().0);
            for device in &self.decoys.devices {
                arguments.same("--dev-bind-try", device);
            }
        }
        for (decoy, device) in &self.decoys.binds {
            arguments.bind("--bind", decoy, device);
        }
    }

    fn files(&self, arguments: &mut Arguments, home: &Path) -> Result<(), String> {
        arguments.bind(
            "--bind-try",
            folder::runtime_dir()?.join("doc/by-app").join(&self.app.id),
            folder::runtime_dir()?.join("doc"),
        );
        let data = data_folder(home, &self.app.id)?;
        if !self.shares_home(home) {
            arguments.bind("--bind", &data, home);
        }
        for folder in &self.grants.folders {
            arguments.same("--bind", folder);
        }
        for folder in &self.grants.read_only_folders {
            arguments.same("--ro-bind", folder);
        }
        arguments.same("--bind", &data);
        if !self.shares_home(home)
            && let Some(downloads) = dirs::download_dir().filter(|_| self.grants.downloads)
        {
            arguments.same("--bind-try", downloads);
        }
        for folder in HOME_READ_ONLY {
            arguments.same("--ro-bind-try", home.join(folder)).bind(
                "--ro-bind-try",
                home.join(folder),
                data.join(folder),
            );
        }
        Ok(())
    }

    /// Whether the app was given your home folder. Its own folder then only
    /// shows at `~/.var/app/APP-ID`, where every app finds it at the path it
    /// has outside the sandbox, and not in place of your home as well.
    fn shares_home(&self, home: &Path) -> bool {
        self.grants
            .folders
            .iter()
            .chain(&self.grants.read_only_folders)
            .any(|folder| folder == home)
    }

    /// The mounts of the app's own sandbox.
    fn mounts(&self, home: &Path, launcher: &Path) -> Result<Arguments, String> {
        let mut arguments = self.floor(home, launcher, Temporary::Shared)?;
        arguments.bind("--ro-bind", launcher, XDG_OPEN);
        self.devices(&mut arguments);
        arguments.0.extend(self.display()?.0);
        arguments.0.extend(self.sound("--bind")?.0);
        arguments.0.extend(self.session_bus()?.0);
        self.files(&mut arguments, home)?;
        arguments.0.extend(self.app_files()?.0);
        Ok(arguments)
    }

    /// What the portal builds the app's nested sandboxes from.
    pub fn layout(&self) -> Result<Layout, String> {
        let home = home()?;
        let launcher = std::env::current_exe().map_err(|error| error.to_string())?;
        Ok(Layout {
            app: self.mounts(&home, &launcher)?.0,
            app_files: self.app_files()?.0,
            floor: self.floor(&home, &launcher, Temporary::Own)?.0,
            gpu: self.gpu().0,
            display: self.display()?.0,
            sound: self.sound("--ro-bind")?.0,
            bus: self.session_bus()?.0,
            environment: self.environment(&home)?.0,
            offline: !self.grants.network,
            own_ipc: !self.grants.x11,
        })
    }

    pub fn arguments(&self) -> Result<Vec<OsString>, String> {
        let home = home()?;
        let launcher = std::env::current_exe().map_err(|error| error.to_string())?;
        let mut arguments = Arguments::default();
        arguments
            .flag("--unshare-user")
            .flag("--disable-userns")
            .flag("--unshare-pid")
            .flag("--unshare-uts")
            .flag("--unshare-cgroup-try")
            .flag("--die-with-parent")
            .flag("--new-session");
        if !self.grants.network {
            arguments.flag("--unshare-net");
        }
        if !self.grants.x11 {
            arguments.flag("--unshare-ipc");
        }
        arguments.0.extend(self.mounts(&home, &launcher)?.0);
        arguments
            .bind("--bind", self.folder.server(), INSIDE_SERVER)
            .flag("--seccomp")
            .flag(&FILTER_FD.to_string())
            .flag("--info-fd")
            .flag(&INFO_FD.to_string())
            .flag("--chdir")
            .path(&home);
        arguments.0.extend(self.environment(&home)?.0);
        arguments
            .flag("--")
            .flag(INSIDE_LAUNCHER)
            .flag(crate::SERVE)
            .flag(&format!("{INSIDE_SERVER}/{SERVER_SOCKET}"));
        arguments.0.extend(self.command());
        Ok(arguments.0)
    }
}
