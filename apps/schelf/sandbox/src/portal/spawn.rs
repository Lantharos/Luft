use std::collections::HashMap;
use std::ffi::OsString;
use std::fs::File;
use std::io::Read;
use std::os::fd::{AsFd, AsRawFd, OwnedFd, RawFd};
use std::os::unix::ffi::{OsStrExt, OsStringExt};
use std::os::unix::fs::MetadataExt;
use std::os::unix::process::{CommandExt, ExitStatusExt};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};

use zbus::{Fd, Variant as Value};

use super::PATH;
use super::message::Outgoing;
use super::relay::{Client, PORTAL_NAME};
use crate::launch::{BWRAP, INSIDE_LAUNCHER, child_pid, fds, seccomp};

const SANDBOX: u32 = 1 << 2;
const NO_NETWORK: u32 = 1 << 3;
const WATCH_BUS: u32 = 1 << 4;
const EXPOSE_PIDS: u32 = 1 << 5;
const NOTIFY_START: u32 = 1 << 6;
const SHARE_PIDS: u32 = 1 << 7;
const EMPTY_APP: u32 = 1 << 8;
const FLAGS: u32 = (EMPTY_APP << 1) - 1;

const SHARE_DISPLAY: u32 = 1 << 0;
const SHARE_SOUND: u32 = 1 << 1;
const SHARE_GPU: u32 = 1 << 2;
const ALLOW_BUS: u32 = 1 << 3;
const ALLOW_ACCESSIBILITY: u32 = 1 << 4;
const SANDBOX_FLAGS: u32 = (ALLOW_ACCESSIBILITY << 1) - 1;

const OUTER_USER_NAMESPACE: &str = "root/run/.userns";

/// The pieces the app's sandbox is made of, from which every sandbox the
/// portal starts is made: all of them for a process that runs like the app,
/// the floor and what the caller asks for in a sandbox of its own.
pub struct Layout {
    pub app: Vec<OsString>,
    pub app_files: Vec<OsString>,
    pub floor: Vec<OsString>,
    pub gpu: Vec<OsString>,
    pub display: Vec<OsString>,
    pub sound: Vec<OsString>,
    pub bus: Vec<OsString>,
    pub environment: Vec<OsString>,
    pub offline: bool,
}

pub struct Request {
    directory: PathBuf,
    argv: Vec<OsString>,
    fds: Vec<(OwnedFd, RawFd)>,
    environment: Vec<(String, String)>,
    flags: u32,
    sandbox_flags: u32,
    exposed: Vec<(OwnedFd, bool)>,
}

fn path(bytes: Vec<u8>) -> OsString {
    let mut bytes = bytes;
    if bytes.last() == Some(&0) {
        bytes.pop();
    }
    OsString::from_vec(bytes)
}

fn exposed(
    options: &HashMap<String, Value<'_>>,
    name: &str,
    writable: bool,
) -> Result<Vec<(OwnedFd, bool)>, String> {
    let Some(Value::Array(handles)) = options.get(name) else {
        return Ok(Vec::new());
    };
    handles
        .iter()
        .map(|handle| match handle {
            Value::Fd(fd) => fd
                .as_fd()
                .try_clone_to_owned()
                .map(|fd| (fd, writable))
                .map_err(|error| error.to_string()),
            _ => Err(format!("{name} holds something other than files")),
        })
        .collect()
}

impl Request {
    pub fn read(
        directory: Vec<u8>,
        argv: Vec<Vec<u8>>,
        fds: &HashMap<u32, Fd<'_>>,
        environment: HashMap<String, String>,
        flags: u32,
        options: &HashMap<String, Value<'_>>,
    ) -> Result<Self, String> {
        if flags & !FLAGS != 0 {
            return Err(format!("Unsupported flags enabled: {:#x}", flags & !FLAGS));
        }
        let sandbox_flags = match options.get("sandbox-flags") {
            Some(Value::U32(flags)) => *flags,
            Some(_) => return Err("sandbox-flags isn't a number".into()),
            None => 0,
        };
        if sandbox_flags & !SANDBOX_FLAGS != 0 {
            return Err(format!(
                "Unsupported sandbox flags enabled: {:#x}",
                sandbox_flags & !SANDBOX_FLAGS
            ));
        }
        let argv: Vec<OsString> = argv.into_iter().map(path).collect();
        if argv.first().is_none_or(|program| program.is_empty()) {
            return Err("No command given".into());
        }
        if environment
            .keys()
            .any(|name| name.is_empty() || name.contains('='))
        {
            return Err("Invalid environment variable name".into());
        }
        let fds = fds
            .iter()
            .map(|(target, fd)| {
                let target = RawFd::try_from(*target).map_err(|error| error.to_string())?;
                let fd = fd
                    .as_fd()
                    .try_clone_to_owned()
                    .map_err(|error| error.to_string())?;
                Ok((fd, target))
            })
            .collect::<Result<_, String>>()?;
        let mut exposed_files = exposed(options, "sandbox-expose-fd", true)?;
        exposed_files.extend(exposed(options, "sandbox-expose-fd-ro", false)?);
        Ok(Self {
            directory: PathBuf::from(path(directory)),
            argv,
            fds,
            environment: environment.into_iter().collect(),
            flags,
            sandbox_flags,
            exposed: exposed_files,
        })
    }

    fn has(&self, flag: u32) -> bool {
        self.flags & flag != 0
    }

    fn allows(&self, flag: u32) -> bool {
        self.sandbox_flags & flag != 0
    }
}

/// A process the portal started, watched until it ends.
pub struct Started {
    pub pid: u32,
    pub watch_bus: bool,
    child: Child,
    info: File,
    expose_pids: bool,
    notify: bool,
}

/// Opens the namespace at `path` to join, unless it's the one at `current`.
fn namespace_unless(path: &Path, current: &Path) -> Option<File> {
    let namespace = File::open(path).ok()?;
    let same = match (namespace.metadata(), std::fs::metadata(current)) {
        (Ok(joined), Ok(current)) => joined.ino() == current.ino() && joined.dev() == current.dev(),
        _ => false,
    };
    (!same).then_some(namespace)
}

fn exposed_path(fd: &OwnedFd) -> Option<PathBuf> {
    let path = std::fs::read_link(format!("/proc/self/fd/{}", fd.as_raw_fd())).ok()?;
    (path.is_absolute() && !path.as_os_str().as_bytes().ends_with(b" (deleted)")).then_some(path)
}

fn writable(fd: &OwnedFd) -> bool {
    let mode = unsafe { libc::fcntl(fd.as_raw_fd(), libc::F_GETFL) } & libc::O_ACCMODE;
    mode == libc::O_RDWR || mode == libc::O_WRONLY
}

/// Puts each descriptor at its number in the child, through copies above
/// every number in use so none overwrites another.
fn place(command: &mut Command, placed: Vec<(RawFd, RawFd)>) {
    let above = placed
        .iter()
        .map(|(source, target)| (*source).max(*target))
        .max()
        .unwrap_or(2)
        + 1;
    unsafe {
        command.pre_exec(move || {
            let mut copies = Vec::with_capacity(placed.len());
            for (source, _) in &placed {
                let copy = libc::fcntl(*source, libc::F_DUPFD_CLOEXEC, above);
                if copy < 0 {
                    return Err(std::io::Error::last_os_error());
                }
                copies.push(copy);
            }
            for (copy, (_, target)) in copies.iter().zip(&placed) {
                if libc::dup2(*copy, *target) < 0 {
                    return Err(std::io::Error::last_os_error());
                }
            }
            if libc::setsid() < 0 {
                return Err(std::io::Error::last_os_error());
            }
            Ok(())
        });
    }
}

pub fn start(layout: &Layout, sandbox: u32, request: Request) -> Result<Started, String> {
    let process = PathBuf::from(format!("/proc/{sandbox}"));
    let ended = || "The app's sandbox has ended.".to_owned();
    let outer_namespace = process.join(OUTER_USER_NAMESPACE);
    let outer =
        namespace_unless(&outer_namespace, Path::new("/proc/self/ns/user")).ok_or_else(ended)?;
    let inner = namespace_unless(&process.join("ns/user"), &outer_namespace);
    let pids = File::open(process.join("ns/pid")).map_err(|_| ended())?;
    let filter = seccomp::filter()?;
    let (info, info_end) = fds::pipe()?;
    let mut helpers = vec![("--userns", outer.as_raw_fd())];
    if let Some(inner) = &inner {
        helpers.push(("--userns2", inner.as_raw_fd()));
    }
    helpers.push(("--pidns", pids.as_raw_fd()));
    helpers.push(("--seccomp", filter.as_raw_fd()));
    helpers.push(("--info-fd", info_end.as_raw_fd()));
    let mut next = request
        .fds
        .iter()
        .map(|(_, target)| *target)
        .max()
        .unwrap_or(2)
        .max(2)
        + 1;
    let mut placed: Vec<(RawFd, RawFd)> = request
        .fds
        .iter()
        .map(|(fd, target)| (fd.as_raw_fd(), *target))
        .collect();
    let mut arguments: Vec<OsString> = Vec::new();
    for (flag, fd) in helpers {
        placed.push((fd, next));
        arguments.push(flag.into());
        arguments.push(next.to_string().into());
        next += 1;
    }
    arguments.extend(
        [
            "--assert-userns-disabled",
            "--die-with-parent",
            "--new-session",
        ]
        .map(OsString::from),
    );
    if !request.has(SHARE_PIDS) {
        arguments.push("--unshare-pid".into());
    }
    if request.has(NO_NETWORK) || layout.offline {
        arguments.push("--unshare-net".into());
    }
    if request.has(SANDBOX) {
        arguments
            .extend(["--unshare-ipc", "--unshare-uts", "--unshare-cgroup-try"].map(OsString::from));
        arguments.extend(layout.floor.iter().cloned());
        if !request.has(EMPTY_APP) {
            arguments.extend(layout.app_files.iter().cloned());
        }
        for (wanted, part) in [
            (SHARE_GPU, &layout.gpu),
            (SHARE_DISPLAY, &layout.display),
            (SHARE_SOUND, &layout.sound),
            (ALLOW_BUS, &layout.bus),
        ] {
            if request.allows(wanted) {
                arguments.extend(part.iter().cloned());
            }
        }
    } else {
        arguments.extend(layout.app.iter().cloned());
    }
    for (fd, wants_writing) in &request.exposed {
        let Some(path) = exposed_path(fd) else {
            continue;
        };
        placed.push((fd.as_raw_fd(), next));
        let bind = if *wants_writing && writable(fd) {
            "--bind-fd"
        } else {
            "--ro-bind-fd"
        };
        arguments.extend([bind.into(), next.to_string().into(), path.into_os_string()]);
        next += 1;
    }
    arguments.extend(layout.environment.iter().cloned());
    for (name, value) in &request.environment {
        arguments.extend(["--setenv".into(), name.into(), value.into()]);
    }
    arguments.push("--chdir".into());
    arguments.push(request.directory.clone().into_os_string());
    arguments.extend(["--", INSIDE_LAUNCHER, crate::CONFINE].map(OsString::from));
    arguments.extend(request.argv.iter().cloned());
    let mut command = Command::new(BWRAP);
    command.args(arguments).stdin(Stdio::null());
    place(&mut command, placed);
    let child = command
        .spawn()
        .map_err(|error| format!("{BWRAP}: {error}"))?;
    drop(info_end);
    Ok(Started {
        pid: child.id(),
        watch_bus: request.has(WATCH_BUS),
        child,
        info: File::from(info),
        expose_pids: request.has(EXPOSE_PIDS) || request.has(SHARE_PIDS),
        notify: request.has(NOTIFY_START),
    })
}

/// The process's ID as the app's sandbox sees it.
fn relative_pid(pid: u32) -> u32 {
    let Ok(status) = std::fs::read_to_string(format!("/proc/{pid}/status")) else {
        return 0;
    };
    status
        .lines()
        .find_map(|line| line.strip_prefix("NSpid:"))
        .map(|ids| ids.split_whitespace().collect::<Vec<_>>())
        .and_then(|ids| ids.len().checked_sub(2).and_then(|at| ids[at].parse().ok()))
        .unwrap_or(0)
}

fn announce(client: &Client, member: &'static str, first: u32, second: u32) {
    client.send(
        &Outgoing::signal(PORTAL_NAME, PATH, PORTAL_NAME, member).with_body("uu", &(first, second)),
    );
}

impl Started {
    /// Tells the caller when the process started and when it ended.
    pub fn watch(mut self, client: &Client) {
        let mut info = String::new();
        let _ = self.info.read_to_string(&mut info);
        if let Some(child) = child_pid(&info)
            && self.notify
        {
            let relative = if self.expose_pids {
                relative_pid(child)
            } else {
                0
            };
            announce(client, "SpawnStarted", self.pid, relative);
        }
        let status = self
            .child
            .wait()
            .map(|status| status.into_raw())
            .unwrap_or(0);
        announce(client, "SpawnExited", self.pid, status as u32);
    }
}

pub fn signal(pid: u32, signal: i32, group: bool) {
    let Ok(pid) = libc::pid_t::try_from(pid) else {
        return;
    };
    unsafe {
        if group {
            libc::killpg(pid, signal);
        } else {
            libc::kill(pid, signal);
        }
    }
}
