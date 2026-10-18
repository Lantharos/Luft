use luft_app::block_on;
use luft_software::packages;
use luft_software::task::Task;
use serde::{Deserialize, Serialize};

use crate::operations::Action;

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Job {
    InstallPackage { package: String },
    InstallPackageFile { path: String },
    RemovePackage { package: String },
    UpdatePackages { packages: Vec<String> },
}

impl Job {
    pub fn action(&self) -> Action {
        match self {
            Self::InstallPackage { .. } | Self::InstallPackageFile { .. } => Action::Install,
            Self::RemovePackage { .. } => Action::Remove,
            Self::UpdatePackages { .. } => Action::Update,
        }
    }

    pub fn run(&self, task: Task) -> Result<(), String> {
        block_on(async {
            match self {
                Self::InstallPackage { package } => packages::install(package, task).await,
                Self::InstallPackageFile { path } => packages::install_file(path, task).await,
                Self::RemovePackage { package } => packages::remove(package, task).await,
                Self::UpdatePackages { packages: names } => packages::update(names, task).await,
            }
        })
    }
}
