pub mod reclaim;
pub mod unpack;

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use luft_meet::handoff::{self, Handoff, Intent};
use luft_meet::moving_box::{self, Manifest};
use serde::Serialize;

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
            .context("The moving box couldn't be opened")?;
        Ok(Self { at: at.to_owned() })
    }

    pub fn root(&self) -> &Path {
        &self.at
    }

    pub fn manifest(&self) -> Result<Manifest> {
        let text = std::fs::read_to_string(self.at.join(moving_box::MANIFEST))
            .context("The moving box has no list of what's in it")?;
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

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Packed {
    pub bytes: u64,
    pub full_name: Option<String>,
    pub user_name: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Summary {
    pub intent: Intent,
    pub room: Option<luft_meet::Room>,
    pub moving_box: Option<Packed>,
}

pub fn summarize(handoff: &Handoff, scratch: &Path) -> Summary {
    let manifest = handoff.moving_box().and_then(|guid| {
        Opened::mount(guid, scratch)
            .and_then(|opened| opened.manifest())
            .inspect_err(|error| eprintln!("The moving box couldn't be read: {error:#}"))
            .ok()
    });
    Summary {
        intent: handoff.intent,
        room: handoff.room(),
        moving_box: manifest.map(|manifest| Packed {
            bytes: manifest.bytes(),
            full_name: manifest
                .account
                .as_ref()
                .map(|account| account.full_name.clone()),
            user_name: manifest
                .account
                .as_ref()
                .map(|account| account.user_name.clone()),
        }),
    }
}
