use std::fs::File;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::thread::sleep;
use std::time::{Duration, Instant};

use luft_software::apps::appimage;

const SQUASHFUSE: &str = "squashfuse_ll";
const FUSERMOUNT: &str = "fusermount3";
const MOUNT_WAIT: Duration = Duration::from_secs(10);
const MOUNT_POLL: Duration = Duration::from_millis(10);

/// The AppImage's files, mounted read-only from outside the sandbox by a
/// program of the system, so nothing from the AppImage runs unconfined.
pub struct Image {
    path: PathBuf,
    server: Child,
}

fn device_of(path: &Path) -> Option<u64> {
    path.metadata().ok().map(|metadata| metadata.dev())
}

impl Image {
    pub fn mount(image: &Path, mount_point: &Path) -> Result<Self, String> {
        let offset =
            appimage::payload_offset(&mut File::open(image).map_err(|error| error.to_string())?)
                .ok_or("This file isn't an AppImage this computer can open.")?;
        let unmounted = device_of(mount_point);
        let mut server = Command::new(SQUASHFUSE)
            .arg("-f")
            .arg("-o")
            .arg(format!("ro,offset={offset}"))
            .arg(image)
            .arg(mount_point)
            .stdin(Stdio::null())
            .spawn()
            .map_err(|error| format!("{SQUASHFUSE}: {error}"))?;
        let started = Instant::now();
        while device_of(mount_point) == unmounted {
            if let Some(status) = server.try_wait().map_err(|error| error.to_string())? {
                return Err(format!("The AppImage couldn't be opened ({status})"));
            }
            if started.elapsed() > MOUNT_WAIT {
                let _ = server.kill();
                return Err("The AppImage took too long to open.".into());
            }
            sleep(MOUNT_POLL);
        }
        Ok(Self {
            path: mount_point.to_path_buf(),
            server,
        })
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for Image {
    fn drop(&mut self) {
        unmount_leftover(&self.path);
        let _ = self.server.wait();
    }
}

pub fn unmount_leftover(mount_point: &Path) {
    let _ = Command::new(FUSERMOUNT)
        .args(["-u", "-z", "-q"])
        .arg(mount_point)
        .stderr(Stdio::null())
        .status();
}
