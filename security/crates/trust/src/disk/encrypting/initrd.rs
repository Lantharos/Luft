use std::path::Path;

use anyhow::{Context, Result};

use super::request::{self, Request};
use crate::disk::ROOT_PARTITION;
use crate::disk::layout::TopLevel;
use crate::disk::unlock::luks;
use crate::drives::work;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::keyring;
use crate::system::secrets::secret::Secret;

fn start(partition: &Path, key: &Secret) -> Result<()> {
    Tool::new("cryptsetup")
        .args([
            "reencrypt",
            "--encrypt",
            "--init-only",
            "--batch-mode",
            "--type",
            "luks2",
            "--reduce-device-size",
            "32M",
            "--key-file",
            "-",
        ])
        .arg(partition)
        .input(key)
        .status()
        .context("Encrypting Luft's partition couldn't start")
}

fn start_encrypting(partition: &Path) -> Result<()> {
    let name = blocks::kernel_name(partition).context("Luft's partition has no name")?;
    let asked = Request::waiting_in(TopLevel::mount_from(partition, true)?.path())
        .filter(|request| blocks::partuuid(&name).as_deref() == Some(request.partition.as_str()));
    let Some(request) = asked else {
        return Ok(());
    };
    let Some(keys) = request.open_at_start()? else {
        eprintln!("Luft starts without being encrypted this time");
        return Ok(());
    };
    start(partition, keys.first())?;
    luks::attach_root(partition, keys.first())?;
    keys.keep_in_memory();
    Ok(())
}

pub fn open_in_initrd() -> Result<()> {
    let partition = std::fs::canonicalize(ROOT_PARTITION)?;
    match luks::read(&partition, None, work::size_of(&partition))? {
        None => start_encrypting(&partition),
        Some(header) if header.reencrypting.is_some() => match request::sealed_key() {
            Some(key) => {
                luks::attach_root(&partition, &key)?;
                keyring::keep_for_trust_units(request::FIRST_KEY, &key);
                Ok(())
            }
            None => Ok(()),
        },
        Some(_) => Ok(()),
    }
}
