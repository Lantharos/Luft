use std::path::Path;

use anyhow::Result;

use crate::paths;

const DECRYPTING: &str = "/etc/trustd/decrypting";
const DECRYPTED: &str = "/run/trustd/decrypted";

fn write(folder: &str, partuuid: &str, uuid: &str) -> Result<()> {
    std::fs::create_dir_all(folder)?;
    paths::write_private(&Path::new(folder).join(partuuid), uuid.as_bytes())?;
    Ok(())
}

fn remove(folder: &str, partuuid: &str) {
    let _ = std::fs::remove_file(Path::new(folder).join(partuuid));
    let _ = std::fs::remove_dir(folder);
}

pub fn mask(partuuid: &str, uuid: &str) -> Result<()> {
    write(DECRYPTING, partuuid, uuid)
}

pub fn mask_until_restart(partuuid: &str, uuid: &str) -> Result<()> {
    write(DECRYPTED, partuuid, uuid)?;
    remove(DECRYPTING, partuuid);
    Ok(())
}

pub fn unmask(partuuid: &str) {
    remove(DECRYPTING, partuuid);
    remove(DECRYPTED, partuuid);
}
