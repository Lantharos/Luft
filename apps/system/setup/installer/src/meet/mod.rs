pub mod start;
pub mod unpack;

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_i18n::t;
use luft_installer_contract::MovingBox;
use luft_meet::handoff::{self, Handoff};
use luft_meet::sealed::{self, Code, Opened, Refused};

use crate::L10N;
use crate::system::command::Tool;

const BY_PARTUUID: &str = "/dev/disk/by-partuuid";

pub fn handoff(medium: &Path) -> Option<Handoff> {
    let text = std::fs::read_to_string(medium.join(handoff::FILE)).ok()?;
    Handoff::parse(&text)
        .inspect_err(|error| eprintln!("Meet Luft's notes aren't readable: {error}"))
        .ok()
}

pub fn partition_device(guid: &str) -> PathBuf {
    Path::new(BY_PARTUUID).join(guid)
}

pub struct Mounted {
    at: PathBuf,
}

impl Mounted {
    pub fn mount(guid: &str, at: &Path) -> Result<Self> {
        std::fs::create_dir_all(at)?;
        Tool::new("mount")
            .args(["-o", "ro"])
            .arg(partition_device(guid))
            .arg(at)
            .run()
            .with_context(|| t!(L10N, "installer-box-unopened"))?;
        Ok(Self { at: at.to_owned() })
    }

    pub fn is_sealed(&self) -> bool {
        sealed::is_sealed(&self.at)
    }

    pub fn open(&self, code: &Code) -> Result<Opened> {
        Opened::open(&self.at, code).map_err(|refused| match refused {
            Refused::WrongCode => anyhow::anyhow!(t!(L10N, "installer-box-wrong-code")),
            Refused::Unsealed => anyhow::anyhow!(t!(L10N, "installer-box-unsealed")),
            Refused::Damaged(error) => {
                anyhow::Error::new(error).context(t!(L10N, "installer-box-unopened"))
            }
        })
    }
}

impl Drop for Mounted {
    fn drop(&mut self) {
        if let Err(error) = Tool::new("umount").arg(&self.at).run() {
            eprintln!("The moving box couldn't be closed: {error:#}");
        }
    }
}

/// Whether Meet Luft left a sealed moving box. A box without a seal could
/// have been filled by anyone, so it's left alone.
pub fn packed(handoff: &Handoff, scratch: &Path) -> bool {
    handoff.moving_box().is_some_and(|guid| {
        Mounted::mount(guid, scratch)
            .inspect_err(|error| eprintln!("The moving box couldn't be read: {error:#}"))
            .is_ok_and(|mounted| mounted.is_sealed())
    })
}

pub fn parse_code(code: &str) -> Result<Code> {
    Code::parse(code).with_context(|| t!(L10N, "installer-box-wrong-code"))
}

/// Opens the moving box with the code Meet Luft showed and says what's in it.
pub fn open(handoff: &Handoff, scratch: &Path, code: &Code) -> Result<MovingBox> {
    let guid = handoff
        .moving_box()
        .with_context(|| t!(L10N, "installer-box-unopened"))?;
    let manifest = Mounted::mount(guid, scratch)?.open(code)?.contents.manifest;
    Ok(MovingBox {
        bytes: manifest.bytes(),
        full_name: manifest
            .account
            .as_ref()
            .map(|account| account.full_name.clone()),
        user_name: manifest.account.map(|account| account.user_name),
    })
}
