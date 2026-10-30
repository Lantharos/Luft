use std::path::Path;

use anyhow::{Context, Result};

use super::request::{self, Request};
use crate::disk::layout::TopLevel;
use crate::disk::unlock::luks;
use crate::drives::work;
use crate::system::host::blocks;
use crate::system::host::command::Tool;
use crate::system::secrets::scratch::Scratch;
use crate::system::secrets::secret::Secret;

const ROOT_PARTITION: &str = "/dev/luft-root-partition";
const MAPPING: &str = "root";
const CRYPTSETUP: &str = "/usr/lib/systemd/systemd-cryptsetup";

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

fn open(partition: &Path, key: &Secret) -> Result<()> {
    let scratch = Scratch::empty()?;
    let key_file = scratch.write("key", key)?;
    Tool::new(CRYPTSETUP)
        .args(["attach", MAPPING])
        .arg(partition)
        .arg(&key_file)
        .arg("discard,tpm2-measure-pcr=yes")
        .status()
        .context("Luft's partition couldn't be opened while it's being encrypted")?;
    Tool::new("udevadm")
        .args(["trigger", "--action=change", "--settle"])
        .arg(partition)
        .status()
}

pub fn open_in_initrd() -> Result<()> {
    let Some(requested) = request::partition() else {
        return Ok(());
    };
    let partition = std::fs::canonicalize(ROOT_PARTITION)?;
    let name = blocks::kernel_name(&partition).context("Luft's partition has no name")?;
    if blocks::partuuid(&name).as_deref() != Some(requested.as_str()) {
        return Ok(());
    }
    match luks::read(&partition, None, work::size_of(&partition))? {
        None => {
            let key = Request::load(TopLevel::mount_from(&partition, true)?.path())?.recovery_key;
            start(&partition, &key)?;
            open(&partition, &key)
        }
        Some(header) if header.reencrypting.is_some() => match request::sealed_key() {
            Some(key) => open(&partition, &key),
            None => Ok(()),
        },
        Some(_) => Ok(()),
    }
}
