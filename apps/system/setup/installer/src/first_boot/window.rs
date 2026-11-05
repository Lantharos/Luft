use std::io::ErrorKind;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};

use anyhow::{Context, Result};

use crate::phase;
use crate::system::files::write;

const BOOTS: &str = "first-boot-boots";
const BOOT_ID: &str = "/proc/sys/kernel/random/boot_id";
const MOST_BOOTS: usize = 5;
const LONGEST: Duration = Duration::from_secs(24 * 60 * 60);

fn boots_record(state_dir: &Path) -> PathBuf {
    state_dir.join(BOOTS)
}

fn boots(state_dir: &Path) -> Vec<String> {
    std::fs::read_to_string(boots_record(state_dir))
        .unwrap_or_default()
        .lines()
        .map(str::to_owned)
        .collect()
}

pub fn count_boot(state_dir: &Path) -> Result<()> {
    let boot =
        std::fs::read_to_string(BOOT_ID).with_context(|| format!("Couldn't read {BOOT_ID}"))?;
    let boot = boot.trim();
    let mut seen = boots(state_dir);
    if seen.iter().any(|known| known == boot) {
        return Ok(());
    }
    seen.push(boot.to_owned());
    write(&boots_record(state_dir), &format!("{}\n", seen.join("\n")))
}

pub fn is_open(state_dir: &Path) -> bool {
    let Ok(installed) =
        std::fs::metadata(phase::marker(state_dir)).and_then(|marker| marker.modified())
    else {
        return false;
    };
    let elapsed = SystemTime::now()
        .duration_since(installed)
        .unwrap_or_default();
    elapsed <= LONGEST && boots(state_dir).len() <= MOST_BOOTS
}

pub fn forget(state_dir: &Path) -> Result<()> {
    match std::fs::remove_file(boots_record(state_dir)) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.into()),
        _ => Ok(()),
    }
}
