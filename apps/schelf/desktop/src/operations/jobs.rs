use std::path::PathBuf;

use luft_app::block_on;
use luft_software::flatpak::{self, FLATHUB, Installation};
use luft_software::task::Task;
use luft_software::{appimage, system_packages, toolbox};
use serde::{Deserialize, Serialize};

use crate::fedora;

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Action {
    Install,
    Remove,
    Update,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
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
    #[serde(untagged)]
    Fedora(fedora::Job),
}

impl Job {
    pub fn action(&self) -> Action {
        match self {
            Self::InstallFlathub { .. }
            | Self::InstallFlatpakRef { .. }
            | Self::AddFlatpakRepo { .. }
            | Self::InstallAppImage { .. }
            | Self::InstallTool { .. }
            | Self::InstallToolFile { .. }
            | Self::InstallSystemPackages { .. } => Action::Install,
            Self::RemoveFlatpak { .. }
            | Self::RemoveAppImage { .. }
            | Self::RemoveTool { .. }
            | Self::RemoveSystemPackages { .. } => Action::Remove,
            Self::UpdateFlatpaks { .. }
            | Self::UpdateAppImage { .. }
            | Self::UpdateTools { .. } => Action::Update,
            Self::Fedora(job) => job.action(),
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
            Self::Fedora(job) => job.run(task),
        }
    }
}
