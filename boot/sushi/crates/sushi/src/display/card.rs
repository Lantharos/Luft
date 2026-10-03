use std::fs::{File, OpenOptions};
use std::io;
use std::os::fd::{AsFd, AsRawFd, BorrowedFd};
use std::os::unix::fs::OpenOptionsExt;
use std::path::{Path, PathBuf};

use drm::control::{Device as ControlDevice, framebuffer};
use drm::{ClientCapability, Device};
use sushi_scene::Monitor;

const DRM_IOCTL_MODE_CLOSEFB: libc::c_ulong = 0xC008_64D0;
const SYSFS: &str = "/sys/class/drm";
const FIRMWARE_FRAMEBUFFER_DRIVERS: [&str; 4] =
    ["simple-framebuffer", "efidrm", "vesadrm", "ofdrm"];

#[repr(C)]
struct CloseFb {
    fb_id: u32,
    pad: u32,
}

pub struct Card {
    file: File,
    path: PathBuf,
}

impl AsFd for Card {
    fn as_fd(&self) -> BorrowedFd<'_> {
        self.file.as_fd()
    }
}

impl Device for Card {}
impl ControlDevice for Card {}

impl Card {
    pub fn open(path: &Path) -> io::Result<Self> {
        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .custom_flags(libc::O_CLOEXEC)
            .open(path)?;
        let card = Self {
            file,
            path: path.to_owned(),
        };
        card.set_client_capability(ClientCapability::UniversalPlanes, true)?;
        Ok(card)
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    pub fn close_framebuffer(&self, fb: framebuffer::Handle) {
        let mut request = CloseFb {
            fb_id: fb.into(),
            pad: 0,
        };
        unsafe { libc::ioctl(self.file.as_raw_fd(), DRM_IOCTL_MODE_CLOSEFB, &mut request) };
    }

    fn name(&self) -> &str {
        self.path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_default()
    }

    fn device(&self) -> PathBuf {
        Path::new(SYSFS).join(self.name()).join("device")
    }

    pub fn driver(&self) -> Option<String> {
        std::fs::read_link(self.device().join("driver"))
            .ok()?
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
    }

    pub fn is_firmware_framebuffer(&self) -> bool {
        self.driver()
            .is_some_and(|driver| FIRMWARE_FRAMEBUFFER_DRIVERS.contains(&driver.as_str()))
    }

    pub fn is_boot_display(&self) -> bool {
        std::fs::read_to_string(self.device().join("boot_vga"))
            .is_ok_and(|value| value.trim() == "1")
            || self.is_firmware_framebuffer()
    }

    pub fn monitor(&self) -> Option<Monitor> {
        let prefix = format!("{}-", self.name());
        std::fs::read_dir(SYSFS)
            .ok()?
            .flatten()
            .filter(|entry| entry.file_name().to_string_lossy().starts_with(&prefix))
            .map(|entry| entry.path())
            .filter(|connector| {
                std::fs::read_to_string(connector.join("status"))
                    .is_ok_and(|status| status.trim() == "connected")
            })
            .find_map(|connector| Monitor::from_edid(&std::fs::read(connector.join("edid")).ok()?))
    }
}
