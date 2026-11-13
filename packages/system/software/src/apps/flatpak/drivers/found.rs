use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

use super::rule::{Condition, Point, Ref, driver_name};

const NVIDIA_VERSION: &str = "/sys/module/nvidia/version";
const EXTENSION: &str = "Extension ";

/// The NVIDIA driver running, named the way Flatpak names it, from the same places Flatpak
/// reads: `FLATPAK_GL_DRIVERS` when it's set, the loaded kernel module otherwise.
pub fn running_driver() -> Option<String> {
    match std::env::var("FLATPAK_GL_DRIVERS") {
        Ok(drivers) if !drivers.is_empty() => drivers
            .split(':')
            .find(|driver| driver.starts_with("nvidia-"))
            .map(str::to_owned),
        _ => fs::read_to_string(NVIDIA_VERSION)
            .ok()
            .map(|version| driver_name(&version)),
    }
}

/// The apps and runtimes in an installation, read from its folders, and the extension points
/// their metadata declares.
pub struct Contents {
    pub runtimes: BTreeSet<Ref>,
    pub points: Vec<Point>,
}

fn entries(folder: &Path) -> impl Iterator<Item = (String, PathBuf)> {
    fs::read_dir(folder)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| Some((entry.file_name().into_string().ok()?, entry.path())))
}

fn deployed(installation: &Path, kind: &str) -> Vec<(Ref, PathBuf)> {
    let mut found = Vec::new();
    for (id, named) in entries(&installation.join(kind)) {
        for (arch, built) in entries(&named) {
            for (branch, folder) in entries(&built) {
                let metadata = folder.join("active/metadata");
                if metadata.is_file() {
                    let reference = Ref {
                        id: id.clone(),
                        arch: arch.clone(),
                        branch,
                    };
                    found.push((reference, metadata));
                }
            }
        }
    }
    found
}

fn points(owner: &Ref, metadata: &str) -> Vec<Point> {
    let mut points = Vec::new();
    let mut current: Option<Point> = None;
    let mut version = None;
    let finish = |point: Option<Point>, version: Option<String>, points: &mut Vec<Point>| {
        if let Some(mut point) = point {
            if point.branches.is_empty() {
                point.branches = vec![version.unwrap_or_else(|| owner.branch.clone())];
            }
            points.push(point);
        }
    };
    for line in metadata.lines().map(str::trim) {
        if let Some(group) = line
            .strip_prefix('[')
            .and_then(|line| line.strip_suffix(']'))
        {
            finish(current.take(), version.take(), &mut points);
            current = group.strip_prefix(EXTENSION).map(|name| Point {
                owner: owner.clone(),
                name: name.trim().to_owned(),
                branches: Vec::new(),
                download_if: None,
                prune_unless: None,
            });
            continue;
        }
        let (Some(point), Some((key, value))) = (current.as_mut(), line.split_once('=')) else {
            continue;
        };
        let value = value.trim();
        let condition = || value.split(';').find_map(Condition::named);
        match key.trim() {
            "versions" => {
                point.branches = value
                    .split(';')
                    .filter(|branch| !branch.is_empty())
                    .map(str::to_owned)
                    .collect();
            }
            "version" => version = Some(value.to_owned()),
            "download-if" => point.download_if = condition(),
            "autoprune-unless" => point.prune_unless = condition(),
            _ => {}
        }
    }
    finish(current, version, &mut points);
    points
}

impl Contents {
    pub fn read(installation: &Path) -> Self {
        let apps = deployed(installation, "app");
        let runtimes = deployed(installation, "runtime");
        let points = apps
            .iter()
            .chain(&runtimes)
            .flat_map(|(owner, metadata)| {
                points(owner, &fs::read_to_string(metadata).unwrap_or_default())
            })
            .filter(|point| point.download_if.is_some() || point.prune_unless.is_some())
            .collect();
        Self {
            runtimes: runtimes.into_iter().map(|(runtime, _)| runtime).collect(),
            points,
        }
    }
}
