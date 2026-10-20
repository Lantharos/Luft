use std::fs;
use std::path::Path;

use luft_i18n::t;
use serde::{Deserialize, Serialize};

use super::Image;
use crate::L10N;
use crate::live::cache;
use crate::live::download::{self, Channel, Located, file_name, format_checksum};
use crate::live::source::Source;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Offer {
    pub name: String,
    pub size: u64,
    pub kept: bool,
}

fn name_of(path: &Path) -> String {
    path.file_name()
        .map_or_else(|| path.to_string_lossy(), |name| name.to_string_lossy())
        .into_owned()
}

fn newest(channel: Channel) -> Result<Located, String> {
    download::locate(&download::agent(), channel).map_err(|error| {
        t!(
            L10N,
            "stick-download-unavailable",
            error = error.to_string()
        )
    })
}

pub fn offer(source: &Source) -> Result<Offer, String> {
    match source {
        Source::Download { channel } => {
            let located = newest(*channel)?;
            Ok(Offer {
                name: file_name(&located.iso).to_owned(),
                size: located.size,
                kept: cache::kept(&located.iso, &located.checksum).is_some(),
            })
        }
        Source::File { path } => Ok(Offer {
            name: name_of(path),
            size: fs::metadata(path)
                .map_err(|error| {
                    t!(
                        L10N,
                        "stick-file-unreadable",
                        path = path.display().to_string(),
                        error = error.to_string()
                    )
                })?
                .len(),
            kept: true,
        }),
    }
}

pub fn fetch(source: &Source, progress: impl FnMut(u64, u64)) -> Result<Image, String> {
    match source {
        Source::Download { channel } => {
            let located = newest(*channel)?;
            let path = cache::keep(
                &download::agent(),
                &located.iso,
                &located.checksum,
                progress,
            )
            .map_err(|error| t!(L10N, "stick-download-failed", error = error.to_string()))?;
            Ok(Image {
                path,
                checksum: Some(format_checksum(&located.checksum)),
            })
        }
        Source::File { path } => {
            let checksum = source.checksum().map_err(|error| {
                t!(L10N, "stick-checksum-unreadable", error = error.to_string())
            })?;
            Ok(Image {
                path: path.clone(),
                checksum: checksum.as_ref().map(format_checksum),
            })
        }
    }
}
