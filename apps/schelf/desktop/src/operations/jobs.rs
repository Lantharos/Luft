use std::path::PathBuf;

use luft_software::flatpak::{self, FLATHUB, Installation};
use luft_software::packagekit::{self, Mode, PackageId};
use luft_software::task::Task;
use luft_software::{appimage, updates::PackageUpdates};
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
}

impl Job {
    pub fn action(&self) -> Action {
        match self {
            Self::InstallFlathub { .. }
            | Self::InstallFlatpakRef { .. }
            | Self::AddFlatpakRepo { .. }
            | Self::InstallPackage { .. }
            | Self::InstallPackageFile { .. }
            | Self::InstallAppImage { .. } => Action::Install,
            Self::RemoveFlatpak { .. }
            | Self::RemovePackage { .. }
            | Self::RemoveAppImage { .. } => Action::Remove,
            Self::UpdateFlatpaks { .. }
            | Self::UpdatePackages { .. }
            | Self::UpdateAppImage { .. } => Action::Update,
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
            Self::InstallPackage { package } => {
                let id = packagekit::resolve_available(package)?
                    .ok_or("That app isn't available from your software sources.")?;
                packagekit::install(&[id], task)
            }
            Self::InstallPackageFile { path } => packagekit::install_file(path, task),
            Self::InstallAppImage { path } => appimage::install(path, task).map(|_| ()),
            Self::RemoveFlatpak {
                installation,
                reference,
            } => flatpak::uninstall(*installation, reference, task),
            Self::RemovePackage { package } => {
                let installed = packagekit::resolve(
                    &[package.as_str()],
                    packagekit::filter::INSTALLED,
                    Mode::Quiet,
                )?;
                let ids: Vec<PackageId> = installed.into_iter().map(|package| package.id).collect();
                packagekit::remove(&ids, task)
            }
            Self::RemoveAppImage { id } => appimage::remove(id),
            Self::UpdateFlatpaks {
                installation,
                references,
            } => {
                let references: Vec<&str> = references.iter().map(String::as_str).collect();
                flatpak::update(*installation, &references, task)
            }
            Self::UpdatePackages { packages } => {
                let updates = PackageUpdates::load(Mode::Quiet)?;
                let ids: Vec<PackageId> = updates
                    .apps
                    .into_iter()
                    .filter(|update| packages.contains(&update.package.name))
                    .map(|update| update.package)
                    .collect();
                if ids.is_empty() {
                    return Ok(());
                }
                packagekit::update(&ids, task).map(|_| ())
            }
            Self::UpdateAppImage { id } => appimage::update(&appimage::find(id)?, task).map(|_| ()),
        }
    }
}
