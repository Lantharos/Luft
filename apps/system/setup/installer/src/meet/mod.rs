pub mod start;
pub mod unpack;

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_i18n::t;
use luft_installer_contract::MovingBox;
use luft_meet::handoff::{self, Handoff};
use luft_meet::moving_box::{self, Manifest};

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

pub struct Opened {
    at: PathBuf,
}

impl Opened {
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

    pub fn root(&self) -> &Path {
        &self.at
    }

    pub fn manifest(&self) -> Result<Manifest> {
        let text = std::fs::read_to_string(self.at.join(moving_box::MANIFEST))
            .with_context(|| t!(L10N, "installer-box-no-list"))?;
        Manifest::parse(&text).map_err(anyhow::Error::msg)
    }
}

impl Drop for Opened {
    fn drop(&mut self) {
        if let Err(error) = Tool::new("umount").arg(&self.at).run() {
            eprintln!("The moving box couldn't be closed: {error:#}");
        }
    }
}

pub fn packed(handoff: &Handoff, scratch: &Path) -> Option<MovingBox> {
    let manifest = handoff.moving_box().and_then(|guid| {
        Opened::mount(guid, scratch)
            .and_then(|opened| opened.manifest())
            .inspect_err(|error| eprintln!("The moving box couldn't be read: {error:#}"))
            .ok()
    })?;
    Some(MovingBox {
        bytes: manifest.bytes(),
        full_name: manifest
            .account
            .as_ref()
            .map(|account| account.full_name.clone()),
        user_name: manifest
            .account
            .as_ref()
            .map(|account| account.user_name.clone()),
    })
}
