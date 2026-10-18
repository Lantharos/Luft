use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::io::Read;
use std::os::unix::fs::{MetadataExt, PermissionsExt, symlink};
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Result, bail};
use walkdir::WalkDir;

use super::checks::{Place, place};
use super::rpm::{File, Rpm};
use super::units;
use crate::command::run;
use crate::system_packages::manifest::Placed;

const FACTORY: &str = "usr/share/factory";
const DIRECTORY: u32 = 0o040000;
const KIND: u32 = 0o170000;
const PRESET: &str = "usr/lib/systemd/system-preset/98-luft-system-packages.preset";
const ENABLING: [&str; 3] = [".wants", ".requires", ".upholds"];

/// The folders of a build: `lower` is Luft's own system, `root` the same with the packages
/// installed over it and `upper` only what installing them changed.
pub struct Layout<'a> {
    pub lower: &'a Path,
    pub root: &'a Path,
    pub upper: &'a Path,
    pub stage: &'a Path,
}

fn relative(path: &str) -> &str {
    path.trim_start_matches('/')
}

fn is_dir(file: &File) -> bool {
    file.mode & KIND == DIRECTORY
}

fn same_content(left: &Path, right: &Path) -> Result<bool> {
    let (left_meta, right_meta) = (fs::symlink_metadata(left)?, fs::symlink_metadata(right)?);
    if left_meta.file_type() != right_meta.file_type() {
        return Ok(false);
    }
    if left_meta.is_symlink() {
        return Ok(fs::read_link(left)? == fs::read_link(right)?);
    }
    if left_meta.len() != right_meta.len() || left_meta.mode() != right_meta.mode() {
        return Ok(false);
    }
    let (mut left, mut right) = (fs::File::open(left)?, fs::File::open(right)?);
    let (mut left_chunk, mut right_chunk) = (vec![0; 1 << 16], vec![0; 1 << 16]);
    loop {
        let read = left.read(&mut left_chunk)?;
        right.read_exact(&mut right_chunk[..read])?;
        if read == 0 {
            return Ok(true);
        }
        if left_chunk[..read] != right_chunk[..read] {
            return Ok(false);
        }
    }
}

enum Fate {
    Shared,
    New,
}

fn fate(layout: &Layout, rpm: &Rpm, file: &File) -> Result<Fate> {
    let path = relative(&file.path);
    let Ok(base) = fs::symlink_metadata(layout.lower.join(path)) else {
        return Ok(Fate::New);
    };
    let shared = match (base.is_dir(), is_dir(file)) {
        (true, true) => true,
        (false, false) => same_content(&layout.lower.join(path), &layout.root.join(path))?,
        _ => false,
    };
    if !shared {
        bail!(
            "{} would replace {}, which is part of Luft.",
            rpm.name,
            file.path
        );
    }
    Ok(Fate::Shared)
}

fn copy_attributes(from: &Path, to: &Path) -> Result<()> {
    let metadata = fs::symlink_metadata(from)?;
    fs::set_permissions(to, fs::Permissions::from_mode(metadata.mode() & 0o7777))?;
    std::os::unix::fs::lchown(to, Some(metadata.uid()), Some(metadata.gid()))?;
    Ok(())
}

/// Makes `path` and its parents in `stage` with the attributes they have in `root`, since the
/// topmost layer decides a merged folder's owner and mode.
fn mirror_folder(root: &Path, stage: &Path, path: &Path) -> Result<()> {
    let mut built = PathBuf::new();
    for part in path.components() {
        built.push(part);
        let target = stage.join(&built);
        if !target.exists() {
            fs::create_dir(&target)?;
            match root.join(&built).symlink_metadata() {
                Ok(_) => copy_attributes(&root.join(&built), &target)?,
                Err(_) => fs::set_permissions(&target, fs::Permissions::from_mode(0o755))?,
            }
        }
    }
    Ok(())
}

fn copy_files(from: &Path, into: &Path, paths: &[&str]) -> Result<()> {
    for chunk in paths.chunks(512) {
        run(Command::new("cp")
            .args([
                "--archive",
                "--no-dereference",
                "--parents",
                "--target-directory",
            ])
            .arg(into)
            .arg("--")
            .args(chunk)
            .current_dir(from))?;
    }
    Ok(())
}

pub fn merged(layout: &Layout, rpms: &[Rpm]) -> Result<()> {
    let (mut files, mut folders) = (Vec::new(), Vec::new());
    for rpm in rpms {
        for file in &rpm.files {
            if !matches!(place(&file.path), Some(Place::Merged)) {
                continue;
            }
            if let Fate::New = fate(layout, rpm, file)? {
                let path = relative(&file.path);
                if is_dir(file) {
                    folders.push(path)
                } else {
                    files.push(path)
                }
            }
        }
    }
    for parent in files.iter().filter_map(|path| Path::new(path).parent()) {
        mirror_folder(layout.root, layout.stage, parent)?;
    }
    copy_files(layout.root, layout.stage, &files)?;
    for folder in folders {
        mirror_folder(layout.root, layout.stage, Path::new(folder))?;
    }
    Ok(())
}

/// Configuration and state go into the factory folder, to be copied to /etc and /var when
/// they aren't there, like installing the package would have.
pub fn placed(layout: &Layout, rpms: &[Rpm]) -> Result<Vec<Placed>> {
    let factory = layout.stage.join(FACTORY);
    mirror_folder(layout.root, layout.stage, Path::new(FACTORY))?;
    let (mut entries, mut files) = (Vec::new(), Vec::new());
    for rpm in rpms {
        for file in &rpm.files {
            if !matches!(place(&file.path), Some(Place::Placed)) {
                continue;
            }
            if let Fate::New = fate(layout, rpm, file)? {
                entries.push(Placed {
                    path: file.path.clone(),
                    user: file.user.clone(),
                    group: file.group.clone(),
                    mode: file.mode,
                });
                if is_dir(file) {
                    fs::create_dir_all(factory.join(relative(&file.path)))?;
                } else {
                    files.push(relative(&file.path));
                }
            }
        }
    }
    copy_files(layout.root, &factory, &files)?;
    entries.sort_by(|left, right| left.path.cmp(&right.path));
    Ok(entries)
}

pub struct Enabled {
    pub units: BTreeMap<String, Vec<String>>,
    pub enabled: Vec<String>,
}

pub fn enable(layout: &Layout, rpms: &[Rpm], requested: &BTreeSet<String>) -> Result<Enabled> {
    let mut units = BTreeMap::new();
    let mut installable = BTreeMap::new();
    for rpm in rpms {
        let names: Vec<String> = rpm
            .files
            .iter()
            .filter_map(|file| units::is_unit(&file.path))
            .map(str::to_owned)
            .collect();
        let startable: Vec<String> = names
            .iter()
            .filter(|name| {
                fs::read_to_string(layout.root.join(relative(units::SYSTEM_UNITS)).join(name))
                    .is_ok_and(|text| units::installable(&text, name))
            })
            .cloned()
            .collect();
        if !startable.is_empty() {
            installable.insert(rpm.name.clone(), startable);
        }
        units.insert(rpm.name.clone(), names);
    }
    let all: Vec<&String> = installable.values().flatten().collect();
    if !all.is_empty() {
        let presets = units::presets(
            &installable,
            requested,
            &units::named_by_presets(layout.root),
        );
        let preset = layout.root.join(PRESET);
        fs::write(&preset, presets)?;
        run(Command::new("systemctl")
            .arg(format!("--root={}", layout.root.display()))
            .args(["preset", "--preset-mode=enable-only"])
            .args(&all))?;
        fs::remove_file(&preset)?;
    }
    Ok(Enabled {
        units,
        enabled: harvest_links(layout)?,
    })
}

/// Moves the links `systemctl preset` made in /etc into the extension's /usr, so turning the
/// services on goes away with it.
fn harvest_links(layout: &Layout) -> Result<Vec<String>> {
    let made = layout.upper.join("etc/systemd/system");
    let mut enabled = Vec::new();
    if !made.exists() {
        return Ok(enabled);
    }
    for entry in WalkDir::new(&made) {
        let entry = entry?;
        if !entry.path_is_symlink() {
            continue;
        }
        let path = entry.path().strip_prefix(&made)?;
        let target = layout.stage.join(relative(units::SYSTEM_UNITS)).join(path);
        let folder =
            Path::new(relative(units::SYSTEM_UNITS)).join(path.parent().unwrap_or(Path::new("")));
        mirror_folder(layout.root, layout.stage, &folder)?;
        symlink(fs::read_link(entry.path())?, &target)?;
        let enabling = path
            .parent()
            .and_then(|parent| parent.to_str())
            .is_some_and(|parent| ENABLING.iter().any(|suffix| parent.ends_with(suffix)));
        if enabling && let Some(name) = path.file_name().and_then(|name| name.to_str()) {
            enabled.push(name.to_owned());
        }
    }
    enabled.sort();
    enabled.dedup();
    Ok(enabled)
}
