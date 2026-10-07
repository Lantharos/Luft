use std::ffi::CString;
use std::fs::File;
use std::io::Read;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::path::Path;

use super::program::{Program, is_interpreter};

const PARENT: usize = 1;
const TERMINAL: usize = 4;
const STARTED: usize = 19;

pub struct Process {
    directory: OwnedFd,
}

impl Process {
    pub fn open(pid: u32, pidfd: Option<&zbus::zvariant::OwnedFd>) -> Option<Self> {
        let path = CString::new(format!("/proc/{pid}")).ok()?;
        let fd = unsafe {
            libc::open(
                path.as_ptr(),
                libc::O_PATH | libc::O_DIRECTORY | libc::O_CLOEXEC,
            )
        };
        if fd < 0 {
            return None;
        }
        let directory = unsafe { OwnedFd::from_raw_fd(fd) };
        if let Some(pidfd) = pidfd {
            let alive = unsafe {
                libc::syscall(
                    libc::SYS_pidfd_send_signal,
                    pidfd.as_raw_fd(),
                    0,
                    std::ptr::null::<libc::siginfo_t>(),
                    0,
                )
            };
            (alive == 0).then_some(())?;
        }
        Some(Self { directory })
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
        let image = self.image(&executable);
        Program::new(executable, script, image)
    }

    fn image(&self, executable: &str) -> Option<String> {
        let mount = self.environment("APPDIR")?;
        Path::new(executable)
            .starts_with(&mount)
            .then(|| self.environment("APPIMAGE"))
            .flatten()
    }

    fn environment(&self, name: &str) -> Option<String> {
        let environ = self.read("environ")?;
        environ.split(|byte| *byte == 0).find_map(|entry| {
            let value = entry.strip_prefix(name.as_bytes())?.strip_prefix(b"=")?;
            String::from_utf8(value.to_vec()).ok()
        })
    }

    pub fn has_terminal(&self) -> bool {
        self.stat_field::<i32>(TERMINAL)
            .is_some_and(|terminal| terminal != 0)
    }

    pub fn parent(&self) -> Option<Self> {
        let parent_id = self.stat_field::<u32>(PARENT)?;
        let started = self.stat_field::<u64>(STARTED)?;
        let parent = Self::open(parent_id, None)?;
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

    pub fn unit_app_id(&self) -> Option<String> {
        let cgroup = String::from_utf8(self.read("cgroup")?).ok()?;
        let unit = cgroup
            .lines()
            .find_map(|line| line.strip_prefix("0::"))?
            .rsplit('/')
            .next()?
            .to_owned();
        app_id_from_unit(&unit)
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
