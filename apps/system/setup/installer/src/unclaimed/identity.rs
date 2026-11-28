use std::io::ErrorKind;
use std::path::Path;

use anyhow::Result;

use crate::system::mount::Mounted;

const MACHINE_ID: &str = "etc/machine-id";
const HOST_KEYS: &str = "/etc/ssh";
const HOST_KEY: &str = "ssh_host_";
const SECRETS: [&str; 2] = [
    "/var/lib/systemd/random-seed",
    "/var/lib/systemd/credential.secret",
];
const JOURNALS: &str = "/var/log/journal";

fn remove(path: &Path) -> Result<()> {
    match std::fs::remove_file(path) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.into()),
        _ => Ok(()),
    }
}

fn reset_machine_id(scratch: &Path) -> Result<()> {
    let image = Mounted::new("/", "bind", &scratch.join("image"))?;
    let ours = Path::new("/").join(MACHINE_ID);
    match std::fs::read(image.path().join(MACHINE_ID)) {
        Ok(shipped) => Ok(std::fs::write(ours, shipped)?),
        Err(_) => remove(&ours),
    }
}

/// Makes the next start the first one this computer has had, so a drive
/// copied onto other computers gives each its own identity.
pub fn forget(scratch: &Path) -> Result<()> {
    reset_machine_id(scratch)?;
    for entry in std::fs::read_dir(HOST_KEYS).into_iter().flatten().flatten() {
        if entry.file_name().to_string_lossy().starts_with(HOST_KEY) {
            remove(&entry.path())?;
        }
    }
    for secret in SECRETS {
        remove(Path::new(secret))?;
    }
    for journal in std::fs::read_dir(JOURNALS).into_iter().flatten().flatten() {
        std::fs::remove_dir_all(journal.path())?;
    }
    Ok(())
}
