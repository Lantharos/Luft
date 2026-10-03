use std::fs::File;
use std::path::{Path, PathBuf};

use rustix::fs::{FlockOperation, flock};

use crate::paths;

use super::kernels::Kernel;

const PREFIX: &str = "modules-";
const AKMODS_LOCK: &str = "/run/akmods/akmods.lock";

fn record(version: &str) -> PathBuf {
    paths::state(&format!("{PREFIX}{version}"))
}

/// Remembers which added modules a kernel's signed initramfs was built with.
pub fn remember(version: &str, modules: &str) {
    if let Err(error) = paths::write_private(&record(version), modules.as_bytes()) {
        eprintln!("Couldn't remember the modules of Linux {version}: {error}");
    }
}

pub fn changed(kernel: &Kernel) -> bool {
    std::fs::read_to_string(record(&kernel.version))
        .is_ok_and(|built| built != kernel.added_modules())
}

pub fn forget_except(kept: &[Kernel]) {
    for entry in std::fs::read_dir(paths::STATE)
        .into_iter()
        .flatten()
        .flatten()
    {
        let name = entry.file_name().to_string_lossy().into_owned();
        let Some(version) = name.strip_prefix(PREFIX) else {
            continue;
        };
        if !kept.iter().any(|kernel| kernel.version == version) {
            let _ = std::fs::remove_file(entry.path());
        }
    }
}

pub struct AkmodsBusy;

/// Keeps akmods from building and installing modules until dropped, waiting for it to finish first if asked to.
pub fn hold_akmods(wait: bool) -> Result<Option<File>, AkmodsBusy> {
    let lock = Path::new(AKMODS_LOCK);
    if !lock.parent().is_some_and(Path::exists) {
        return Ok(None);
    }
    let Ok(file) = File::options()
        .create(true)
        .truncate(false)
        .write(true)
        .open(lock)
    else {
        return Ok(None);
    };
    let operation = if wait {
        FlockOperation::LockShared
    } else {
        FlockOperation::NonBlockingLockShared
    };
    flock(&file, operation).map_err(|_| AkmodsBusy)?;
    Ok(Some(file))
}
