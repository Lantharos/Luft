//! Probe and acquire the best available display backend.

use std::fs;
use std::path::Path;

use relay_display::{DisplayError, DisplayManager};
use relay_display_drm::DrmBackend;
use relay_display_fb::FbdevBackend;

pub fn probe_and_acquire() -> Result<DisplayManager, DisplayError> {
    ensure_fb_device_nodes();
    if let Ok(entries) = fs::read_dir("/dev") {
        let mut names: Vec<_> = entries
            .flatten()
            .filter_map(|e| e.file_name().into_string().ok())
            .filter(|n| n.starts_with("fb") || n.starts_with("card") || n == "dri")
            .collect();
        names.sort();
        eprintln!("relayd: display-related /dev nodes: {names:?}");
    }
    // Prefer fbdev during early initramfs: writes directly to the scanout buffer.
    for path in ["/dev/fb0", "/dev/fb1"] {
        if !Path::new(path).exists() {
            let sysfs = format!("/sys/class/graphics/{}", path.trim_start_matches("/dev/"));
            eprintln!("relayd: {path} missing (sysfs exists={})", Path::new(&sysfs).exists());
            continue;
        }
        match FbdevBackend::open(path) {
            Ok(backend) => {
                eprintln!("relayd: using framebuffer {path}");
                return Ok(DisplayManager::from_backend(Box::new(backend)));
            }
            Err(err) => eprintln!("relayd: framebuffer {path} unavailable: {err:#}"),
        }
    }

    // DRM last: in QEMU/VGA setups fbdev maps straight to the visible scanout buffer.
    if let Ok(backend) = DrmBackend::probe() {
        eprintln!("relayd: using DRM backend (fallback)");
        return Ok(DisplayManager::from_backend(Box::new(backend)));
    }

    Err(DisplayError::NoBackend)
}

fn ensure_fb_device_nodes() {
    let Ok(entries) = fs::read_dir("/sys/class/graphics") else {
        return;
    };
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().into_owned();
        if !name.starts_with("fb") {
            continue;
        }
        let dev_path = format!("/dev/{name}");
        if Path::new(&dev_path).exists() {
            continue;
        }
        let sysfs_dev = entry.path().join("dev");
        let Ok(contents) = fs::read_to_string(&sysfs_dev) else {
            continue;
        };
        let Some((major, minor)) = contents.trim().split_once(':') else {
            continue;
        };
        let Ok(major) = major.trim().parse::<u32>() else {
            continue;
        };
        let Ok(minor) = minor.trim().parse::<u32>() else {
            continue;
        };
        let dev = libc::makedev(major, minor);
        let cpath = std::ffi::CString::new(dev_path.as_str()).unwrap();
        unsafe {
            let _ = libc::mknod(cpath.as_ptr(), libc::S_IFCHR | 0o666, dev);
        }
    }
}