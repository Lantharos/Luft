use std::path::Path;

use anyhow::{Context, Result};
use luft_i18n::t;
use luft_installer_contract::Encryption;

use super::layout::Role;
use crate::L10N;
use crate::system::command::Tool;

pub struct Opened {
    pub partition: String,
    pub device: String,
    pub uuid: String,
}

fn trustctl(action: &str, partition: &str) -> Tool {
    Tool::new("trustctl").args(["encryption", action, partition])
}

fn uuid_of(device: &str) -> Result<String> {
    Ok(Tool::new("blkid")
        .args(["--output", "value", "--match-tag", "UUID"])
        .arg(device)
        .output()?
        .trim()
        .to_owned())
}

pub fn open(encryption: &Encryption, partition: &str) -> Result<Opened> {
    let given = format!("{}\n{}\n", encryption.recovery_key, encryption.passphrase);
    let device = trustctl("format", partition)
        .input(given.as_bytes())
        .output()
        .with_context(|| t!(L10N, "installer-encryption-failed"))?
        .trim()
        .to_owned();
    let mut opened = Opened {
        partition: partition.to_owned(),
        uuid: String::new(),
        device,
    };
    let (_, label) = Role::Root.filesystem();
    Tool::new("mkfs.btrfs")
        .args(["--force", "--label", label])
        .arg(&opened.device)
        .run()
        .with_context(|| t!(L10N, "installer-root-partition-failed"))?;
    opened.uuid = uuid_of(&opened.device)?;
    Ok(opened)
}

pub fn seal(encryption: &Encryption, opened: &Opened, state: &Path) -> Result<()> {
    trustctl("seal", &opened.partition)
        .arg("--state")
        .arg(state)
        .input(format!("{}\n", encryption.recovery_key).as_bytes())
        .run()
        .with_context(|| t!(L10N, "installer-encryption-failed"))
}

impl Drop for Opened {
    fn drop(&mut self) {
        if let Err(error) = Tool::new("cryptsetup").arg("close").arg(&self.device).run() {
            eprintln!("The encrypted disk couldn't be closed: {error:#}");
        }
    }
}
