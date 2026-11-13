use std::path::{Path, PathBuf};

use luft_dbus::runtime::block_on;
use luft_software::apps::flatpak::{self, FLATHUB, Installation};
use luft_software::apps::{appimage, debian, toolbox};
use luft_software::system::repositories::{self, Draft};
use luft_software::system::system_packages;
use luft_software::task::Task;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::store::install::{Consent, Reason};
use crate::{store, tools};

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
    InstallStore {
        id: String,
        consent: Consent,
    },
    UpdateStore {
        id: String,
        consent: Consent,
    },
    RemoveStore {
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
        /// Whether you let an app that asks to run unsandboxed do so.
        full_access: bool,
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
    InstallStoreTool {
        address: String,
        channel: String,
    },
    UpdateStoreTool {
        name: String,
    },
    RemoveStoreTool {
        name: String,
    },
}

/// Installs the app in a bundle. Most bundles get their runtime from
/// Flathub unless it's installed already, so Flathub is added first, and
/// named when the install fails without it.
fn install_flatpak_bundle(path: &Path, task: Task) -> Result<(), String> {
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

impl Job {
    pub fn action(&self) -> Action {
        match self {
            Self::InstallFlathub { .. }
            | Self::InstallStore { .. }
            | Self::InstallFlatpakRef { .. }
            | Self::InstallFlatpakBundle { .. }
            | Self::InstallDeb { .. }
            | Self::AddFlatpakRepo { .. }
            | Self::InstallAppImage { .. }
            | Self::InstallTool { .. }
            | Self::InstallToolFile { .. }
            | Self::InstallSystemPackages { .. }
            | Self::InstallSystemPackageFile { .. }
            | Self::InstallStoreTool { .. } => Action::Install,
            Self::RemoveFlatpak { .. }
            | Self::RemoveStore { .. }
            | Self::RemoveDeb { .. }
            | Self::RemoveAppImage { .. }
            | Self::RemoveTool { .. }
            | Self::RemoveSystemPackages { .. }
            | Self::RemoveRepository { .. }
            | Self::RemoveStoreTool { .. } => Action::Remove,
            Self::UpdateFlatpaks { .. }
            | Self::UpdateStore { .. }
            | Self::UpdateDebs { .. }
            | Self::UpdateAppImage { .. }
            | Self::UpdateTools { .. }
            | Self::UpdateStoreTool { .. } => Action::Update,
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
            Self::InstallStore { id, consent } => {
                store::install::install(id, consent, Reason::Install, task)
            }
            Self::UpdateStore { id, consent } => {
                store::install::install(id, consent, Reason::Update, task)
            }
            Self::RemoveStore { id } => store::install::remove(id),
            Self::InstallFlatpakRef { path } => {
                flatpak::install_ref(Installation::User, path, task)?;
                flatpak::integrate();
                Ok(())
            }
            Self::InstallFlatpakBundle { path } => install_flatpak_bundle(path, task),
            Self::InstallDeb { path } => debian::install(path, task).map(drop),
            Self::RemoveDeb { package } => debian::remove(package, task),
            Self::UpdateDebs { packages } => debian::update(packages, task),
            Self::AddFlatpakRepo { path, name } => {
                flatpak::add_remote(Installation::User, name, path)
            }
            Self::InstallAppImage { path, full_access } => {
                let installed = appimage::install(path, task)?;
                if !appimage::sandboxed() {
                    return Ok(());
                }
                block_on(appimage::reset(
                    &installed.app.id,
                    installed.declaration.as_ref(),
                    *full_access,
                ))
            }
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
            Self::InstallStoreTool { address, channel } => {
                tools::install(address, channel, "install", task)
            }
            Self::UpdateStoreTool { name } => tools::update(name, task),
            Self::RemoveStoreTool { name } => tools::remove(name),
        }
    }
}
