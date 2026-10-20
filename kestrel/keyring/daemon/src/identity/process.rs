use std::ffi::CString;
use std::fs::File;
use std::io::Read;
use std::os::fd::{AsRawFd, BorrowedFd, FromRawFd, OwnedFd};
use std::os::unix::fs::MetadataExt;

use super::image;
use super::program::{Program, is_interpreter};

const PARENT: usize = 1;
const TERMINAL: usize = 4;
const STARTED: usize = 19;
const FUSE_DEVICE: &str = "/dev/fuse";

pub struct Process {
    directory: OwnedFd,
}

impl Process {
    pub fn open(pid: u32) -> Option<Self> {
        let path = CString::new(format!("/proc/{pid}")).ok()?;
        let fd = unsafe {
            libc::open(
                path.as_ptr(),
                libc::O_PATH | libc::O_DIRECTORY | libc::O_CLOEXEC,
            )
        };
        (fd >= 0).then(|| Self {
            directory: unsafe { OwnedFd::from_raw_fd(fd) },
        })
    }

    pub fn of_peer(pidfd: BorrowedFd<'_>) -> Option<Self> {
        let pid = pid_of(pidfd)?;
        let process = Self::open(pid)?;
        (pid_of(pidfd) == Some(pid)).then_some(process)
    }

    fn read(&self, name: &str) -> Option<Vec<u8>> {
        let name = CString::new(name).ok()?;
        let fd = unsafe {
            libc::openat(
                self.directory.as_raw_fd(),
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

    fn link(&self, name: &str) -> Option<String> {
        let name = CString::new(name).ok()?;
        let mut buffer = vec![0u8; 4096];
        let length = unsafe {
            libc::readlinkat(
                self.directory.as_raw_fd(),
                name.as_ptr(),
                buffer.as_mut_ptr().cast(),
                buffer.len(),
            )
        };
        let length = usize::try_from(length).ok()?;
        buffer.truncate(length);
        String::from_utf8(buffer).ok()
    }

    pub fn flatpak_id(&self) -> Option<String> {
        let info = String::from_utf8(self.read("root/.flatpak-info")?).ok()?;
        let mut in_application = false;
        for line in info.lines() {
            if line.starts_with('[') {
                in_application = line == "[Application]";
            } else if in_application && let Some(name) = line.strip_prefix("name=") {
                return Some(name.trim().to_owned());
            }
        }
        None
    }

    pub fn executable(&self) -> Option<String> {
        let link = self.link("exe")?;
        Some(link.strip_suffix(" (deleted)").unwrap_or(&link).to_owned())
    }

    pub fn runs_installed(&self, path: &str) -> bool {
        let Some(running) = self.executable_status() else {
            return false;
        };
        std::fs::metadata(path).is_ok_and(|installed| {
            installed.uid() == 0
                && installed.mode() & 0o022 == 0
                && running.stx_ino == installed.ino()
                && libc::makedev(running.stx_dev_major, running.stx_dev_minor) == installed.dev()
        })
    }

    pub fn program(&self, executable: String) -> Program {
        let script = is_interpreter(&executable)
            .then(|| self.read("cmdline"))
            .flatten()
            .and_then(|cmdline| {
                cmdline
                    .split(|byte| *byte == 0)
                    .skip(1)
                    .find(|argument| !argument.is_empty() && !argument.starts_with(b"-"))
                    .and_then(|argument| String::from_utf8(argument.to_vec()).ok())
            });
        let image = image::of(self);
        Program::new(executable, script, image)
    }

    pub fn executable_device(&self) -> Option<(u32, u32)> {
        self.executable_status()
            .map(|status| (status.stx_dev_major, status.stx_dev_minor))
    }

    fn executable_status(&self) -> Option<libc::statx> {
        let mut status = unsafe { std::mem::zeroed::<libc::statx>() };
        let found = unsafe {
            libc::statx(
                self.directory.as_raw_fd(),
                c"exe".as_ptr(),
                libc::AT_STATX_DONT_SYNC,
                libc::STATX_INO,
                &raw mut status,
            )
        };
        (found == 0).then_some(status)
    }

    pub fn mounts(&self) -> Option<String> {
        String::from_utf8(self.read("mountinfo")?).ok()
    }

    pub fn serves_fuse(&self, connection: u32) -> bool {
        let listing = format!("/proc/self/fd/{}/fd", self.directory.as_raw_fd());
        let Ok(descriptors) = std::fs::read_dir(listing) else {
            return false;
        };
        let wanted = format!("fuse_connection:\t{connection}\n");
        descriptors.flatten().any(|descriptor| {
            let number = descriptor.file_name();
            let number = number.to_string_lossy();
            self.link(&format!("fd/{number}")).as_deref() == Some(FUSE_DEVICE)
                && self
                    .read(&format!("fdinfo/{number}"))
                    .is_some_and(|info| String::from_utf8_lossy(&info).contains(&wanted))
        })
    }

    pub fn has_terminal(&self) -> bool {
        self.stat_field::<i32>(TERMINAL)
            .is_some_and(|terminal| terminal != 0)
    }

    pub fn parent(&self) -> Option<Self> {
        let parent_id = self.stat_field::<u32>(PARENT)?;
        let started = self.stat_field::<u64>(STARTED)?;
        let parent = Self::open(parent_id)?;
        let still_its_child = self.stat_field::<u32>(PARENT) == Some(parent_id);
        let started_first = parent.stat_field::<u64>(STARTED)? <= started;
        (still_its_child && started_first).then_some(parent)
    }

    fn stat_field<T: std::str::FromStr>(&self, index: usize) -> Option<T> {
        let stat = self.read("stat")?;
        String::from_utf8_lossy(&stat)
            .rsplit_once(')')?
            .1
            .split_whitespace()
            .nth(index)?
            .parse()
            .ok()
    }

    pub fn unit(&self) -> Option<String> {
        let cgroup = String::from_utf8(self.read("cgroup")?).ok()?;
        Some(
            cgroup
                .lines()
                .find_map(|line| line.strip_prefix("0::"))?
                .rsplit('/')
                .next()?
                .to_owned(),
        )
    }

    pub fn unit_app_id(&self) -> Option<String> {
        app_id_from_unit(&self.unit()?)
    }
}

fn app_id_from_unit(unit: &str) -> Option<String> {
    let name = unit.strip_prefix("app-")?;
    let name = name
        .strip_suffix(".scope")
        .map(|scope| scope.rsplit_once('-').map_or(scope, |(name, _)| name))
        .or_else(|| {
            let service = name.strip_suffix(".service")?;
            Some(service.split_once('@').map_or(service, |(name, _)| name))
        })?;
    let id = name.rsplit('-').next()?;
    Some(id.replace("\\x2d", "-"))
}

fn pid_of(pidfd: BorrowedFd<'_>) -> Option<u32> {
    std::fs::read_to_string(format!("/proc/self/fdinfo/{}", pidfd.as_raw_fd()))
        .ok()?
        .lines()
        .find_map(|line| line.strip_prefix("Pid:"))?
        .trim()
        .parse()
        .ok()
        .filter(|pid| *pid > 0)
}
