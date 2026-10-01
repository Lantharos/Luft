use std::fs;
use std::path::{Path, PathBuf};

fn node(uniq: &str) -> Option<PathBuf> {
    let wanted = format!("HID_UNIQ={uniq}");
    fs::read_dir("/sys/class/hidraw")
        .ok()?
        .flatten()
        .find_map(|entry| {
            let uevent = fs::read_to_string(entry.path().join("device/uevent")).ok()?;
            uevent
                .lines()
                .any(|line| line == wanted)
                .then(|| Path::new("/dev").join(entry.file_name()))
        })
}

fn holds(pid: &str, node: &Path) -> bool {
    let Ok(descriptors) = fs::read_dir(format!("/proc/{pid}/fd")) else {
        return false;
    };
    descriptors
        .flatten()
        .any(|descriptor| fs::read_link(descriptor.path()).is_ok_and(|target| target == node))
}

pub fn find(uniq: &str) -> Option<u32> {
    let node = node(uniq)?;
    fs::read_dir("/proc").ok()?.flatten().find_map(|entry| {
        let name = entry.file_name();
        let pid = name.to_str()?;
        pid.parse::<u32>().ok().filter(|_| holds(pid, &node))
    })
}
