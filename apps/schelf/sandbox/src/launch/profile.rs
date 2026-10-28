use std::ffi::OsString;
use std::path::{Path, PathBuf};

use super::devices::Decoys;
use super::folder::{self, Folder, INSIDE_SERVER, SERVER_SOCKET};
use super::seccomp::FILTER_FD;
use super::unsandboxed::NO_SANDBOX;
use crate::app::{App, Device, Grants};
use crate::portal::Layout;

pub const INFO_FD: i32 = 5;
const INSIDE_APP: &str = "/app";
const INSIDE_LAUNCHER: &str = "/run/luft-sandbox-server";
const OUTER_USER_NAMESPACE: &str = "/run/.userns";
const APP_RUN: &str = "/app/AppRun";
const SYSTEMD_RUN: &str = "/usr/bin/systemd-run";
const ZYPAK: &str = "/usr/lib/zypak";
const ZYPAK_HELPER: &str = "zypak-helper";
const SYSTEM_FOLDERS: [&str; 5] = [
    "/sys/block",
    "/sys/bus",
    "/sys/class",
    "/sys/dev",
    "/sys/devices",
];
const SOUND_SOCKETS: [&str; 2] = ["pipewire-0", "pulse/native"];
const HOME_READ_ONLY: [&str; 2] = [".local/share/fonts", ".local/share/icons"];
const PASSED_ON: [&str; 13] = [
    "LANG",
    "LANGUAGE",
    "TZ",
    "XDG_CURRENT_DESKTOP",
    "XDG_SESSION_DESKTOP",
    "XDG_SESSION_TYPE",
    "DESKTOP_SESSION",
    "XCURSOR_THEME",
    "XCURSOR_SIZE",
    "GTK_IM_MODULE",
    "QT_IM_MODULE",
    "XMODIFIERS",
    "USER",
];
const PORTAL_FILE_CHOOSER: [(&str, &str); 3] = [
    ("GTK_USE_PORTAL", "1"),
    ("QT_QPA_PLATFORMTHEME", "xdgdesktopportal"),
    ("ELECTRON_OZONE_PLATFORM_HINT", "auto"),
];
const CHROMIUM_PORTALS: &str = "--xdg-portal-required-version=1";

/// Everything the app's sandbox is made of.
pub struct Profile<'a> {
    pub app: &'a App,
    pub grants: &'a Grants,
    pub folder: &'a Folder,
    pub info: &'a Path,
    pub mount: &'a Path,
    pub bus: &'a Path,
    pub wayland: Option<PathBuf>,
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

fn home() -> Result<PathBuf, String> {
    std::env::var_os("HOME")
        .map(PathBuf::from)
        .ok_or_else(|| "There's no home folder.".to_owned())
}

fn data_folder(home: &Path, id: &str) -> Result<PathBuf, String> {
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

fn x11_socket() -> Option<PathBuf> {
    let display = std::env::var("DISPLAY").ok()?;
    let number = display.strip_prefix(':')?.split('.').next()?;
    Some(PathBuf::from(format!("/tmp/.X11-unix/X{number}")))
}

fn zypak() -> Option<&'static Path> {
    let zypak = Path::new(ZYPAK);
    zypak.join(ZYPAK_HELPER).exists().then_some(zypak)
}

impl Profile<'_> {
    /// What every sandbox of the app stands on, its own and those the portal
    /// starts: the system read-only, fresh `/proc` and `/dev`, `/tmp`, and
    /// empty runtime and home folders.
    fn floor(
        &self,
        home: &Path,
        launcher: &Path,
        temporary: Temporary,
    ) -> Result<Arguments, String> {
        let mut arguments = Arguments::default();
        match temporary {
            Temporary::Shared => arguments.bind("--bind", self.folder.temporary(), "/tmp"),
            Temporary::Own => arguments.flag("--tmpfs").flag("/tmp"),
        };
        arguments
            .same("--ro-bind", "/usr")
            .bind("--symlink", "usr/lib", "/lib")
            .bind("--symlink", "usr/lib64", "/lib64")
            .bind("--symlink", "usr/bin", "/bin")
            .bind("--symlink", "usr/sbin", "/sbin")
            .same("--ro-bind", "/etc")
            .flag("--proc")
            .flag("/proc")
            .bind("--ro-bind-try", launcher, SYSTEMD_RUN);
        for folder in SYSTEM_FOLDERS {
            arguments.same("--ro-bind-try", folder);
        }
        arguments
            .flag("--tmpfs")
            .flag("/run")
            .same("--ro-bind-try", "/run/systemd/resolve")
            .same("--ro-bind-try", "/run/udev")
            .bind("--ro-bind-try", "/proc/self/ns/user", OUTER_USER_NAMESPACE)
            .flag("--tmpfs")
            .flag("/var")
            .flag("--dir")
            .flag("/var/tmp")
            .flag("--dev")
            .flag("/dev")
            .flag("--tmpfs")
            .flag("/dev/shm")
            .flag("--perms")
            .flag("0700")
            .flag("--dir")
            .path(folder::runtime_dir()?)
            .flag("--dir")
            .path(home);
        Ok(arguments)
    }

    fn app_files(&self) -> Arguments {
        let mut arguments = Arguments::default();
        arguments.bind("--ro-bind", self.mount, INSIDE_APP).bind(
            "--ro-bind",
            self.info,
            "/.flatpak-info",
        );
        arguments
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
        if let Some(socket) = x11_socket() {
            arguments.same("--ro-bind-try", socket);
        }
        if let Some(authority) = std::env::var_os("XAUTHORITY") {
            arguments.same("--ro-bind-try", PathBuf::from(authority));
        }
        Ok(arguments)
    }

    fn sound(&self) -> Result<Arguments, String> {
        let runtime = folder::runtime_dir()?;
        let mut arguments = Arguments::default();
        for socket in SOUND_SOCKETS {
            arguments.same("--ro-bind-try", runtime.join(socket));
        }
        Ok(arguments)
    }

    fn session_bus(&self) -> Result<Arguments, String> {
        let mut arguments = Arguments::default();
        arguments.bind("--bind", self.bus, folder::runtime_dir()?.join("bus"));
        Ok(arguments)
    }

    fn devices(&self, arguments: &mut Arguments) {
        if self.grants.has(Device::All) {
            arguments.same("--dev-bind", "/dev");
            return;
        }
        arguments.0.extend(self.gpu().0);
        for device in &self.decoys.devices {
            arguments.same("--dev-bind-try", device);
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
        if self.shares_home(home) {
            arguments.same("--bind", &data);
        }
        for folder in HOME_READ_ONLY {
            arguments.same("--ro-bind-try", home.join(folder));
        }
        Ok(())
    }

    /// Whether the app was given your home folder, where it then finds its
    /// own folder at `~/.var/app/APP-ID` instead of in place of your home.
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
        self.devices(&mut arguments);
        arguments.0.extend(self.display()?.0);
        arguments.0.extend(self.sound()?.0);
        arguments.0.extend(self.session_bus()?.0);
        self.files(&mut arguments, home)?;
        arguments.0.extend(self.app_files().0);
        Ok(arguments)
    }

    fn environment(&self, home: &Path) -> Result<Arguments, String> {
        let runtime = folder::runtime_dir()?;
        let mut arguments = Arguments::default();
        arguments
            .flag("--clearenv")
            .set("HOME", home)
            .set("PATH", "/usr/bin:/bin")
            .set("XDG_RUNTIME_DIR", &runtime)
            .set(
                "DBUS_SESSION_BUS_ADDRESS",
                format!("unix:path={}", runtime.join("bus").display()),
            )
            .set("APPDIR", INSIDE_APP)
            .set("APPIMAGE", &self.app.image)
            .set("OWD", home)
            .set("DESKTOPINTEGRATION", "1");
        if self.shares_home(home) {
            let data = data_folder(home, &self.app.id)?;
            arguments
                .set("XDG_CONFIG_HOME", data.join(".config"))
                .set("XDG_DATA_HOME", data.join(".local/share"))
                .set("XDG_CACHE_HOME", data.join(".cache"))
                .set("XDG_STATE_HOME", data.join(".local/state"));
        }
        if let Some(zypak) = zypak() {
            arguments.set("ZYPAK_BIN", zypak).set("ZYPAK_LIB", zypak);
        }
        if self.wayland.is_some() {
            arguments.set("WAYLAND_DISPLAY", "wayland-0");
        }
        for name in ["DISPLAY", "XAUTHORITY"].into_iter().chain(PASSED_ON) {
            if let Some(value) = std::env::var_os(name) {
                arguments.set(name, value);
            }
        }
        for (name, value) in std::env::vars_os() {
            if name.to_string_lossy().starts_with("LC_") {
                arguments.set(&name.to_string_lossy(), value);
            }
        }
        for (name, value) in PORTAL_FILE_CHOOSER {
            arguments.set(name, value);
        }
        Ok(arguments)
    }

    /// Chromium and Electron start their helpers through Zypak, which asks
    /// the sandbox's portal for a sandbox of their own.
    fn command(&self) -> Vec<OsString> {
        if !self.app.chromium {
            return vec![APP_RUN.into()];
        }
        match zypak() {
            Some(zypak) => vec![
                zypak.join(ZYPAK_HELPER).into(),
                "host".into(),
                "-".into(),
                APP_RUN.into(),
                CHROMIUM_PORTALS.into(),
            ],
            None => vec![APP_RUN.into(), NO_SANDBOX.into(), CHROMIUM_PORTALS.into()],
        }
    }

    /// What the portal builds the app's nested sandboxes from.
    pub fn layout(&self) -> Result<Layout, String> {
        let home = home()?;
        let launcher = std::env::current_exe().map_err(|error| error.to_string())?;
        Ok(Layout {
            app: self.mounts(&home, &launcher)?.0,
            app_files: self.app_files().0,
            floor: self.floor(&home, &launcher, Temporary::Own)?.0,
            gpu: self.gpu().0,
            display: self.display()?.0,
            sound: self.sound()?.0,
            bus: self.session_bus()?.0,
            environment: self.environment(&home)?.0,
            offline: !self.grants.network,
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
            .flag("--unshare-cgroup-try")
            .flag("--die-with-parent")
            .flag("--new-session");
        if !self.grants.network {
            arguments.flag("--unshare-net");
        }
        arguments.0.extend(self.mounts(&home, &launcher)?.0);
        arguments
            .bind("--bind", self.folder.server(), INSIDE_SERVER)
            .bind("--ro-bind", &launcher, INSIDE_LAUNCHER)
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
