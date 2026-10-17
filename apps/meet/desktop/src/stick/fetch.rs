use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

use super::Image;
use crate::live::cache;
use crate::live::download::{self, format_checksum};
use crate::live::source::Source;
use luft_variant::Variant;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Edition {
    Universal,
    ThisComputer,
}

impl Edition {
    fn variant(self, variant: Variant) -> Option<Variant> {
        match self {
            Self::Universal => None,
            Self::ThisComputer => Some(variant),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Offer {
    pub edition: Edition,
    pub name: String,
    pub size: u64,
    pub kept: bool,
}

fn name_of(path: &Path) -> String {
    path.file_name()
        .map_or_else(|| path.to_string_lossy(), |name| name.to_string_lossy())
        .into_owned()
}

pub fn offers(source: &Source, variant: Variant) -> Result<Vec<Offer>, String> {
    let channel = match source {
        Source::Download { channel } => *channel,
        Source::File { path } => {
            let size = fs::metadata(path)
                .map_err(|error| format!("{} can't be read: {error}", path.display()))?
                .len();
            return Ok(vec![Offer {
                edition: Edition::Universal,
                name: name_of(path),
                size,
                kept: true,
            }]);
        }
    };
    let agent = download::agent();
    let mut found = Vec::new();
    for edition in [Edition::Universal, Edition::ThisComputer] {
        let url = download::published(channel, edition.variant(variant));
        let Some(checksum) = download::published_checksum(&agent, &url)
            .map_err(|error| format!("Luft can't be downloaded right now: {error}"))?
        else {
            continue;
        };
        found.push(Offer {
            edition,
            name: url.rsplit('/').next().unwrap_or_default().to_owned(),
            size: download::published_size(&agent, &url).map_err(|error| error.to_string())?,
            kept: cache::kept(&url, &checksum).is_some(),
        });
    }
    if found.is_empty() {
        return Err("Luft isn't published right now".to_owned());
    }
    Ok(found)
}

pub fn fetch(
    source: &Source,
    edition: Edition,
    variant: Variant,
    progress: impl FnMut(u64, u64),
) -> Result<Image, String> {
    let channel = match source {
        Source::Download { channel } => *channel,
        Source::File { path } => {
            let checksum = source
                .checksum(variant)
                .map_err(|error| format!("The ISO's checksum can't be read: {error}"))?;
            return Ok(Image {
                path: path.clone(),
                checksum: checksum.as_ref().map(format_checksum),
            });
        }
    };
    let url = download::published(channel, edition.variant(variant));
    let agent = download::agent();
    let checksum = download::published_checksum(&agent, &url)
        .map_err(|error| format!("Luft can't be downloaded right now: {error}"))?
        .ok_or("This Luft isn't published anymore")?;
    let path = cache::keep(&agent, &url, &checksum, progress)
        .map_err(|error| format!("Luft couldn't be downloaded: {error}"))?;
    Ok(Image {
        path,
        checksum: Some(format_checksum(&checksum)),
    })
}
