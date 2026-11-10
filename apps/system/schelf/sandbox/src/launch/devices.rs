use std::ffi::CString;
use std::fs;
use std::os::fd::{AsFd, AsRawFd, BorrowedFd, FromRawFd, OwnedFd};
use std::os::unix::ffi::OsStrExt;
use std::path::{Path, PathBuf};

use crate::app::{Device, Grants};

const DEVICES: &str = "/dev";
const USB: &str = "/dev/bus/usb";
const HID: &str = "hidraw";
const SERIAL: [&str; 2] = ["ttyUSB", "ttyACM"];
const CAMERA: &str = "video";
const EVENT_HEADER: usize = size_of::<libc::inotify_event>();

/// Stand-ins for the USB, HID and serial devices and the cameras the app
/// wasn't given: empty files where the devices would be, which tell the
/// launcher when the app opens one.
pub struct Decoys {
    pub binds: Vec<(PathBuf, PathBuf)>,
    pub devices: Vec<PathBuf>,
    watch: OwnedFd,
    cameras: Option<i32>,
}

/// What the app opened stand-ins of since it was last asked.
#[derive(Default)]
pub struct Opened {
    pub device: bool,
    pub camera: bool,
}

fn named(prefix: &str) -> Vec<PathBuf> {
    let Ok(entries) = fs::read_dir(DEVICES) else {
        return Vec::new();
    };
    let mut found: Vec<PathBuf> = entries
        .flatten()
        .filter(|entry| entry.file_name().to_string_lossy().starts_with(prefix))
        .map(|entry| entry.path())
        .collect();
    found.sort();
    found
}

fn usb_devices() -> Vec<PathBuf> {
    fs::read_dir(USB)
        .into_iter()
        .flatten()
        .flatten()
        .flat_map(|bus| fs::read_dir(bus.path()).into_iter().flatten().flatten())
        .map(|device| device.path())
        .collect()
}

fn watch(watch: &OwnedFd, folder: &Path) -> Result<i32, String> {
    let path = CString::new(folder.as_os_str().as_bytes()).map_err(|error| error.to_string())?;
    let added = unsafe { libc::inotify_add_watch(watch.as_raw_fd(), path.as_ptr(), libc::IN_OPEN) };
    if added < 0 {
        return Err(std::io::Error::last_os_error().to_string());
    }
    Ok(added)
}

fn stand_in(path: &Path) -> Result<(), String> {
    if let Some(folder) = path.parent() {
        fs::create_dir_all(folder).map_err(|error| error.to_string())?;
    }
    fs::write(path, []).map_err(|error| error.to_string())
}

impl Decoys {
    pub fn plant(root: &Path, grants: &Grants) -> Result<Self, String> {
        let fd = unsafe { libc::inotify_init1(libc::IN_NONBLOCK | libc::IN_CLOEXEC) };
        if fd < 0 {
            return Err(std::io::Error::last_os_error().to_string());
        }
        let mut decoys = Self {
            binds: Vec::new(),
            devices: Vec::new(),
            watch: unsafe { OwnedFd::from_raw_fd(fd) },
            cameras: None,
        };
        let mut nodes = Vec::new();
        if grants.has(Device::Usb) {
            decoys.devices.push(PathBuf::from(USB));
            decoys.devices.extend(named(HID));
        } else {
            let usb = root.join("usb");
            for device in usb_devices() {
                let relative = device
                    .strip_prefix(USB)
                    .map_err(|error| error.to_string())?;
                stand_in(&usb.join(relative))?;
            }
            if usb.exists() {
                for bus in fs::read_dir(&usb)
                    .map_err(|error| error.to_string())?
                    .flatten()
                {
                    watch(&decoys.watch, &bus.path())?;
                }
                decoys.binds.push((usb, PathBuf::from(USB)));
            }
            nodes.extend(named(HID));
        }
        let serial: Vec<PathBuf> = SERIAL.iter().flat_map(|prefix| named(prefix)).collect();
        if grants.has(Device::Serial) {
            decoys.devices.extend(serial);
        } else {
            nodes.extend(serial);
        }
        decoys.stand_in_for(&root.join("nodes"), nodes)?;
        let cameras = named(CAMERA);
        if grants.camera {
            decoys.devices.extend(cameras);
        } else {
            decoys.cameras = decoys.stand_in_for(&root.join("cameras"), cameras)?;
        }
        Ok(decoys)
    }

    /// Puts watched stand-ins for `nodes` in `folder`, and returns what the
    /// watch reports them as.
    fn stand_in_for(&mut self, folder: &Path, nodes: Vec<PathBuf>) -> Result<Option<i32>, String> {
        if nodes.is_empty() {
            return Ok(None);
        }
        fs::create_dir_all(folder).map_err(|error| error.to_string())?;
        let watched = watch(&self.watch, folder)?;
        for node in nodes {
            let decoy = folder.join(node.file_name().unwrap_or_default());
            stand_in(&decoy)?;
            self.binds.push((decoy, node));
        }
        Ok(Some(watched))
    }

    pub fn watch_fd(&self) -> BorrowedFd<'_> {
        self.watch.as_fd()
    }

    /// What the app opened stand-ins of since the last call.
    pub fn opened(&self) -> Opened {
        let mut buffer = [0u8; 4096];
        let mut opened = Opened::default();
        loop {
            let read = unsafe {
                libc::read(
                    self.watch.as_raw_fd(),
                    buffer.as_mut_ptr().cast(),
                    buffer.len(),
                )
            };
            let Ok(read) = usize::try_from(read) else {
                return opened;
            };
            if read == 0 {
                return opened;
            }
            for (watched, mask) in events(&buffer[..read]) {
                if mask & libc::IN_ISDIR != 0 {
                    continue;
                }
                if Some(watched) == self.cameras {
                    opened.camera = true;
                } else {
                    opened.device = true;
                }
            }
        }
    }
}

fn events(mut buffer: &[u8]) -> impl Iterator<Item = (i32, u32)> {
    std::iter::from_fn(move || {
        let header = buffer.get(..EVENT_HEADER)?;
        let watched = i32::from_ne_bytes(header[0..4].try_into().ok()?);
        let mask = u32::from_ne_bytes(header[4..8].try_into().ok()?);
        let name = u32::from_ne_bytes(header[12..16].try_into().ok()?) as usize;
        buffer = buffer.get(EVENT_HEADER + name..)?;
        Some((watched, mask))
    })
}
