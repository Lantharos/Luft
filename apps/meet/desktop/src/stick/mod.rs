pub mod copy;
pub mod drives;
pub mod fetch;
pub mod flash;
pub mod table;
pub mod ventoy;

use std::path::PathBuf;

use luft_i18n::t;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::L10N;
use crate::live::download::parse_checksum;
use drives::Stick;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Image {
    pub path: PathBuf,
    pub checksum: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct Sticks {
    pub sticks: Vec<Stick>,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub struct Finished {
    pub ejected: bool,
}

pub fn gone() -> String {
    t!(L10N, "stick-gone")
}

pub fn too_small() -> String {
    t!(L10N, "stick-too-small")
}

pub fn damaged() -> String {
    t!(L10N, "stick-damaged")
}

impl Image {
    pub fn matches(&self, written: &[u8; 32]) -> Result<(), String> {
        match self.checksum.as_deref().and_then(parse_checksum) {
            Some(expected) if &expected != written => Err(damaged()),
            _ => Ok(()),
        }
    }
}

pub fn read_back_matches(written: &[u8; 32], read: &[u8; 32]) -> Result<(), String> {
    if written == read {
        Ok(())
    } else {
        Err(t!(L10N, "stick-read-back-differs"))
    }
}
