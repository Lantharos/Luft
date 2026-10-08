use std::ffi::CString;
use std::io;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::os::unix::ffi::OsStrExt;
use std::path::Path;
use std::sync::Arc;
use std::thread;
use std::time::{Duration, Instant};

use luft_app::Events;
use parking_lot::Mutex;
use serde::Serialize;

use crate::app::events::DIRECTORY_CHANGED;

const QUIET_PERIOD_MS: i32 = 150;
const MAX_LATENCY: Duration = Duration::from_millis(600);
const WATCH_MASK: u32 = libc::IN_CREATE
    | libc::IN_DELETE
    | libc::IN_MOVED_FROM
    | libc::IN_MOVED_TO
    | libc::IN_CLOSE_WRITE
    | libc::IN_ATTRIB
    | libc::IN_DELETE_SELF
    | libc::IN_MOVE_SELF;

#[derive(Clone)]
pub struct DirectoryWatcher {
    inner: Option<Arc<Inner>>,
}

struct Inner {
    fd: OwnedFd,
    current: Mutex<Option<Watch>>,
}

struct Watch {
    descriptor: i32,
    path: String,
}

#[derive(Serialize)]
struct DirectoryChanged<'a> {
    path: &'a str,
}

impl DirectoryWatcher {
    pub fn new(events: Events) -> Self {
        let fd = unsafe { libc::inotify_init1(libc::IN_CLOEXEC) };
        if fd < 0 {
            return Self { inner: None };
        }
        let inner = Arc::new(Inner {
            fd: unsafe { OwnedFd::from_raw_fd(fd) },
            current: Mutex::new(None),
        });
        let reader = inner.clone();
        thread::spawn(move || reader.run(&events));
        Self { inner: Some(inner) }
    }

    pub fn watch(&self, path: String) -> Result<(), String> {
        let Some(inner) = &self.inner else {
            return Ok(());
        };
        let mut current = inner.current.lock();
        if current.as_ref().is_some_and(|watch| watch.path == path) {
            return Ok(());
        }
        if let Some(previous) = current.take() {
            unsafe { libc::inotify_rm_watch(inner.fd.as_raw_fd(), previous.descriptor) };
        }
        let target = CString::new(Path::new(&path).as_os_str().as_bytes())
            .map_err(|error| error.to_string())?;
        let descriptor =
            unsafe { libc::inotify_add_watch(inner.fd.as_raw_fd(), target.as_ptr(), WATCH_MASK) };
        if descriptor < 0 {
            return Err(io::Error::last_os_error().to_string());
        }
        *current = Some(Watch { descriptor, path });
        Ok(())
    }
}

impl Inner {
    fn run(&self, events: &Events) {
        let mut buffer = [0_u8; 16 * 1024];
        let mut pending_since: Option<Instant> = None;
        let mut poll = libc::pollfd {
            fd: self.fd.as_raw_fd(),
            events: libc::POLLIN,
            revents: 0,
        };
        loop {
            let timeout = if pending_since.is_some() {
                QUIET_PERIOD_MS
            } else {
                -1
            };
            let ready = unsafe { libc::poll(&mut poll, 1, timeout) };
            if ready < 0 {
                if io::Error::last_os_error().kind() == io::ErrorKind::Interrupted {
                    continue;
                }
                return;
            }
            if ready > 0 {
                let read = unsafe {
                    libc::read(
                        self.fd.as_raw_fd(),
                        buffer.as_mut_ptr().cast(),
                        buffer.len(),
                    )
                };
                if read <= 0 {
                    return;
                }
                if self.touches_current(&buffer[..read as usize]) {
                    pending_since.get_or_insert_with(Instant::now);
                }
            }
            let quiet = ready == 0;
            if let Some(since) = pending_since
                && (quiet || since.elapsed() >= MAX_LATENCY)
            {
                pending_since = None;
                if let Some(watch) = self.current.lock().as_ref() {
                    events.emit(DIRECTORY_CHANGED, DirectoryChanged { path: &watch.path });
                }
            }
        }
    }

    fn touches_current(&self, bytes: &[u8]) -> bool {
        let Some(descriptor) = self.current.lock().as_ref().map(|watch| watch.descriptor) else {
            return false;
        };
        let header = std::mem::size_of::<libc::inotify_event>();
        let mut offset = 0;
        while offset + header <= bytes.len() {
            let event: libc::inotify_event =
                unsafe { std::ptr::read_unaligned(bytes[offset..].as_ptr().cast()) };
            if event.wd == descriptor {
                return true;
            }
            offset += header + event.len as usize;
        }
        false
    }
}
