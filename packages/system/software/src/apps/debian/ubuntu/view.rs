use std::ffi::{OsStr, OsString};
use std::fs;
use std::path::{Path, PathBuf};

use super::{HOST, SEARCH_PATH};

/// The parts of Ubuntu that stand in for this computer's system.
const SYSTEM: [&str; 4] = ["etc", "opt", "usr", "var"];
const SHARED: [&str; 3] = ["/run/dbus", "/run/media", "/run/systemd/journal"];
const DEVICES: &str = "/run/udev";
const HOST_FONTS: &str = "/usr/share/fonts";
pub const FONTS: &str = "/usr/local/share/fonts";

#[derive(Default)]
struct Arguments(Vec<OsString>);

impl Arguments {
    fn add(&mut self, option: &str, from: impl AsRef<OsStr>, to: impl AsRef<OsStr>) {
        self.0.extend([
            option.into(),
            from.as_ref().to_owned(),
            to.as_ref().to_owned(),
        ]);
    }

    fn share(&mut self, path: impl AsRef<OsStr>) {
        self.add("--bind", &path, &path);
    }
}

fn runtime_folders() -> Vec<PathBuf> {
    let yours = PathBuf::from(format!("/run/user/{}", rustix::process::getuid().as_raw()));
    let elsewhere = dirs::runtime_dir().filter(|runtime| !runtime.starts_with(&yours));
    std::iter::once(yours).chain(elsewhere).collect()
}

/// Your search path, with Ubuntu's own folders, such as the one games go in, after it.
pub(super) fn search_path() -> OsString {
    let yours: Vec<PathBuf> = std::env::var_os("PATH")
        .map(|path| std::env::split_paths(&path).collect())
        .unwrap_or_default();
    let ubuntu = std::env::split_paths(SEARCH_PATH).filter(|folder| !yours.contains(folder));
    std::env::join_paths(yours.iter().cloned().chain(ubuntu)).unwrap_or_else(|_| SEARCH_PATH.into())
}

/// What an app started in Ubuntu sees: Ubuntu's system, read-only, and everything else as your other apps
/// see it, with this computer's own files under `/run/host`.
pub fn arguments(tree: &Path, home: &Path) -> Vec<OsString> {
    let mut arguments = Arguments::default();
    for entry in fs::read_dir(tree).into_iter().flatten().flatten() {
        let inside = Path::new("/").join(entry.file_name());
        if let Ok(target) = fs::read_link(entry.path()) {
            arguments.add("--symlink", target, inside);
        } else if SYSTEM.iter().any(|system| entry.file_name() == *system) {
            arguments.add("--ro-bind", entry.path(), inside);
        }
    }
    match fs::read_link("/home") {
        Ok(target) => arguments.add("--symlink", target, "/home"),
        Err(_) => arguments.add("--ro-bind", tree.join("home"), "/home"),
    }
    arguments.add("--dev-bind", "/dev", "/dev");
    arguments.share("/proc");
    arguments.add("--ro-bind", "/sys", "/sys");
    arguments.0.extend(["--tmpfs".into(), "/run".into()]);
    arguments.add("--ro-bind", "/", HOST);
    for runtime in runtime_folders() {
        arguments.share(runtime);
    }
    for shared in SHARED {
        arguments.add("--bind-try", shared, shared);
    }
    arguments.add("--ro-bind-try", DEVICES, DEVICES);
    arguments.share("/tmp");
    arguments.share("/var/tmp");
    arguments.add("--ro-bind", HOST_FONTS, FONTS);
    arguments.share(home);
    arguments.0
}
