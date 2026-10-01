use std::fs::{File, OpenOptions};
use std::io;
use std::os::fd::{AsFd, AsRawFd, BorrowedFd};
use std::os::unix::fs::OpenOptionsExt;
use std::path::{Path, PathBuf};

use drm::control::{Device as ControlDevice, framebuffer};
use drm::{ClientCapability, Device};

const DRM_IOCTL_MODE_CLOSEFB: libc::c_ulong = 0xC008_64D0;

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

    pub fn is_boot_display(&self) -> bool {
        let Some(name) = self.path.file_name() else {
            return false;
        };
        let device = Path::new("/sys/class/drm").join(name).join("device");
        std::fs::read_to_string(device.join("boot_vga")).is_ok_and(|value| value.trim() == "1")
            || std::fs::read_link(device.join("driver"))
                .is_ok_and(|driver| driver.ends_with("simple-framebuffer"))
    }
}
