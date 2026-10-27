use std::path::PathBuf;

use luft_app::block_on;
use luft_software::apps::flatpak::{self, FLATHUB, Installation};
use luft_software::apps::{appimage, debian, toolbox};
use luft_software::system::repositories::{self, Draft};
use luft_software::system::system_packages;
use luft_software::task::Task;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub enum Action {
    Install,
    Remove,
    Update,
}

#[derive(Deserialize, Serialize, Clone, Debug, Type)]
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
    InstallFlatpakBundle {
        path: PathBuf,
    },
    InstallDeb {
        path: PathBuf,
    },
    RemoveDeb {
        package: String,
    },
    UpdateDebs {
        packages: Vec<String>,
    },
    AddFlatpakRepo {
        path: PathBuf,
        name: String,
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
    UpdateAppImage {
        id: String,
    },
    UpdateTools {
        packages: Vec<String>,
    },
    InstallSystemPackages {
        packages: Vec<String>,
    },
    RemoveSystemPackages {
        packages: Vec<String>,
    },
    InstallSystemPackageFile {
        path: String,
        package: String,
        repository: Option<Draft>,
    },
    RemoveRepository {
        file: String,
    },
}

impl Job {
    pub fn action(&self) -> Action {
        match self {
            Self::InstallFlathub { .. }
            | Self::InstallFlatpakRef { .. }
            | Self::InstallFlatpakBundle { .. }
            | Self::InstallDeb { .. }
            | Self::AddFlatpakRepo { .. }
            | Self::InstallAppImage { .. }
            | Self::InstallTool { .. }
            | Self::InstallToolFile { .. }
            | Self::InstallSystemPackages { .. }
            | Self::InstallSystemPackageFile { .. } => Action::Install,
            Self::RemoveFlatpak { .. }
            | Self::RemoveDeb { .. }
            | Self::RemoveAppImage { .. }
            | Self::RemoveTool { .. }
            | Self::RemoveSystemPackages { .. }
            | Self::RemoveRepository { .. } => Action::Remove,
            Self::UpdateFlatpaks { .. }
            | Self::UpdateDebs { .. }
            | Self::UpdateAppImage { .. }
            | Self::UpdateTools { .. } => Action::Update,
        }
    }

    pub fn run(&self, task: Task) -> Result<(), String> {
        let _exclusive = task.exclusive()?;
        match self {
            Self::InstallFlathub { id } => {
                flatpak::ensure_flathub(Installation::User)?;
                flatpak::install(Installation::User, FLATHUB, id, task)?;
                flatpak::integrate();
                Ok(())
            }
            Self::InstallFlatpakRef { path } => {
                flatpak::install_ref(Installation::User, path, task)?;
                flatpak::integrate();
                Ok(())
            }
            Self::InstallFlatpakBundle { path } => {
                // Apps from bundles still need a runtime, which most get from Flathub, unless it's installed already
                let flathub = flatpak::ensure_flathub(Installation::User);
                flatpak::install_bundle(Installation::User, path, task).map_err(|error| match flathub {
                    Err(reason) => format!(
                        "{}. Flathub, where its runtime would come from, couldn't be added: {reason}",
                        error.trim_end_matches('.')
                    ),
                    Ok(()) => error,
                })?;
                flatpak::integrate();
                Ok(())
            }
            Self::InstallDeb { path } => debian::install(path, task).map(drop),
            Self::RemoveDeb { package } => debian::remove(package, task),
            Self::UpdateDebs { packages } => debian::update(packages, task),
            Self::AddFlatpakRepo { path, name } => {
                flatpak::add_remote(Installation::User, name, path)
            }
            Self::InstallAppImage { path } => appimage::install(path, task).map(|_| ()),
            Self::InstallTool { package } => toolbox::install(package, task),
            Self::InstallToolFile { path } => toolbox::install_file(path, task),
            Self::RemoveFlatpak {
                installation,
                reference,
            } => flatpak::uninstall(*installation, reference, task),
            Self::RemoveAppImage { id } => appimage::remove(id),
            Self::RemoveTool { package } => toolbox::remove(package, task),
            Self::UpdateFlatpaks {
                installation,
                references,
            } => {
                let references: Vec<&str> = references.iter().map(String::as_str).collect();
                flatpak::update(*installation, &references, task)?;
                flatpak::integrate();
                Ok(())
            }
            Self::UpdateAppImage { id } => appimage::update(&appimage::find(id)?, task).map(|_| ()),
            Self::UpdateTools { packages } => toolbox::update(packages, task),
            Self::InstallSystemPackages { packages } => {
                block_on(system_packages::install(packages, task))
            }
            Self::RemoveSystemPackages { packages } => {
                block_on(system_packages::remove(packages, task))
            }
            Self::InstallSystemPackageFile {
                path,
                package,
                repository,
            } => block_on(async {
                match repository {
                    Some(draft) => {
                        if !repositories::is_added(draft) {
                            system_packages::add_repository(draft).await?;
                        }
                        system_packages::install(std::slice::from_ref(package), task).await
                    }
                    None => system_packages::install_file(path, task).await,
                }
            }),
            Self::RemoveRepository { file } => {
                block_on(system_packages::remove_repository(file, task))
            }
        }
    }
}
