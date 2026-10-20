pub mod copy;
pub mod drives;
pub mod fetch;
pub mod flash;
pub mod table;
pub mod ventoy;

use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::live::download::parse_checksum;
use drives::Stick;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Image {
    pub path: PathBuf,
    pub checksum: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Sticks {
    pub sticks: Vec<Stick>,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Finished {
    pub ejected: bool,
}

pub const GONE: &str = "The stick isn't there anymore. Plug it back in and choose it again.";
pub const TOO_SMALL: &str = "Luft doesn't fit on this stick. Use one of 4 GB or more.";
pub const DAMAGED: &str =
    "The ISO doesn't match its checksum. It may have been damaged on the way.";

impl Image {
    pub fn matches(&self, written: &[u8; 32]) -> Result<(), String> {
        match self.checksum.as_deref().and_then(parse_checksum) {
            Some(expected) if &expected != written => Err(DAMAGED.to_owned()),
            _ => Ok(()),
        }
    }
}

pub fn read_back_matches(written: &[u8; 32], read: &[u8; 32]) -> Result<(), String> {
    if written == read {
        Ok(())
    } else {
        Err("The stick didn't read back what was written to it. It may be worn out, so try another one.".to_owned())
    }
}
