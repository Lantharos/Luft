//! The extensions that give Flatpak apps NVIDIA's driver, such as
//! `org.freedesktop.Platform.GL.nvidia-620-70-06`, kept in step with the driver of every version
//! of Luft on the computer.

mod found;
mod rule;

use std::collections::{BTreeMap, BTreeSet};

use futures_util::StreamExt;
use luft_dbus::runtime::block_on;
use zbus::Proxy;

use super::installed::location;
use super::transaction::run;
use super::{Installation, Installed, command, installed, query};
use crate::apps::operand::operand;
use crate::system::image::{Deployments, Graphics};
use crate::task::Task;
use found::{Contents, running_driver};
use rule::{Drivers, Plan, Wanted, plan};

const NETWORK_MANAGER: &str = "org.freedesktop.NetworkManager";
const NETWORK_MANAGER_PATH: &str = "/org/freedesktop/NetworkManager";
const FULL_CONNECTIVITY: u32 = 4;

#[derive(Default)]
pub struct Changes(Vec<(Installation, Plan)>);

impl Changes {
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn downloads(&self) -> bool {
        self.0.iter().any(|(_, plan)| !plan.install.is_empty())
    }
}

fn other_versions() -> (Option<Graphics>, Option<Graphics>) {
    block_on(Deployments::load()).map_or((None, Some(Graphics::Nvidia(None))), |deployments| {
        deployments.graphics()
    })
}

/// What each installation needs for the NVIDIA drivers of this computer's versions of Luft.
/// Without NVIDIA's driver running and nothing installed for one, that's nothing, found without
/// asking anything but the installations' folders.
pub fn changes() -> Changes {
    let running = running_driver();
    let found: Vec<(Installation, Contents)> = Installation::ALL
        .into_iter()
        .map(|installation| (installation, Contents::read(&location(installation))))
        .collect();
    let nowhere = Drivers {
        running: None,
        staged: None,
        rollback: None,
    };
    let holds_nvidia = |contents: &Contents| {
        !plan(&contents.points, &contents.runtimes, &nowhere)
            .remove
            .is_empty()
    };
    if running.is_none() && !found.iter().any(|(_, contents)| holds_nvidia(contents)) {
        return Changes::default();
    }
    let (staged, rollback) = other_versions();
    let drivers = Drivers {
        running,
        staged,
        rollback,
    };
    Changes(
        found
            .into_iter()
            .map(|(installation, contents)| {
                let plan = plan(&contents.points, &contents.runtimes, &drivers);
                (installation, plan)
            })
            .filter(|(_, plan)| *plan != Plan::default())
            .collect(),
    )
}

fn available(installation: Installation, origin: &str) -> Result<BTreeSet<String>, String> {
    let listed = query(
        installation,
        &[
            "remote-ls",
            "--runtime",
            "--columns=ref",
            "--",
            operand(origin)?,
        ],
    )?;
    Ok(listed
        .lines()
        .filter_map(|line| line.trim().strip_prefix("runtime/"))
        .map(str::to_owned)
        .collect())
}

fn install(
    installation: Installation,
    wanted: &[Wanted],
    origins: &[Installed],
    task: Task,
) -> Result<(), String> {
    let mut by_origin: BTreeMap<&str, Vec<&Wanted>> = BTreeMap::new();
    for extension in wanted {
        let owner = extension.owner.named();
        if let Some(app) = origins
            .iter()
            .find(|app| app.installation == installation && app.reference == owner)
        {
            by_origin.entry(&app.origin).or_default().push(extension);
        }
    }
    for (origin, wanted) in by_origin {
        let available = available(installation, origin)?;
        let references: BTreeSet<String> = wanted
            .iter()
            .flat_map(|extension| {
                extension
                    .branches
                    .iter()
                    .map(|branch| format!("{}/{}/{branch}", extension.id, extension.arch))
            })
            .filter(|reference| available.contains(reference))
            .collect();
        if references.is_empty() {
            continue;
        }
        run(
            command(installation)
                .args([
                    "install",
                    "-y",
                    "--noninteractive",
                    "--or-update",
                    "--",
                    origin,
                ])
                .args(references),
            task,
        )?;
    }
    Ok(())
}

fn remove(installation: Installation, plan: &Plan, task: Task) -> Result<(), String> {
    if plan.remove.is_empty() {
        return Ok(());
    }
    run(
        command(installation)
            .args(["uninstall", "-y", "--noninteractive", "--"])
            .args(
                plan.remove
                    .iter()
                    .map(|extension| format!("runtime/{}", extension.named())),
            ),
        task,
    )
}

/// Installs what `changes` found missing and removes what it found left over.
pub fn apply(changes: &Changes, task: Task) -> Result<(), String> {
    let origins = if changes.downloads() {
        installed()?
    } else {
        Vec::new()
    };
    let failures: Vec<String> = changes
        .0
        .iter()
        .flat_map(|(installation, plan)| {
            [
                install(*installation, &plan.install, &origins, task),
                remove(*installation, plan, task),
            ]
        })
        .filter_map(Result::err)
        .collect();
    if failures.is_empty() {
        Ok(())
    } else {
        Err(failures.join("\n"))
    }
}

/// Waits until NetworkManager says the computer reaches the internet, or returns at once when
/// it can't be asked.
pub async fn online() {
    let Ok(system) = luft_dbus::system().await else {
        return;
    };
    let Ok(manager) = Proxy::new(
        system,
        NETWORK_MANAGER,
        NETWORK_MANAGER_PATH,
        NETWORK_MANAGER,
    )
    .await
    else {
        return;
    };
    let mut changes = manager
        .receive_property_changed::<u32>("Connectivity")
        .await;
    match manager.get_property::<u32>("Connectivity").await {
        Ok(FULL_CONNECTIVITY) | Err(_) => return,
        Ok(_) => {}
    }
    while let Some(change) = changes.next().await {
        if change.get().await == Ok(FULL_CONNECTIVITY) {
            return;
        }
    }
}
