mod switch;
mod watch;

use luft_software::system::image::{self, Deployments, Release, Status, Update};
use luft_software::task::Task;
use serde::Serialize;
use specta::Type;

use super::store::{Checked, Found};

pub use switch::run as switch;
pub use watch::{scan, watch};

#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct Available {
    #[serde(flatten)]
    release: Release,
    size: u64,
}

#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct ImageOverview {
    #[serde(flatten)]
    status: Status,
    available: Option<Available>,
    offer: Option<switch::Offer>,
}

fn check(deployments: &Deployments) -> Result<Option<Update>, String> {
    let update = deployments.check()?;
    Found {
        update: update.clone(),
    }
    .save()?;
    Ok(update)
}

fn expected_size() -> Option<u64> {
    Found::load().update.map(|update| update.size)
}

/// Whether the system looked for updates on its schedule since this account last did, so what
/// was found then may be out of date.
fn checked_on_schedule_since() -> bool {
    let on_schedule = luft_app::block_on(image::policy())
        .ok()
        .and_then(|policy| policy.checked);
    on_schedule > Checked::load().at
}

fn follow(task: Task) -> Result<(), String> {
    luft_app::block_on(image::follow(expected_size(), task))
}

pub fn load(refresh: Option<Task>) -> Result<ImageOverview, String> {
    let refreshed = refresh.is_some();
    let deployments = luft_app::block_on(Deployments::load())?;
    let update = match refresh {
        Some(_) => check(&deployments)?,
        None if checked_on_schedule_since() => {
            let update = check(&deployments)?;
            Checked::now()?;
            update
        }
        None => Found::load().update,
    };
    let status = deployments.status();
    let available = update
        .filter(|update| deployments.lacks(update))
        .map(|update| Available {
            release: update.release,
            size: update.size,
        });
    Ok(ImageOverview {
        status,
        available,
        offer: switch::offer(deployments, refreshed),
    })
}

pub fn download(task: Task) -> Result<(), String> {
    luft_app::block_on(image::download(expected_size(), task))
}

pub fn rollback(_: Task) -> Result<(), String> {
    luft_app::block_on(image::rollback())
}
