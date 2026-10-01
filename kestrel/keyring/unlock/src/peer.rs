use std::ffi::CStr;
use std::fs::{self, File};
use std::io::Read;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::os::unix::fs::{MetadataExt, PermissionsExt};
use std::path::PathBuf;

const UNIT: &str = "luft-keyring.service";
const LOADER_VARIABLES: [&[u8]; 3] = [b"LD_PRELOAD=", b"LD_AUDIT=", b"LD_LIBRARY_PATH="];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Peer {
    Root,
    Keyring(u32),
    Stranger,
}

pub struct Verifier {
    daemon: PathBuf,
}

impl Verifier {
    pub fn new(daemon: PathBuf) -> Self {
        Self { daemon }
    }

    pub fn identify(&self, socket: RawFd) -> Peer {
        match peer_uid(socket) {
            Some(0) => Peer::Root,
            Some(user) => match self.is_keyring(socket, user) {
                Ok(()) => Peer::Keyring(user),
                Err(reason) => {
                    eprintln!("Refused a connection from user {user}: {reason}");
                    Peer::Stranger
                }
            },
            None => Peer::Stranger,
        }
    }

    fn is_keyring(&self, socket: RawFd, user: u32) -> Result<(), &'static str> {
        let pidfd = peer_pidfd(socket).ok_or("its process can't be identified")?;
        let pid = pid_of(&pidfd).ok_or("its process has no ID")?;
        let process = open_at(
            None,
            &format!("/proc/{pid}"),
            libc::O_PATH | libc::O_DIRECTORY,
        )
        .ok_or("its process can't be opened")?;
        alive(&pidfd, pid).ok_or("its process ended")?;

        let status = read_at(&process, c"status").ok_or("its status can't be read")?;
        let status = String::from_utf8_lossy(&status);
        let field = |name: &str| {
            status
                .lines()
                .find_map(|line| line.strip_prefix(name))
                .map(str::split_whitespace)
        };
        let same_user = field("Uid:").is_some_and(|mut ids| ids.all(|id| id.parse() == Ok(user)));
        check(same_user, "it changed its user IDs")?;
        check(
            field("TracerPid:").is_some_and(|tracer| tracer.eq(["0"])),
            "it is being traced",
        )?;

        let binary =
            fs::metadata(&self.daemon).map_err(|_| "the keyring program isn't installed")?;
        check(
            binary.uid() == 0 && binary.permissions().mode() & 0o022 == 0,
            "the keyring program isn't protected by root",
        )?;
        let running = open_at(Some(&process), "exe", libc::O_PATH)
            .and_then(|exe| File::from(exe).metadata().ok())
            .ok_or("its program can't be read")?;
        check(
            running.dev() == binary.dev() && running.ino() == binary.ino(),
            "it isn't the keyring program",
        )?;

        let cgroup = read_at(&process, c"cgroup")
            .and_then(|cgroup| String::from_utf8(cgroup).ok())
            .unwrap_or_default();
        let path = cgroup
            .lines()
            .find_map(|line| line.strip_prefix("0::"))
            .unwrap_or_default();
        let manager = format!("/user.slice/user-{user}.slice/user@{user}.service/");
        check(
            path.starts_with(&manager) && path.rsplit('/').next() == Some(UNIT),
            "it doesn't run as the keyring service",
        )?;

        let environment = read_at(&process, c"environ").ok_or("its environment can't be read")?;
        let preloaded = environment.split(|byte| *byte == 0).any(|variable| {
            LOADER_VARIABLES
                .iter()
                .any(|name| variable.starts_with(name))
        });
        check(!preloaded, "it was started with extra libraries")?;
        alive(&pidfd, pid).ok_or("its process ended")
    }
}

fn check(condition: bool, reason: &'static str) -> Result<(), &'static str> {
    if condition { Ok(()) } else { Err(reason) }
}

fn peer_uid(socket: RawFd) -> Option<u32> {
    let mut credentials = libc::ucred {
        pid: 0,
        uid: 0,
        gid: 0,
    };
    let mut length = size_of::<libc::ucred>() as libc::socklen_t;
    let result = unsafe {
        libc::getsockopt(
            socket,
            libc::SOL_SOCKET,
            libc::SO_PEERCRED,
            (&raw mut credentials).cast(),
            &raw mut length,
        )
    };
    (result == 0).then_some(credentials.uid)
}

fn peer_pidfd(socket: RawFd) -> Option<OwnedFd> {
    let mut pidfd: libc::c_int = -1;
    let mut length = size_of::<libc::c_int>() as libc::socklen_t;
    let result = unsafe {
        libc::getsockopt(
            socket,
            libc::SOL_SOCKET,
            libc::SO_PEERPIDFD,
            (&raw mut pidfd).cast(),
            &raw mut length,
        )
    };
    (result == 0 && pidfd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(pidfd) })
}

fn pid_of(pidfd: &OwnedFd) -> Option<u32> {
    let info = fs::read_to_string(format!("/proc/self/fdinfo/{}", pidfd.as_raw_fd())).ok()?;
    info.lines()
        .find_map(|line| line.strip_prefix("Pid:"))
        .and_then(|pid| pid.trim().parse().ok())
        .filter(|pid| *pid > 0)
}

fn alive(pidfd: &OwnedFd, pid: u32) -> Option<()> {
    (pid_of(pidfd) == Some(pid)).then_some(())
}

fn open_at(directory: Option<&OwnedFd>, path: &str, flags: libc::c_int) -> Option<OwnedFd> {
    let path = std::ffi::CString::new(path).ok()?;
    let directory = directory.map_or(libc::AT_FDCWD, AsRawFd::as_raw_fd);
    let fd = unsafe { libc::openat(directory, path.as_ptr(), flags | libc::O_CLOEXEC) };
    (fd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(fd) })
}

fn read_at(directory: &OwnedFd, name: &CStr) -> Option<Vec<u8>> {
    let fd = unsafe {
        libc::openat(
            directory.as_raw_fd(),
            name.as_ptr(),
            libc::O_RDONLY | libc::O_CLOEXEC,
        )
    };
    if fd < 0 {
        return None;
    }
    let mut contents = Vec::new();
    unsafe { File::from_raw_fd(fd) }
        .read_to_end(&mut contents)
        .ok()?;
    Some(contents)
}
