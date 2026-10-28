use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};

use super::folder::Folder;
use super::{BWRAP, fds};

const DBUS_PROXY: &str = "xdg-dbus-proxy";
const READY_FD: i32 = 3;
const SOCKET: &str = "bus";

/// Names every sandboxed app may call besides its own.
pub const TALK: [&str; 4] = [
    "org.freedesktop.portal.*",
    "org.freedesktop.Notifications",
    "org.freedesktop.secrets",
    "org.kde.StatusNotifierWatcher",
];

/// The app's filtered view of the session bus. The proxy runs in a sandbox
/// of its own that carries the app's sandbox info, so services that look at
/// the process behind the connection see the app, as with Flatpak.
pub struct Proxy {
    socket: PathBuf,
    child: Child,
    _ready: File,
}

fn session_bus() -> Result<PathBuf, String> {
    std::env::var("DBUS_SESSION_BUS_ADDRESS")
        .ok()
        .and_then(|address| {
            address
                .split(';')
                .find_map(|part| part.strip_prefix("unix:path="))
                .map(|path| PathBuf::from(path.split(',').next().unwrap_or(path)))
        })
        .ok_or_else(|| "The session bus isn't at a path this sandbox can reach.".to_owned())
}

fn rules(id: &str, talk: &[String]) -> Vec<String> {
    let mut rules = vec![
        "--filter".to_owned(),
        format!("--own={id}"),
        format!("--own={id}.*"),
    ];
    rules.extend(TALK.iter().map(|name| format!("--talk={name}")));
    rules.extend(talk.iter().map(|name| format!("--talk={name}")));
    rules
}

impl Proxy {
    pub fn start(folder: &Folder, info: &Path, id: &str, talk: &[String]) -> Result<Self, String> {
        let bus = session_bus()?;
        let socket = folder.proxy().join(SOCKET);
        let (ready, proxy_end) = fds::pipe()?;
        let mut command = Command::new(BWRAP);
        command
            .args(["--unshare-all", "--die-with-parent", "--clearenv"])
            .args(["--ro-bind", "/usr", "/usr"])
            .args([
                "--symlink",
                "usr/lib",
                "/lib",
                "--symlink",
                "usr/lib64",
                "/lib64",
            ])
            .args(["--symlink", "usr/bin", "/bin"])
            .arg("--ro-bind")
            .args([&bus, &bus])
            .arg("--bind")
            .args([folder.proxy(), folder.proxy()])
            .arg("--ro-bind")
            .arg(info)
            .arg("/.flatpak-info")
            .args(["--", DBUS_PROXY, &format!("--fd={READY_FD}")])
            .arg(format!("unix:path={}", bus.display()))
            .arg(&socket)
            .args(rules(id, talk))
            .stdin(Stdio::null());
        fds::pass(&mut command, &proxy_end, READY_FD);
        let child = command
            .spawn()
            .map_err(|error| format!("{BWRAP}: {error}"))?;
        drop(proxy_end);
        let mut ready = File::from(ready);
        let mut byte = [0];
        if ready.read(&mut byte).map_err(|error| error.to_string())? != 1 {
            return Err("The app's view of the session bus couldn't be set up.".into());
        }
        Ok(Self {
            socket,
            child,
            _ready: ready,
        })
    }

    pub fn socket(&self) -> &Path {
        &self.socket
    }
}

impl Drop for Proxy {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}
