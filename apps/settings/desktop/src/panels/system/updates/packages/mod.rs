mod elsewhere;
mod watch;

use futures_util::future::join;
use luft_i18n::t;
use luft_software::packagekit::{self, Mode, PackageId, Results, Update, offline};
use luft_software::progress::Progress;
use luft_software::task::{Cancel, Task};
use luft_software::updates::PackageUpdates;
use serde::Serialize;

use super::backend::{AVAILABLE, Backend, Notice, READY};
use super::overview::{Loaded, System};
use super::state;
use super::store::Checked;
use crate::L10N;

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

async fn covered(updates: &[PackageId]) -> bool {
    let prepared: Vec<PackageId> = offline::prepared().await.unwrap_or_default();
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

async fn system_updates() -> Result<Vec<PackageId>, String> {
    match listed() {
        Some(updates) => Ok(ids(&updates)),
        None => Ok(ids(&PackageUpdates::load(Mode::Quiet).await?.system)),
    }
}

async fn load(refresh: Option<Task<'_>>) -> Result<Loaded, String> {
    if let Some(task) = refresh {
        packagekit::refresh(true, Mode::Interactive, Some(task)).await?;
    }
    let packages = PackageUpdates::load(Mode::Quiet).await?;
    let (prepared, results) = join(covered(&ids(&packages.system)), offline::results()).await;
    Ok(Loaded {
        package_apps: packages.apps.len(),
        system: System::Packages(Overview {
            prepared,
            updates: packages.system,
            results,
        }),
    })
}

async fn check_in_background(download: bool) -> Result<Option<Notice>, String> {
    packagekit::refresh(false, Mode::Background, None).await?;
    Checked::now()?;
    let updates = ids(&PackageUpdates::load(Mode::Background).await?.system);
    if updates.is_empty() || covered(&updates).await {
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
    )
    .await?;
    Ok(Some(READY))
}

impl Backend for Packages {
    fn load(&self, refresh: Option<Task>) -> Result<Loaded, String> {
        luft_app::block_on(load(refresh))
    }

    fn download(&self, task: Task) -> Result<(), String> {
        luft_app::block_on(async { packagekit::prepare(&system_updates().await?, task).await })
    }

    fn downloaded(&self) {
        let Some(updates) = listed() else {
            return;
        };
        let prepared = luft_app::block_on(covered(&ids(&updates)));
        state::edit_overview(|overview| {
            if let System::Packages(packages) = &mut overview.system {
                packages.prepared = prepared;
            }
        });
    }

    fn rollback(&self, _: Task) -> Result<(), String> {
        Err(t!(L10N, "desktop-updates-no-rollback"))
    }

    fn check_in_background(&self, download: bool) -> Result<Option<Notice>, String> {
        luft_app::block_on(check_in_background(download))
    }

    fn watch(&self) {
        watch::watch();
    }

    fn scan(&self) {
        luft_app::spawn(watch::scan());
    }
}
