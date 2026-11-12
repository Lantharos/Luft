use std::ffi::CString;
use std::fs::{self, File};
use std::io::Read;
use std::os::fd::{AsRawFd, BorrowedFd, FromRawFd, OwnedFd};
use std::os::unix::fs::{MetadataExt, PermissionsExt};
use std::path::Path;

const STATUS: &str = "status";

/// A process a pidfd pins, looked at through its `/proc` folder.
pub struct Process<'a> {
    pidfd: BorrowedFd<'a>,
    pid: u32,
    folder: OwnedFd,
}

impl<'a> Process<'a> {
    pub fn pinned(pidfd: BorrowedFd<'a>) -> Result<Self, &'static str> {
        let pid = pid_of(pidfd).ok_or("its process has no ID")?;
        let folder = open_at(
            None,
            &format!("/proc/{pid}"),
            libc::O_PATH | libc::O_DIRECTORY,
        )
        .ok_or("its process can't be opened")?;
        let process = Self { pidfd, pid, folder };
        process.still_running()?;
        Ok(process)
    }

    pub fn still_running(&self) -> Result<(), &'static str> {
        check(pid_of(self.pidfd) == Some(self.pid), "its process ended")
    }

    pub fn open(&self, name: &str, flags: libc::c_int) -> Option<OwnedFd> {
        open_at(Some(&self.folder), name, flags)
    }

    pub fn read(&self, name: &str) -> Option<Vec<u8>> {
        let mut contents = Vec::new();
        File::from(self.open(name, libc::O_RDONLY)?)
            .read_to_end(&mut contents)
            .ok()?;
        Some(contents)
    }

    /// Whether it runs as `user` and started `program` with the group the
    /// program is installed setgid to. The kernel only hands out that group
    /// to a start nothing traced and that took no new privileges, and keeps
    /// your programs out of the process from then on.
    pub fn started_shielded(&self, program: &Path, user: u32) -> Result<(), &'static str> {
        let group = group_of(program)?;
        let status = self.read(STATUS).ok_or("its status can't be read")?;
        let status = String::from_utf8_lossy(&status);
        let field = |name: &str| {
            status
                .lines()
                .find_map(|line| line.strip_prefix(name))
                .map(str::split_whitespace)
        };
        check(
            field("Uid:").is_some_and(|mut ids| ids.all(|id| id.parse() == Ok(user))),
            "it changed its user IDs",
        )?;
        check(
            field("TracerPid:").is_some_and(|tracer| tracer.eq(["0"])),
            "it is being traced",
        )?;
        let raised = field("Gid:").and_then(|mut ids| {
            let real = ids.next()?.parse::<u32>().ok()?;
            let effective = ids.next()?.parse::<u32>().ok()?;
            Some(real != effective && effective == group)
        });
        check(
            raised == Some(true),
            "it didn't start with its program's group, so it may be watched",
        )?;
        self.still_running()
    }
}

/// The group `program` is installed setgid to, when root owns it, nobody
/// else may change it, and the group isn't root's.
fn group_of(program: &Path) -> Result<u32, &'static str> {
    let binary = fs::metadata(program).map_err(|_| "the program isn't installed")?;
    let mode = binary.permissions().mode();
    check(
        binary.uid() == 0 && mode & 0o022 == 0,
        "the program isn't protected by root",
    )?;
    check(
        mode & libc::S_ISGID != 0 && binary.gid() != 0,
        "the program isn't installed with its own group",
    )?;
    Ok(binary.gid())
}

fn check(condition: bool, reason: &'static str) -> Result<(), &'static str> {
    if condition { Ok(()) } else { Err(reason) }
}

fn pid_of(pidfd: BorrowedFd<'_>) -> Option<u32> {
    fs::read_to_string(format!("/proc/self/fdinfo/{}", pidfd.as_raw_fd()))
        .ok()?
        .lines()
        .find_map(|line| line.strip_prefix("Pid:"))?
        .trim()
        .parse()
        .ok()
        .filter(|pid| *pid > 0)
}

fn open_at(directory: Option<&OwnedFd>, path: &str, flags: libc::c_int) -> Option<OwnedFd> {
    let path = CString::new(path).ok()?;
    let directory = directory.map_or(libc::AT_FDCWD, AsRawFd::as_raw_fd);
    let fd = unsafe { libc::openat(directory, path.as_ptr(), flags | libc::O_CLOEXEC) };
    (fd >= 0).then(|| unsafe { OwnedFd::from_raw_fd(fd) })
}
