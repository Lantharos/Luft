use std::collections::HashMap;
use std::ffi::CString;
use std::os::fd::{AsFd, AsRawFd, BorrowedFd, FromRawFd, OwnedFd, RawFd};
use std::os::unix::ffi::OsStrExt;
use std::path::Path;

const EVENT_HEADER: usize = size_of::<libc::inotify_event>();

/// Empty folders standing in for drives an app wasn't given, which tell
/// when the app opens one: only a look inside, never a glance at the folder
/// that holds them, counts.
pub struct Trips<T> {
    watch: OwnedFd,
    planted: HashMap<i32, T>,
}

impl<T: Clone> Trips<T> {
    pub fn new() -> Result<Self, String> {
        let fd = unsafe { libc::inotify_init1(libc::IN_NONBLOCK | libc::IN_CLOEXEC) };
        if fd < 0 {
            return Err(std::io::Error::last_os_error().to_string());
        }
        Ok(Self {
            watch: unsafe { OwnedFd::from_raw_fd(fd) },
            planted: HashMap::new(),
        })
    }

    fn add(&mut self, path: &[u8], flags: u32, what: T) -> Result<(), String> {
        let path = CString::new(path).map_err(|error| error.to_string())?;
        let watched = unsafe {
            libc::inotify_add_watch(
                self.watch.as_raw_fd(),
                path.as_ptr(),
                libc::IN_OPEN | libc::IN_ONLYDIR | flags,
            )
        };
        if watched < 0 {
            return Err(std::io::Error::last_os_error().to_string());
        }
        self.planted.insert(watched, what);
        Ok(())
    }

    /// Watches the folder at `path` for the app opening it.
    pub fn watch(&mut self, path: &Path, what: T) -> Result<(), String> {
        self.add(path.as_os_str().as_bytes(), libc::IN_DONT_FOLLOW, what)
    }

    /// Watches a folder already opened, wherever it is.
    pub fn watch_opened(&mut self, folder: BorrowedFd<'_>, what: T) -> Result<(), String> {
        let path = format!("/proc/self/fd/{}", folder.as_raw_fd());
        self.add(path.as_bytes(), 0, what)
    }

    pub fn fd(&self) -> BorrowedFd<'_> {
        self.watch.as_fd()
    }

    /// Stops watching what `gone` says is gone.
    pub fn forget(&mut self, gone: impl Fn(&T) -> bool) {
        let watch = self.watch.as_raw_fd();
        self.planted.retain(|watched, what| {
            let keep = !gone(what);
            if !keep {
                unsafe { libc::inotify_rm_watch(watch, *watched) };
            }
            keep
        });
    }

    /// The stand-ins opened since the last call, each once.
    pub fn tripped(&self) -> Vec<T> {
        let mut buffer = [0u8; 4096];
        let mut opened: Vec<i32> = Vec::new();
        loop {
            let read = unsafe {
                libc::read(
                    self.watch.as_raw_fd(),
                    buffer.as_mut_ptr().cast(),
                    buffer.len(),
                )
            };
            let Ok(read) = usize::try_from(read) else {
                break;
            };
            if read == 0 {
                break;
            }
            for (watched, mask) in events(&buffer[..read]) {
                if mask & libc::IN_OPEN != 0 && !opened.contains(&watched) {
                    opened.push(watched);
                }
            }
        }
        opened
            .into_iter()
            .filter_map(|watched| self.planted.get(&watched).cloned())
            .collect()
    }
}

impl<T> AsRawFd for Trips<T> {
    fn as_raw_fd(&self) -> RawFd {
        self.watch.as_raw_fd()
    }
}

/// The watch and event mask of each inotify event in `buffer`.
pub fn events(mut buffer: &[u8]) -> impl Iterator<Item = (i32, u32)> {
    std::iter::from_fn(move || {
        let header = buffer.get(..EVENT_HEADER)?;
        let watched = i32::from_ne_bytes(header[0..4].try_into().ok()?);
        let mask = u32::from_ne_bytes(header[4..8].try_into().ok()?);
        let name = u32::from_ne_bytes(header[12..16].try_into().ok()?) as usize;
        buffer = buffer.get(EVENT_HEADER + name..)?;
        Some((watched, mask))
    })
}
