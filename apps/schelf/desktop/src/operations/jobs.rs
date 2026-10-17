use std::path::PathBuf;

use luft_app::block_on;
use luft_software::flatpak::{self, FLATHUB, Installation};
use luft_software::task::Task;
use luft_software::{appimage, packages, toolbox};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Action {
    Install,
    Remove,
    Update,
}

#[derive(Deserialize, Clone, Debug)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum Job {
    InstallFlathub {
        id: String,
    },
    InstallFlatpakRef {
        path: PathBuf,
    },
    AddFlatpakRepo {
        path: PathBuf,
        name: String,
    },
    InstallPackage {
        package: String,
    },
    InstallPackageFile {
        path: String,
    },
    InstallAppImage {
        path: PathBuf,
    },
    InstallTool {
        package: String,
    },
    InstallToolFile {
        path: String,
    },
    RemoveFlatpak {
        installation: Installation,
        reference: String,
    },
    RemovePackage {
        package: String,
    },
    RemoveAppImage {
        id: String,
    },
    RemoveTool {
        package: String,
    },
    UpdateFlatpaks {
        installation: Installation,
        references: Vec<String>,
    },
    UpdatePackages {
        packages: Vec<String>,
    },
    UpdateAppImage {
        id: String,
    },
    UpdateTools {
        packages: Vec<String>,
    },
}

impl Job {
    pub fn action(&self) -> Action {
        match self {
            Self::InstallFlathub { .. }
            | Self::InstallFlatpakRef { .. }
            | Self::AddFlatpakRepo { .. }
            | Self::InstallPackage { .. }
            | Self::InstallPackageFile { .. }
            | Self::InstallAppImage { .. }
            | Self::InstallTool { .. }
            | Self::InstallToolFile { .. } => Action::Install,
            Self::RemoveFlatpak { .. }
            | Self::RemovePackage { .. }
            | Self::RemoveAppImage { .. }
            | Self::RemoveTool { .. } => Action::Remove,
            Self::UpdateFlatpaks { .. }
            | Self::UpdatePackages { .. }
            | Self::UpdateAppImage { .. }
            | Self::UpdateTools { .. } => Action::Update,
        }
    }

    pub fn run(&self, task: Task) -> Result<(), String> {
        match self {
            Self::InstallFlathub { id } => {
                flatpak::ensure_flathub(Installation::User)?;
                flatpak::install(Installation::User, FLATHUB, id, task)
            }
            Self::InstallFlatpakRef { path } => {
                flatpak::install_ref(Installation::User, path, task)
            }
            Self::AddFlatpakRepo { path, name } => {
                flatpak::add_remote(Installation::User, name, path)
            }
            Self::InstallPackage { package } => block_on(packages::install(package, task)),
            Self::InstallPackageFile { path } => block_on(packages::install_file(path, task)),
            Self::InstallAppImage { path } => appimage::install(path, task).map(|_| ()),
            Self::InstallTool { package } => toolbox::install(package, task),
            Self::InstallToolFile { path } => toolbox::install_file(path, task),
            Self::RemoveFlatpak {
                installation,
                reference,
            } => flatpak::uninstall(*installation, reference, task),
            Self::RemovePackage { package } => block_on(packages::remove(package, task)),
            Self::RemoveAppImage { id } => appimage::remove(id),
            Self::RemoveTool { package } => toolbox::remove(package, task),
            Self::UpdateFlatpaks {
                installation,
                references,
            } => {
                let references: Vec<&str> = references.iter().map(String::as_str).collect();
                flatpak::update(*installation, &references, task)
            }
            Self::UpdatePackages { packages: names } => block_on(packages::update(names, task)),
            Self::UpdateAppImage { id } => appimage::update(&appimage::find(id)?, task).map(|_| ()),
            Self::UpdateTools { packages } => toolbox::update(packages, task),
        }
    }
}
