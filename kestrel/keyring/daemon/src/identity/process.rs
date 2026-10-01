use std::ffi::CString;
use std::fs::File;
use std::io::Read;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};

const INTERPRETERS: [&str; 7] = ["python", "perl", "ruby", "node", "bash", "sh", "bun"];

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

    pub fn program(&self, executable: &str) -> String {
        let base = executable.rsplit('/').next().unwrap_or(executable);
        let interpreted = INTERPRETERS.iter().any(|interpreter| {
            base.strip_prefix(interpreter).is_some_and(|rest| {
                rest.chars()
                    .all(|character| character.is_ascii_digit() || character == '.')
            })
        });
        let script = interpreted
            .then(|| self.read("cmdline"))
            .flatten()
            .and_then(|cmdline| {
                cmdline
                    .split(|byte| *byte == 0)
                    .skip(1)
                    .find(|argument| !argument.is_empty() && !argument.starts_with(b"-"))
                    .and_then(|argument| String::from_utf8(argument.to_vec()).ok())
            });
        match script {
            Some(script) => format!("{executable} {script}"),
            None => executable.to_owned(),
        }
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
