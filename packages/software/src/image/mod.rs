mod config;
mod deployment;
mod progress;
mod registry;
pub mod running;
mod transaction;
mod variant;

use std::collections::{HashMap, HashSet};
use std::os::fd::OwnedFd;

use serde::{Deserialize, Serialize};
use zbus::zvariant::{Fd, Value};

use crate::task::Task;
use deployment::Deployment;

pub use config::Release;
pub use transaction::follow;

type Options<'a> = HashMap<&'static str, Value<'a>>;

#[derive(Serialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub current: Release,
    pub staged: Option<Release>,
    pub previous: Option<Release>,
    pub returning: Option<Release>,
    pub layered: Vec<String>,
    pub installing: Vec<String>,
    pub removing: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Update {
    pub release: Release,
    pub size: u64,
    layers: Vec<String>,
}

pub struct Deployments(Vec<Deployment>);

fn missing(from: &[String], within: &[String]) -> Vec<String> {
    from.iter()
        .filter(|name| !within.contains(name))
        .cloned()
        .collect()
}

impl Deployments {
    pub fn load() -> Result<Self, String> {
        let deployments = transaction::sysroot_property("Deployments")?;
        Deployment::parse(variant::json(&deployments)).map(Self)
    }

    fn booted(&self) -> Result<&Deployment, String> {
        self.0
            .iter()
            .find(|deployment| deployment.booted)
            .ok_or_else(|| "The running system isn't one of its own versions.".into())
    }

    fn pending(&self) -> Option<&Deployment> {
        self.0.first().filter(|deployment| !deployment.booted)
    }

    fn staged(&self) -> Option<&Deployment> {
        self.pending().filter(|deployment| deployment.staged)
    }

    pub fn status(&self) -> Result<Status, String> {
        let booted = self.booted()?;
        let staged = self.staged();
        let returning = self.pending().filter(|deployment| !deployment.staged);
        let previous = self
            .0
            .iter()
            .find(|deployment| !deployment.booted && !deployment.staged)
            .filter(|_| returning.is_none());
        let requested = &staged.unwrap_or(booted).requested_packages;
        Ok(Status {
            current: booted.release(),
            staged: staged
                .filter(|staged| staged.layers() != booted.layers())
                .map(Deployment::release),
            previous: previous.map(Deployment::release),
            returning: returning.map(Deployment::release),
            layered: booted.requested_packages.clone(),
            installing: missing(requested, &booted.requested_packages),
            removing: missing(&booted.requested_packages, requested),
        })
    }

    pub fn check(&self) -> Result<Option<Update>, String> {
        let booted = self.booted()?;
        let location = booted
            .container_image_reference
            .as_deref()
            .and_then(registry::location)
            .ok_or("This system doesn't get its updates from an image.")?;
        let image = registry::fetch(&location)?;
        if image.config.layers() == booted.layers() {
            return Ok(None);
        }
        let present: HashSet<&String> = self.0.iter().flat_map(Deployment::layers).collect();
        Ok(Some(Update {
            release: image.config.release(),
            size: image
                .config
                .layers()
                .iter()
                .zip(&image.blobs)
                .filter(|(layer, _)| !present.contains(layer))
                .map(|(_, blob)| blob.size)
                .sum(),
            layers: image.config.layers().to_vec(),
        }))
    }

    pub fn lacks(&self, update: &Update) -> bool {
        let booted = self.0.iter().filter(|deployment| deployment.booted);
        !booted
            .chain(self.staged())
            .any(|deployment| deployment.layers() == update.layers)
    }
}

pub fn download(task: Task) -> Result<(), String> {
    transaction::run("Upgrade", &(Options::new(),), Some(task))
}

pub fn rollback(task: Task) -> Result<(), String> {
    transaction::run("Rollback", &(Options::new(),), Some(task))
}

fn change(modifiers: Options, task: Task) -> Result<(), String> {
    let options = Options::from([
        ("no-pull-base", Value::from(true)),
        ("idempotent-layering", Value::from(true)),
    ]);
    transaction::run("UpdateDeployment", &(modifiers, options), Some(task))
}

pub fn install(packages: &[&str], task: Task) -> Result<(), String> {
    change(
        Options::from([("install-packages", Value::from(packages.to_vec()))]),
        task,
    )
}

pub fn remove(packages: &[&str], task: Task) -> Result<(), String> {
    change(
        Options::from([("uninstall-packages", Value::from(packages.to_vec()))]),
        task,
    )
}

pub fn install_file(path: &str, task: Task) -> Result<(), String> {
    let file = OwnedFd::from(std::fs::File::open(path).map_err(|error| error.to_string())?);
    change(
        Options::from([("install-local-packages", Value::from(vec![Fd::from(&file)]))]),
        task,
    )
}

#[cfg(test)]
mod tests;
