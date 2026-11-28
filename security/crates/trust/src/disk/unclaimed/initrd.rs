use anyhow::Result;

use super::temporary;
use crate::disk::ROOT_PARTITION;
use crate::disk::unlock::luks;

pub fn open_in_initrd() -> Result<()> {
    let partition = std::fs::canonicalize(ROOT_PARTITION)?;
    let Some(key) = luks::read(&partition, None, 0)?
        .as_ref()
        .and_then(temporary::carried)
    else {
        return Ok(());
    };
    luks::attach_root(&partition, &key)
}
