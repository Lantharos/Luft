use std::path::Path;

use anyhow::{Result, ensure};

use crate::paths;
use crate::system::uuid;

const DECRYPTING: &str = "/etc/trustd/decrypting";
const DECRYPTING_SYSTEM: &str = "/run/trustd/decrypting";
const DECRYPTED: &str = "/run/trustd/decrypted";

fn write(folder: &str, partuuid: &str, luks_uuid: &str) -> Result<()> {
    ensure!(
        uuid::is_partuuid(partuuid) && uuid::is_uuid(luks_uuid),
        "A disk can only be hidden by its plain IDs"
    );
    std::fs::create_dir_all(folder)?;
    paths::write_private(&Path::new(folder).join(partuuid), luks_uuid.as_bytes())?;
    Ok(())
}

fn remove(folder: &str, partuuid: &str) {
    let _ = std::fs::remove_file(Path::new(folder).join(partuuid));
    let _ = std::fs::remove_dir(folder);
}

pub fn mask(partuuid: &str, uuid: &str) -> Result<()> {
    write(DECRYPTING, partuuid, uuid)
}

pub fn mask_system_disk(partuuid: &str, uuid: &str) -> Result<()> {
    write(DECRYPTING_SYSTEM, partuuid, uuid)
}

pub fn mask_until_restart(partuuid: &str, uuid: &str) -> Result<()> {
    write(DECRYPTED, partuuid, uuid)?;
    remove(DECRYPTING, partuuid);
    remove(DECRYPTING_SYSTEM, partuuid);
    Ok(())
}

pub fn unmask(partuuid: &str) {
    remove(DECRYPTING, partuuid);
    remove(DECRYPTED, partuuid);
}
