use std::fs::File;

use futures_util::future::{Either, select};
use futures_util::{StreamExt, pin_mut};
use luft_app::dbus::{self, failed, service::Service};
use serde::{Deserialize, Serialize};
use zbus::DynamicType;
use zbus::Fd;

use crate::progress::Stage;
use crate::system::repositories::{Described, Draft};
use crate::task::Task;

const PACKAGES: Service = Service {
    name: "com.lantharos.Packages1",
    path: "/com/lantharos/Packages1",
    interface: "com.lantharos.Packages1",
};

/// Where a system package came from.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Origin {
    Fedora,
    Repository(String),
    File,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Package {
    pub name: String,
    pub version: String,
    pub arch: String,
    pub summary: String,
    pub requested: bool,
    pub units: Vec<String>,
    pub apps: Vec<String>,
    pub origin: Origin,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Source {
    pub id: String,
    pub name: String,
    pub url: String,
}

/// A repository file that was added, with the sources in it.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Repository {
    pub file: String,
    pub sources: Vec<Source>,
}

impl Repository {
    pub fn name(&self) -> &str {
        self.sources
            .first()
            .map_or(self.file.as_str(), |source| source.name.as_str())
    }
}

/// The packages added to the system, merged over it as a system extension, and the
/// repositories they can come from besides Fedora.
#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct SystemPackages {
    pub requested: Vec<String>,
    pub packages: Vec<Package>,
    pub services: Vec<String>,
    pub pending: bool,
    pub repositories: Vec<Repository>,
}

impl SystemPackages {
    /// The packages asked for, without what they brought along.
    pub fn requested(&self) -> impl Iterator<Item = &Package> {
        self.packages.iter().filter(|package| package.requested)
    }

    /// Where a package came from, in words.
    pub fn origin_of(&self, origin: &Origin) -> String {
        match origin {
            Origin::Fedora => "Fedora".to_owned(),
            Origin::File => "Package file".to_owned(),
            Origin::Repository(file) => self
                .repositories
                .iter()
                .find(|repository| &repository.file == file)
                .map_or_else(|| file.clone(), |repository| repository.name().to_owned()),
        }
    }
}

pub async fn list() -> Result<SystemPackages, String> {
    let text: String = PACKAGES
        .proxy()
        .await?
        .call("List", &())
        .await
        .map_err(|error| dbus::explain(&error))?;
    serde_json::from_str(&text).map_err(failed)
}

fn stage(step: &str, method: &str) -> Stage {
    match (step, method) {
        ("downloading", _) => Stage::Downloading,
        ("building", "Remove" | "RemoveRepository") => Stage::Removing,
        ("building", _) => Stage::Installing,
        _ => Stage::Finishing,
    }
}

async fn rebuild<B: Serialize + DynamicType>(
    method: &str,
    body: &B,
    task: Task<'_>,
) -> Result<(), String> {
    let connection = dbus::system().await?;
    let signals = dbus::objects::signals(connection, PACKAGES.name, PACKAGES.path).await?;
    task.progress(Stage::Preparing, None);
    let call = PACKAGES.change::<_, ()>(method, body);
    let steps = signals.for_each(|message| {
        if let Ok(message) = message
            && message
                .header()
                .member()
                .is_some_and(|member| member == "Step")
            && let Ok((step,)) = message.body().deserialize::<(String,)>()
        {
            task.progress(stage(&step, method), None);
        }
        async {}
    });
    pin_mut!(call, steps);
    match select(call, steps).await {
        Either::Left((result, _)) => result.map_err(|error| dbus::explain(&error)),
        Either::Right(_) => Err("The system packages service stopped unexpectedly.".to_owned()),
    }
}

/// Adds packages to the system. Returns once the running system has them, with their
/// services started.
pub async fn install(names: &[String], task: Task<'_>) -> Result<(), String> {
    rebuild("Install", &(names,), task).await
}

/// Adds a package file to the system by itself. It's kept, so every update of Luft installs
/// it again, but it only changes when another file is opened.
pub async fn install_file(path: &str, task: Task<'_>) -> Result<(), String> {
    let file = File::open(path).map_err(|error| error.to_string())?;
    rebuild("InstallFile", &(Fd::from(&file),), task).await
}

/// Removes system packages and everything they brought, leaving the system as it was before.
pub async fn remove(names: &[String], task: Task<'_>) -> Result<(), String> {
    rebuild("Remove", &(names,), task).await
}

/// Checks a repository and its keys, so they can be shown before it's trusted.
pub async fn describe(draft: &Draft) -> Result<Described, String> {
    let text: String = PACKAGES
        .proxy()
        .await?
        .call(
            "DescribeRepository",
            &(&draft.file, &draft.text, &draft.keys),
        )
        .await
        .map_err(|error| dbus::explain(&error))?;
    serde_json::from_str(&text).map_err(failed)
}

/// Adds a repository, so its packages can be system packages.
pub async fn add_repository(draft: &Draft) -> Result<(), String> {
    PACKAGES
        .change::<_, ()>("AddRepository", &(&draft.file, &draft.text, &draft.keys))
        .await
        .map_err(|error| dbus::explain(&error))
}

/// Removes a repository and the system packages that came from it.
pub async fn remove_repository(file: &str, task: Task<'_>) -> Result<(), String> {
    rebuild("RemoveRepository", &(file,), task).await
}
