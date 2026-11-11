use std::path::{Component, Path, PathBuf};

use super::super::folder;
use super::{Arguments, INSIDE_LAUNCHER, Profile, Temporary};

const SYSTEMD_RUN: &str = "/usr/bin/systemd-run";
const OUTER_USER_NAMESPACE: &str = "/run/.userns";
const SETTINGS: &str = "/etc";
const USERS: &str = "passwd";
const GROUPS: &str = "group";
const NOBODY: u32 = 65534;
pub(super) const SHARED_MEMORY: &str = "/dev/shm";
const SYSTEM_FOLDERS: [&str; 5] = [
    "/sys/block",
    "/sys/bus",
    "/sys/class",
    "/sys/dev",
    "/sys/devices",
];

/// The system's settings apps and the libraries they load read: how names
/// are looked up, certificates, fonts, time zone, graphics and sound.
/// The rest of `/etc`, such as who else has an account, which disks and
/// printers there are and how the computer is set up, stays outside.
const SYSTEM_SETTINGS: [&str; 50] = [
    "OpenCL",
    "alsa",
    "alternatives",
    "asound.conf",
    "ca-certificates",
    "crypto-policies",
    "dconf",
    "drirc",
    "egl",
    "fonts",
    "gai.conf",
    "glvnd",
    "gnutls",
    "gtk-2.0",
    "gtk-3.0",
    "gtk-4.0",
    "host.conf",
    "hostname",
    "hosts",
    "java",
    "krb5.conf",
    "krb5.conf.d",
    "ld.so.cache",
    "ld.so.conf",
    "ld.so.conf.d",
    "libva.conf",
    "locale.conf",
    "localtime",
    "machine-id",
    "mailcap",
    "mime.types",
    "mtab",
    "nsswitch.conf",
    "nvidia",
    "openal",
    "os-release",
    "pipewire",
    "pkcs11",
    "pki",
    "protocols",
    "pulse",
    "resolv.conf",
    "services",
    "shells",
    "ssl",
    "terminfo",
    "timezone",
    "vulkan",
    "xdg",
    "X11",
];

const LINKED_INTO: [&str; 3] = ["/usr", "/proc", "/etc"];

/// Where a link in `/etc` leads, when that is a place the sandbox has too.
fn leads_inside(target: &Path) -> bool {
    let mut place = PathBuf::from(SETTINGS);
    for part in target.components() {
        match part {
            Component::RootDir => place = PathBuf::from("/"),
            Component::ParentDir => {
                place.pop();
            }
            Component::Normal(name) => place.push(name),
            Component::CurDir | Component::Prefix(_) => {}
        }
    }
    LINKED_INTO.iter().any(|folder| place.starts_with(folder))
}

/// Shows each setting where it is. A link to something the sandbox also has,
/// such as the time zone, is made again rather than followed, so apps that
/// read where it leads still can.
fn settings(arguments: &mut Arguments) {
    let folder = Path::new(SETTINGS);
    for name in SYSTEM_SETTINGS {
        let setting = folder.join(name);
        match std::fs::read_link(&setting) {
            Ok(target) if leads_inside(&target) => arguments.bind("--symlink", target, &setting),
            _ => arguments.same("--ro-bind-try", &setting),
        };
    }
}

fn text(field: *const libc::c_char) -> String {
    if field.is_null() {
        return String::new();
    }
    unsafe { std::ffi::CStr::from_ptr(field) }
        .to_string_lossy()
        .into_owned()
}

/// Writes the account files the app sees in place of the computer's: you,
/// your group and the user that stands for everyone else, so it can look up
/// who runs it without learning who else has an account here.
pub fn write_accounts(folder: &Path) -> Result<(), String> {
    let (uid, gid) = unsafe { (libc::getuid(), libc::getgid()) };
    let you = unsafe { libc::getpwuid(uid) };
    if you.is_null() {
        return Err(std::io::Error::last_os_error().to_string());
    }
    let (name, full_name, home) = unsafe {
        (
            text((*you).pw_name),
            text((*you).pw_gecos),
            text((*you).pw_dir),
        )
    };
    let group = unsafe { libc::getgrgid(gid) };
    let group = if group.is_null() {
        name.clone()
    } else {
        text(unsafe { (*group).gr_name })
    };
    let users = format!(
        "{name}:x:{uid}:{gid}:{full_name}:{home}:/bin/sh\nnobody:x:{NOBODY}:{NOBODY}:Nobody:/:/sbin/nologin\n"
    );
    let groups = format!("{group}:x:{gid}:\nnobody:x:{NOBODY}:\n");
    for (file, contents) in [(USERS, users), (GROUPS, groups)] {
        std::fs::write(folder.join(file), contents).map_err(|error| error.to_string())?;
    }
    Ok(())
}

impl Profile<'_> {
    /// What every sandbox of the app stands on, its own and those the portal
    /// starts: the system read-only, fresh `/proc` and `/dev`, `/tmp`, and
    /// empty runtime and home folders.
    pub(super) fn floor(
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
            .flag("--proc")
            .flag("/proc")
            .bind("--ro-bind-try", launcher, SYSTEMD_RUN);
        for folder in SYSTEM_FOLDERS {
            arguments.same("--ro-bind-try", folder);
        }
        settings(&mut arguments);
        for accounts in [USERS, GROUPS] {
            arguments.bind(
                "--ro-bind",
                self.folder.accounts().join(accounts),
                Path::new(SETTINGS).join(accounts),
            );
        }
        arguments
            .flag("--tmpfs")
            .flag("/run")
            .bind("--ro-bind", launcher, INSIDE_LAUNCHER)
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
            .flag(SHARED_MEMORY)
            .flag("--perms")
            .flag("0700")
            .flag("--dir")
            .path(folder::runtime_dir()?)
            .flag("--dir")
            .path(home);
        Ok(arguments)
    }
}
