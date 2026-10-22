use std::ffi::OsString;
use std::path::{Path, PathBuf};

use super::devices::Decoys;
use super::folder::{self, Folder, INSIDE_SERVER, SERVER_SOCKET};
use super::seccomp::FILTER_FD;
use super::unsandboxed::NO_SANDBOX;
use crate::app::{App, Device, Grants};

pub const INFO_FD: i32 = 5;
const INSIDE_APP: &str = "/app";
const INSIDE_LAUNCHER: &str = "/run/luft-sandbox-server";
const APP_RUN: &str = "/app/AppRun";
const SYSTEMD_RUN: &str = "/usr/bin/systemd-run";
const SYSTEM_FOLDERS: [&str; 5] = [
    "/sys/block",
    "/sys/bus",
    "/sys/class",
    "/sys/dev",
    "/sys/devices",
];
const RUNTIME_SOCKETS: [&str; 2] = ["pipewire-0", "pulse/native"];
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
    pub proxy: &'a Path,
    pub wayland: Option<PathBuf>,
    pub decoys: &'a Decoys,
}

struct Arguments(Vec<OsString>);

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

impl Profile<'_> {
    fn system(&self, arguments: &mut Arguments, launcher: &Path) {
        arguments
            .same("--ro-bind", "/usr")
            .bind("--symlink", "usr/lib", "/lib")
            .bind("--symlink", "usr/lib64", "/lib64")
            .bind("--symlink", "usr/bin", "/bin")
            .bind("--symlink", "usr/sbin", "/sbin")
            .same("--ro-bind", "/etc")
            .flag("--proc")
            .flag("/proc");
        arguments.bind("--ro-bind-try", launcher, SYSTEMD_RUN);
        for folder in SYSTEM_FOLDERS {
            arguments.same("--ro-bind-try", folder);
        }
        arguments
            .flag("--tmpfs")
            .flag("/run")
            .same("--ro-bind-try", "/run/systemd/resolve")
            .same("--ro-bind-try", "/run/udev")
            .flag("--tmpfs")
            .flag("/var")
            .flag("--dir")
            .flag("/var/tmp")
            .bind("--bind", self.folder.temporary(), "/tmp");
    }

    fn devices(&self, arguments: &mut Arguments) {
        if self.grants.has(Device::All) {
            arguments.same("--dev-bind", "/dev");
            return;
        }
        arguments
            .flag("--dev")
            .flag("/dev")
            .flag("--tmpfs")
            .flag("/dev/shm")
            .same("--dev-bind-try", "/dev/dri");
        for device in nvidia_devices().iter().chain(&self.decoys.devices) {
            arguments.same("--dev-bind-try", device);
        }
        for (decoy, device) in &self.decoys.binds {
            arguments.bind("--bind", decoy, device);
        }
    }

    fn session(&self, arguments: &mut Arguments, home: &Path) -> Result<(), String> {
        let runtime = folder::runtime_dir()?;
        arguments
            .flag("--perms")
            .flag("0700")
            .flag("--dir")
            .path(&runtime)
            .bind("--bind", self.proxy, runtime.join("bus"));
        if let Some(wayland) = &self.wayland {
            arguments.bind("--bind", wayland, runtime.join("wayland-0"));
        }
        for socket in RUNTIME_SOCKETS {
            arguments.same("--ro-bind-try", runtime.join(socket));
        }
        arguments.bind(
            "--bind-try",
            runtime.join("doc/by-app").join(&self.app.id),
            runtime.join("doc"),
        );
        if let Some(socket) = x11_socket() {
            arguments.same("--ro-bind-try", socket);
        }
        if let Some(authority) = std::env::var_os("XAUTHORITY") {
            arguments.same("--ro-bind-try", PathBuf::from(authority));
        }
        arguments.bind("--bind", data_folder(home, &self.app.id)?, home);
        for folder in HOME_READ_ONLY {
            arguments.same("--ro-bind-try", home.join(folder));
        }
        for folder in &self.grants.folders {
            arguments.same("--bind", folder);
        }
        Ok(())
    }

    fn environment(&self, arguments: &mut Arguments, home: &Path) -> Result<(), String> {
        let runtime = folder::runtime_dir()?;
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
            .set("DESKTOPINTEGRATION", "1")
            .set("SECRET_BACKEND", "service");
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
        Ok(())
    }

    fn command(&self) -> Vec<&'static str> {
        let mut command = vec![APP_RUN];
        if self.app.chromium {
            command.extend([NO_SANDBOX, CHROMIUM_PORTALS]);
        }
        command
    }

    pub fn arguments(&self) -> Result<Vec<OsString>, String> {
        let home = home()?;
        let launcher = std::env::current_exe().map_err(|error| error.to_string())?;
        let mut arguments = Arguments(Vec::new());
        arguments
            .flag("--unshare-user")
            .flag("--disable-userns")
            .flag("--unshare-pid")
            .flag("--unshare-cgroup-try")
            .flag("--die-with-parent")
            .flag("--new-session");
        self.system(&mut arguments, &launcher);
        self.devices(&mut arguments);
        self.session(&mut arguments, &home)?;
        arguments
            .bind("--ro-bind", self.mount, INSIDE_APP)
            .bind("--ro-bind", self.info, "/.flatpak-info")
            .bind("--bind", self.folder.server(), INSIDE_SERVER)
            .bind("--ro-bind", launcher, INSIDE_LAUNCHER)
            .flag("--seccomp")
            .flag(&FILTER_FD.to_string())
            .flag("--info-fd")
            .flag(&INFO_FD.to_string())
            .flag("--chdir")
            .path(&home);
        self.environment(&mut arguments, &home)?;
        arguments
            .flag("--")
            .flag(INSIDE_LAUNCHER)
            .flag(crate::SERVE)
            .flag(&format!("{INSIDE_SERVER}/{SERVER_SOCKET}"));
        for part in self.command() {
            arguments.flag(part);
        }
        Ok(arguments.0)
    }
}
