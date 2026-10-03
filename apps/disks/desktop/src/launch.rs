use std::path::{Path, PathBuf};

use serde::Serialize;

use crate::images::ChosenImage;

use crate::udisks::snapshot::{Drive, Snapshot};
use crate::udisks::volumes::{Segment, Volume};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Target {
    drive: String,
    block: Option<String>,
}

#[derive(Serialize)]
pub struct Launch {
    target: Option<Target>,
    image: Option<ChosenImage>,
    space: Option<PathBuf>,
}

const SPACE: &str = "disks-space://";

pub fn resolve(arguments: &[String], snapshot: &Snapshot) -> Launch {
    let paths: Vec<PathBuf> = arguments
        .iter()
        .filter(|argument| !argument.starts_with("--") && !argument.starts_with(SPACE))
        .filter_map(|argument| path_of(argument))
        .collect();
    Launch {
        space: arguments.iter().find_map(|argument| {
            luft_app::portal::uri_path(&format!("file://{}", argument.strip_prefix(SPACE)?))
        }),
        image: paths
            .iter()
            .find(|path| ChosenImage::is_image(path))
            .and_then(|path| ChosenImage::read(path).ok()),
        target: paths
            .iter()
            .filter(|path| !ChosenImage::is_image(path))
            .find_map(|path| locate(path, snapshot)),
    }
}

fn path_of(argument: &str) -> Option<PathBuf> {
    if argument.starts_with("file://") {
        return luft_app::portal::uri_path(argument);
    }
    argument.starts_with('/').then(|| PathBuf::from(argument))
}

fn locate(path: &Path, snapshot: &Snapshot) -> Option<Target> {
    let device = path.canonicalize().unwrap_or_else(|_| path.to_path_buf());
    let mut best: Option<(usize, Target)> = None;
    for drive in &snapshot.drives {
        if Path::new(&drive.device) == path || Path::new(&drive.device) == device {
            return Some(Target {
                drive: drive.id.clone(),
                block: None,
            });
        }
        for (outer, volume) in volumes(drive) {
            let target = || Target {
                drive: drive.id.clone(),
                block: Some(outer.block.clone()),
            };
            if Path::new(&volume.device) == path {
                return Some(target());
            }
            for point in &volume.mount_points {
                let depth = point.len();
                if path.starts_with(point)
                    && best.as_ref().is_none_or(|(longest, _)| depth > *longest)
                {
                    best = Some((depth, target()));
                }
            }
        }
    }
    best.map(|(_, target)| target)
}

fn volumes(drive: &Drive) -> impl Iterator<Item = (&Volume, &Volume)> {
    drive
        .segments
        .iter()
        .filter_map(|segment| match segment {
            Segment::Volume(volume) => Some(volume.as_ref()),
            Segment::Free { .. } => None,
        })
        .flat_map(|volume| {
            let cleartext = volume
                .encryption
                .as_ref()
                .and_then(|encryption| encryption.cleartext.as_deref());
            std::iter::once((volume, volume)).chain(cleartext.map(|inner| (volume, inner)))
        })
}
