mod watch;

use luft_software::packagekit::{self, Mode, PackageId, Results, Update, offline};
use luft_software::progress::Progress;
use luft_software::task::{Cancel, Task};
use luft_software::updates::PackageUpdates;
use serde::Serialize;

use super::backend::{AVAILABLE, Backend, Notice, READY};
use super::overview::{Loaded, System};
use super::state;
use super::store::Checked;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Overview {
    updates: Vec<Update>,
    prepared: bool,
    results: Option<Results>,
}

pub struct Packages;

fn ids(updates: &[Update]) -> Vec<PackageId> {
    updates
        .iter()
        .map(|update| update.package.clone())
        .collect()
}

fn covered(updates: &[PackageId]) -> bool {
    let prepared: Vec<PackageId> = offline::prepared().unwrap_or_default();
    !updates.is_empty()
        && updates
            .iter()
            .all(|update| prepared.iter().any(|ready| ready.id == update.id))
}

fn listed() -> Option<Vec<Update>> {
    match state::overview()?.system {
        System::Packages(overview) => Some(overview.updates),
        System::Image(_) => None,
    }
}

fn system_updates() -> Result<Vec<PackageId>, String> {
    match listed() {
        Some(updates) => Ok(ids(&updates)),
        None => Ok(ids(&PackageUpdates::load(Mode::Quiet)?.system)),
    }
}

impl Backend for Packages {
    fn load(&self, refresh: Option<Task>) -> Result<Loaded, String> {
        if let Some(task) = refresh {
            packagekit::refresh(true, Mode::Interactive, Some(task))?;
        }
        let packages = PackageUpdates::load(Mode::Quiet)?;
        Ok(Loaded {
            package_apps: packages.apps.len(),
            system: System::Packages(Overview {
                prepared: covered(&ids(&packages.system)),
                updates: packages.system,
                results: offline::results(),
            }),
        })
    }

    fn download(&self, task: Task) -> Result<(), String> {
        packagekit::prepare(&system_updates()?, task)
    }

    fn downloaded(&self) {
        let Some(updates) = listed() else {
            return;
        };
        let prepared = covered(&ids(&updates));
        state::edit_overview(|overview| {
            if let System::Packages(packages) = &mut overview.system {
                packages.prepared = prepared;
            }
        });
    }

    fn rollback(&self, _: Task) -> Result<(), String> {
        Err("This system can't go back to an earlier version.".into())
    }

    fn check_in_background(&self, download: bool) -> Result<Option<Notice>, String> {
        packagekit::refresh(false, Mode::Background, None)?;
        Checked::now()?;
        let updates = ids(&PackageUpdates::load(Mode::Background)?.system);
        if updates.is_empty() || covered(&updates) {
            return Ok(None);
        }
        if !download {
            return Ok(Some(AVAILABLE));
        }
        let quiet = |_: Progress| {};
        packagekit::prepare(
            &updates,
            Task {
                report: &quiet,
                cancel: &Cancel::default(),
            },
        )?;
        Ok(Some(READY))
    }

    fn watch(&self) {
        watch::watch();
    }

    fn scan(&self) {
        watch::scan();
    }
}
