use std::collections::BTreeMap;
use std::fs::{self, File};
use std::io::{self, ErrorKind};
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};

use super::manifest::{Build, Origin};
use super::requested::{self, Requested};
use super::{repositories, state};
use crate::command::text;

const ARCHITECTURES: [&str; 2] = ["noarch", std::env::consts::ARCH];

fn files() -> PathBuf {
    state("files")
}

fn file(name: &str) -> PathBuf {
    files().join(format!("{name}.rpm"))
}

/// Where a build takes its packages from: Fedora, the repositories that were added, and
/// package files that were installed by themselves.
#[derive(Clone, Debug, Default)]
pub struct Sources {
    pub repositories: Vec<String>,
    pub files: BTreeMap<String, PathBuf>,
}

impl Sources {
    /// What's on the computer, leaving out a repository that's being removed.
    pub fn current(leaving: Option<&str>) -> Self {
        let files = fs::read_dir(files())
            .into_iter()
            .flatten()
            .flatten()
            .filter_map(|entry| {
                let path = entry.path();
                let name = path
                    .strip_prefix(files())
                    .ok()?
                    .to_str()?
                    .strip_suffix(".rpm")?
                    .to_owned();
                requested::valid(&name).then_some((name, path))
            })
            .collect();
        Self {
            repositories: repositories::installed()
                .into_iter()
                .filter(|file| Some(file.as_str()) != leaving)
                .collect(),
            files,
        }
    }

    /// Whether everything in `build` still comes from somewhere it can be built from again.
    pub fn cover(&self, build: &Build) -> bool {
        build.packages.iter().all(|package| match &package.origin {
            Origin::Fedora => true,
            Origin::Repository(file) => self.repositories.contains(file),
            Origin::File => self.files.contains_key(&package.name),
        })
    }
}

fn query(path: &Path) -> Result<(String, String)> {
    let output = text(
        Command::new("rpm")
            .args(["--query", "--package", "--nosignature"])
            .args(["--queryformat", "%{NAME}\\t%{ARCH}"])
            .arg(path),
    )
    .context("This isn't a package file")?;
    let (name, arch) = output
        .split_once('\t')
        .context("This isn't a package file")?;
    Ok((name.to_owned(), arch.to_owned()))
}

/// Keeps a package file someone opened, so every build can install it again. Returns the
/// package's name.
pub fn receive(mut package: File, current: &Requested) -> Result<String> {
    fs::create_dir_all(files())?;
    let incoming = files().join(".incoming");
    let mut copy = File::create(&incoming)?;
    io::copy(&mut package, &mut copy).context("Reading the package file")?;
    drop(copy);
    let kept = query(&incoming).and_then(|(name, arch)| {
        if !requested::valid(&name) {
            bail!("“{name}” isn't a package name.");
        }
        if !ARCHITECTURES.contains(&arch.as_str()) {
            bail!("{name} is made for {arch} computers.");
        }
        if current.contains(&name) {
            bail!("{name} is already a system package.");
        }
        fs::rename(&incoming, file(&name))?;
        Ok(name)
    });
    if kept.is_err() {
        let _ = fs::remove_file(&incoming);
    }
    kept
}

pub fn discard(names: &[String]) -> Result<()> {
    for name in names {
        match fs::remove_file(file(name)) {
            Err(error) if error.kind() != ErrorKind::NotFound => {
                return Err(error).with_context(|| format!("Removing the file of {name}"));
            }
            _ => {}
        }
    }
    Ok(())
}
