use std::sync::{Mutex, MutexGuard};

use luft_software::packagekit::{self, Mode, PackageId, Results, Update, offline};
use luft_software::task::Task;
use luft_software::updates::{self, PackageUpdates};
use serde::Serialize;

use super::background;
use super::state;
use super::store::Checked;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Overview {
    checked: Option<u64>,
    updates: Vec<Update>,
    prepared: bool,
    results: Option<Results>,
    apps: Option<usize>,
}

#[derive(PartialEq, Eq)]
enum Reload {
    Idle,
    Running,
    Again,
}

static RELOAD: Mutex<Reload> = Mutex::new(Reload::Idle);

fn ids(updates: &[Update]) -> Vec<PackageId> {
    updates
        .iter()
        .map(|update| update.package.clone())
        .collect()
}

pub fn system_updates() -> Result<Vec<PackageId>, String> {
    match state::overview() {
        Some(overview) => Ok(ids(&overview.updates)),
        None => Ok(ids(&PackageUpdates::load(Mode::Quiet)?.system)),
    }
}

pub fn load(refresh: Option<Task>) -> Result<(), String> {
    let checked = match refresh {
        Some(task) => {
            packagekit::refresh(true, Mode::Interactive, Some(task))?;
            Checked::now()?
        }
        None => Checked::load(),
    };
    let packages = PackageUpdates::load(Mode::Quiet)?;
    state::set_overview(Overview {
        checked: checked.at,
        prepared: background::covered(&ids(&packages.system)),
        updates: packages.system.clone(),
        results: offline::results(),
        apps: state::overview().and_then(|overview| overview.apps),
    });
    std::thread::spawn(move || {
        let apps = updates::app_count(&packages);
        state::edit_overview(|overview| overview.apps = Some(apps));
    });
    Ok(())
}

pub fn mark_prepared() {
    let Some(current) = state::overview() else {
        return;
    };
    let prepared = background::covered(&ids(&current.updates));
    state::edit_overview(|overview| overview.prepared = prepared);
}

fn reloading() -> MutexGuard<'static, Reload> {
    RELOAD
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
}

pub fn reload() {
    {
        let mut reload = reloading();
        if *reload != Reload::Idle {
            *reload = Reload::Again;
            return;
        }
        *reload = Reload::Running;
    }
    std::thread::spawn(|| {
        loop {
            if let Err(error) = load(None) {
                state::fail(error);
            }
            let mut reload = reloading();
            if *reload == Reload::Running {
                *reload = Reload::Idle;
                return;
            }
            *reload = Reload::Running;
        }
    });
}
