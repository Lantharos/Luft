use std::os::fd::{AsFd, FromRawFd, OwnedFd, RawFd};
use std::path::PathBuf;

use luft_identity::program;
use luft_shelter::Process;

const UNIT: &str = "luft-keyring.service";

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
        let process = Process::pinned(pidfd.as_fd())?;
        process.started_sheltered(&self.daemon, user)?;
        let running = process
            .open("exe", libc::O_PATH)
            .ok_or("its program can't be read")?;
        check(
            program::is_installed_file(&running, &self.daemon),
            "it isn't the keyring program",
        )?;

        let cgroup = process
            .read("cgroup")
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

        process.still_running()
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
