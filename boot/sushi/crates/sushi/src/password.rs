use std::io;
use std::os::fd::{AsFd, BorrowedFd, OwnedFd};
use std::os::unix::net::UnixDatagram;
use std::path::{Path, PathBuf};

use rustix::fs::inotify::{self, CreateFlags, WatchFlags};
use rustix::time::{ClockId, clock_gettime};

const REQUESTS: &str = "/run/systemd/ask-password";
const MODHEX: &[u8; 16] = b"cbdefghijklnrtuv";
pub const RECOVERY_KEY_LETTERS: usize = 64;

#[derive(Default)]
pub struct Secret(Vec<u8>);

impl Secret {
    pub fn push(&mut self, character: char) {
        let mut encoded = [0u8; 4];
        self.0
            .extend_from_slice(character.encode_utf8(&mut encoded).as_bytes());
    }

    pub fn pop(&mut self) {
        let Some(last) = std::str::from_utf8(&self.0)
            .ok()
            .and_then(|text| text.char_indices().last())
        else {
            return;
        };
        self.wipe_from(last.0);
    }

    pub fn clear(&mut self) {
        self.wipe_from(0);
    }

    pub fn recovery_key_letters(&self) -> Option<usize> {
        let mut letters = 0;
        for byte in &self.0 {
            match byte {
                b'-' | b' ' => {}
                byte if MODHEX.contains(&byte.to_ascii_lowercase()) => letters += 1,
                _ => return None,
            }
        }
        Some(letters)
    }

    pub fn tidy_recovery_key(&mut self) {
        if self.recovery_key_letters() != Some(RECOVERY_KEY_LETTERS) {
            return;
        }
        let mut tidy = Vec::with_capacity(RECOVERY_KEY_LETTERS + 7);
        for byte in self.0.iter().filter(|byte| !matches!(byte, b'-' | b' ')) {
            if !tidy.is_empty() && (tidy.len() + 1) % 9 == 0 {
                tidy.push(b'-');
            }
            tidy.push(byte.to_ascii_lowercase());
        }
        self.clear();
        self.0 = tidy;
    }

    pub fn characters(&self) -> usize {
        std::str::from_utf8(&self.0).map_or(0, |text| text.chars().count())
    }

    fn wipe_from(&mut self, start: usize) {
        for byte in &mut self.0[start..] {
            unsafe { std::ptr::write_volatile(byte, 0) };
        }
        self.0.truncate(start);
    }
}

impl Drop for Secret {
    fn drop(&mut self) {
        self.clear();
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Request {
    pub file: PathBuf,
    pub id: String,
    pub message: String,
    socket: PathBuf,
    pid: Option<i32>,
    not_after: Option<u64>,
}

fn monotonic_micros() -> u64 {
    let now = clock_gettime(ClockId::Monotonic);
    now.tv_sec as u64 * 1_000_000 + now.tv_nsec as u64 / 1_000
}

impl Request {
    fn parse(file: &Path, text: &str) -> Option<Self> {
        let value = |key: &str| {
            text.lines().find_map(|line| {
                line.strip_prefix(key)
                    .and_then(|rest| rest.strip_prefix('='))
                    .map(str::trim)
            })
        };
        Some(Self {
            file: file.to_owned(),
            id: value("Id").unwrap_or_default().to_owned(),
            message: value("Message").unwrap_or_default().to_owned(),
            socket: PathBuf::from(value("Socket")?),
            pid: value("PID").and_then(|pid| pid.parse().ok()),
            not_after: value("NotAfter")
                .and_then(|time| time.parse().ok())
                .filter(|time| *time > 0),
        })
    }

    pub fn is_live(&self) -> bool {
        let running = self.pid.is_none_or(|pid| unsafe { libc::kill(pid, 0) } == 0 || io::Error::last_os_error().raw_os_error() == Some(libc::EPERM));
        let current = self
            .not_after
            .is_none_or(|limit| monotonic_micros() < limit);
        running && current && self.file.exists()
    }

    pub fn answer(&self, secret: &Secret) -> io::Result<()> {
        let mut reply = Secret(Vec::with_capacity(secret.0.len() + 1));
        reply.0.push(b'+');
        reply.0.extend_from_slice(&secret.0);
        UnixDatagram::unbound()?
            .send_to(&reply.0, &self.socket)
            .map(drop)
    }
}

pub struct PasswordRequests {
    watch: OwnedFd,
}

impl AsFd for PasswordRequests {
    fn as_fd(&self) -> BorrowedFd<'_> {
        self.watch.as_fd()
    }
}

impl PasswordRequests {
    pub fn watch() -> io::Result<Self> {
        std::fs::create_dir_all(REQUESTS)?;
        let watch = inotify::init(CreateFlags::CLOEXEC | CreateFlags::NONBLOCK)?;
        inotify::add_watch(
            &watch,
            REQUESTS,
            WatchFlags::CLOSE_WRITE | WatchFlags::MOVED_TO | WatchFlags::DELETE,
        )?;
        Ok(Self { watch })
    }

    pub fn drain(&self) {
        let mut buffer = [std::mem::MaybeUninit::uninit(); 4096];
        let mut reader = inotify::Reader::new(&self.watch, &mut buffer);
        while reader.next().is_ok() {}
    }

    pub fn pending(&self) -> Vec<Request> {
        let mut requests: Vec<Request> = std::fs::read_dir(REQUESTS)
            .into_iter()
            .flatten()
            .flatten()
            .map(|entry| entry.path())
            .filter(|path| {
                path.file_name()
                    .and_then(|name| name.to_str())
                    .is_some_and(|name| name.starts_with("ask."))
            })
            .filter_map(|path| Request::parse(&path, &std::fs::read_to_string(&path).ok()?))
            .filter(Request::is_live)
            .collect();
        requests.sort_by(|a, b| a.file.cmp(&b.file));
        requests
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_a_cryptsetup_request() {
        let text = "[Ask]\nPID=412\nSocket=/run/systemd/ask-password/sck.1\nAcceptCached=1\nEcho=0\nNotAfter=0\nMessage=Please enter passphrase for disk root\nIcon=drive-harddisk\nId=cryptsetup:/dev/vda2\n";
        let request = Request::parse(Path::new("/run/systemd/ask-password/ask.1"), text).unwrap();
        assert_eq!(request.id, "cryptsetup:/dev/vda2");
        assert_eq!(
            request.socket,
            PathBuf::from("/run/systemd/ask-password/sck.1")
        );
        assert_eq!(request.not_after, None);
    }

    #[test]
    fn recovery_keys_typed_without_dashes_get_them_back() {
        let mut secret = Secret::default();
        "CBDEFGHI jklnrtuv"
            .repeat(4)
            .chars()
            .for_each(|character| secret.push(character));
        secret.tidy_recovery_key();
        assert_eq!(
            std::str::from_utf8(&secret.0).unwrap(),
            "cbdefghi-jklnrtuv-".repeat(4).trim_end_matches('-')
        );
    }

    #[test]
    fn erasing_removes_whole_characters() {
        let mut secret = Secret::default();
        "pë".chars().for_each(|character| secret.push(character));
        secret.pop();
        assert_eq!(secret.0, b"p");
        assert_eq!(secret.characters(), 1);
    }
}
