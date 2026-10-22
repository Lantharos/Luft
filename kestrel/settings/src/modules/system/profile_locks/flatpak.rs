use std::fs;
use std::path::{Path, PathBuf};

const CHILD_PID: &str = "\"child-pid\":";

pub fn process_roots(app: &str) -> Vec<PathBuf> {
    let instances = glib::user_runtime_dir().join(".flatpak");
    fs::read_dir(instances)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.path())
        .filter(|instance| runs(instance, app))
        .filter_map(|instance| child_pid(&instance))
        .map(|pid| PathBuf::from(format!("/proc/{pid}/root/proc")))
        .filter(|root| root.is_dir())
        .collect()
}

fn runs(instance: &Path, app: &str) -> bool {
    let info = glib::KeyFile::new();
    info.load_from_file(instance.join("info"), glib::KeyFileFlags::NONE)
        .is_ok()
        && info
            .string("Application", "name")
            .is_ok_and(|name| name == app)
}

fn child_pid(instance: &Path) -> Option<u32> {
    let bwrap = fs::read_to_string(instance.join("bwrapinfo.json")).ok()?;
    let (_, after) = bwrap.split_once(CHILD_PID)?;
    let digits = after.trim_start();
    let end = digits
        .find(|character: char| !character.is_ascii_digit())
        .unwrap_or(digits.len());
    digits[..end].parse().ok()
}
