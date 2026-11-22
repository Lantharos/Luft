use std::path::{Path, PathBuf};

use luft_dbus::runtime::block_on;
use luft_i18n::t;
use luft_policy::{AppSource, Policy};
use luft_software::apps::flatpak::{self, FLATHUB, Installation, Step};
use luft_software::apps::{appimage, debian, places};
use luft_software::system::repositories::{self, Draft};
use luft_software::system::system_packages;
use luft_software::task::Task;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::l10n::L10N;
use crate::store::install::{Consent, Reason};
use crate::{host, store, tools};

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
    UpdateDebs,
    AddFlatpakRepo {
        path: PathBuf,
        name: String,
    },
    InstallAppImage {
        path: PathBuf,
        /// Whether you let an app that asks to run unsandboxed do so.
        full_access: bool,
    },
    RemoveFlatpak {
        installation: Installation,
        reference: String,
    },
    RemoveAppImage {
        id: String,
    },
    UpdateFlatpaks {
        installation: Installation,
        references: Vec<String>,
    },
    UpdateAppImage {
        id: String,
    },
    UpdateSystemPackages,
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

/// Sets up the Flatpak apps just installed or updated, and on Luft gives them the extensions for
/// the NVIDIA drivers of its versions on the computer that Flatpak didn't fetch with them.
fn settle_flatpaks(task: Task) {
    flatpak::integrate();
    if host::luft()
        && let Err(error) = flatpak::drivers::apply(&flatpak::drivers::changes(), task)
    {
        eprintln!("{error}");
    }
}

/// Installs the app in a bundle. Most bundles get their runtime from
/// Flathub unless it's installed already, so Flathub is added first, and
/// named when the install fails without it.
fn install_flatpak_bundle(path: &Path, task: Task) -> Result<(), String> {
    let flathub = flatpak::ensure_flathub(Installation::User);
    flatpak::install_bundle(Installation::User, path, task).map_err(|error| match flathub {
        Err(reason) => t!(
            L10N,
            "core-bundle-no-flathub",
            error = error.trim_end_matches('.'),
            reason = reason
        ),
        Ok(()) => error,
    })?;
    settle_flatpaks(task);
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
            | Self::InstallSystemPackages { .. }
            | Self::InstallSystemPackageFile { .. }
            | Self::InstallStoreTool { .. } => Action::Install,
            Self::RemoveFlatpak { .. }
            | Self::RemoveStore { .. }
            | Self::RemoveDeb { .. }
            | Self::RemoveAppImage { .. }
            | Self::RemoveSystemPackages { .. }
            | Self::RemoveRepository { .. }
            | Self::RemoveStoreTool { .. } => Action::Remove,
            Self::UpdateFlatpaks { .. }
            | Self::UpdateStore { .. }
            | Self::UpdateDebs
            | Self::UpdateAppImage { .. }
            | Self::UpdateSystemPackages
            | Self::UpdateStoreTool { .. } => Action::Update,
        }
    }

    /// Whether the job downloads what it needs before it takes the account's
    /// software lock, so several can download at once and only change
    /// things one after another.
    fn downloads_first(&self) -> bool {
        matches!(
            self,
            Self::InstallFlathub { .. }
                | Self::InstallStore { .. }
                | Self::UpdateStore { .. }
                | Self::UpdateAppImage { .. }
                | Self::InstallStoreTool { .. }
                | Self::UpdateStoreTool { .. }
                | Self::UpdateFlatpaks {
                    installation: Installation::User,
                    ..
                }
        )
    }

    /// Whether the policy lets this job add what it adds. Updates and removals always run, so
    /// what was installed before stays up to date and can go.
    pub fn allowed_by(&self, policy: &Policy) -> bool {
        let software = &policy.software;
        match self {
            Self::InstallFlathub { .. }
            | Self::InstallFlatpakRef { .. }
            | Self::InstallFlatpakBundle { .. } => software.allows(AppSource::Flathub),
            Self::AddFlatpakRepo { .. } => software.app_sources.is_none(),
            Self::InstallStore { .. } | Self::InstallStoreTool { .. } => {
                software.allows(AppSource::SchelfStore)
            }
            Self::InstallDeb { .. } => software.allows(AppSource::Ubuntu),
            Self::InstallAppImage { .. } => software.allows(AppSource::Appimage),
            Self::InstallSystemPackages { .. } => software.system_packages,
            Self::InstallSystemPackageFile { repository, .. } => {
                software.system_packages
                    && (repository.as_ref().is_none_or(repositories::is_added)
                        || software.package_sources)
            }
            _ => true,
        }
    }

    pub fn run(&self, task: Task) -> Result<(), String> {
        if !self.allowed_by(&Policy::load()) {
            return Err(luft_policy::MANAGED.to_owned());
        }
        let _exclusive = if self.downloads_first() {
            None
        } else {
            Some(task.exclusive()?)
        };
        match self {
            Self::InstallFlathub { id } => {
                {
                    let _exclusive = task.exclusive()?;
                    flatpak::ensure_flathub(Installation::User)?;
                }
                flatpak::install(Installation::User, FLATHUB, id, Step::Download, task)?;
                let _exclusive = task.exclusive()?;
                flatpak::install(Installation::User, FLATHUB, id, Step::Deploy, task)?;
                settle_flatpaks(task);
                Ok(())
            }
            Self::InstallStore { id, consent } => {
                let fetched = store::install::fetch(id, consent, Reason::Install, task)?;
                let _exclusive = task.exclusive()?;
                fetched.place(task)
            }
            Self::UpdateStore { id, consent } => {
                let fetched = store::install::fetch(id, consent, Reason::Update, task)?;
                let _exclusive = task.exclusive()?;
                fetched.place(task)
            }
            Self::RemoveStore { id } => store::install::remove(id),
            Self::InstallFlatpakRef { path } => {
                flatpak::install_ref(Installation::User, path, task)?;
                settle_flatpaks(task);
                Ok(())
            }
            Self::InstallFlatpakBundle { path } => install_flatpak_bundle(path, task),
            Self::InstallDeb { path } => debian::install(path, task).map(drop),
            Self::RemoveDeb { package } => debian::remove(package, task),
            Self::UpdateDebs => debian::update(task),
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
            Self::RemoveFlatpak {
                installation,
                reference,
            } => {
                flatpak::uninstall(*installation, reference, task)?;
                let id = flatpak::app_id(reference);
                if flatpak::is_installed(id) {
                    Ok(())
                } else {
                    block_on(async { places::forget(luft_dbus::session().await?, id).await })
                }
            }
            Self::RemoveAppImage { id } => appimage::remove(id),
            Self::UpdateFlatpaks {
                installation,
                references,
            } => {
                let references: Vec<&str> = references.iter().map(String::as_str).collect();
                let _exclusive = match installation {
                    Installation::User => {
                        flatpak::update(*installation, &references, Some(Step::Download), task)?;
                        let exclusive = task.exclusive()?;
                        flatpak::update(*installation, &references, Some(Step::Deploy), task)?;
                        Some(exclusive)
                    }
                    Installation::System => {
                        flatpak::update(*installation, &references, None, task)?;
                        None
                    }
                };
                settle_flatpaks(task);
                Ok(())
            }
            Self::UpdateAppImage { id } => {
                let staged = appimage::download_update(&appimage::find(id)?, task)?;
                let _exclusive = task.exclusive()?;
                staged.apply().map(drop)
            }
            Self::UpdateSystemPackages => block_on(system_packages::update()),
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
                let fetched = tools::fetch(address, channel, "install", task)?;
                let _exclusive = task.exclusive()?;
                fetched.place()
            }
            Self::UpdateStoreTool { name } => {
                let fetched = tools::fetch_update(name, task)?;
                let _exclusive = task.exclusive()?;
                fetched.place()
            }
            Self::RemoveStoreTool { name } => tools::remove(name),
        }
    }
}
