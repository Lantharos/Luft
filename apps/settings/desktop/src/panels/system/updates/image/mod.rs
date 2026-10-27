mod switch;
mod watch;

use luft_software::progress::Progress;
use luft_software::system::image::{self, Deployments, Release, Status, Update};
use luft_software::task::{Cancel, Task};
use serde::Serialize;
use specta::Type;

use super::background::{AVAILABLE, Notice, READY};
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

fn follow(task: Task) -> Result<(), String> {
    luft_app::block_on(image::follow(expected_size(), task))
}

pub fn load(refresh: Option<Task>) -> Result<ImageOverview, String> {
    let refreshed = refresh.is_some();
    let deployments = luft_app::block_on(Deployments::load())?;
    let update = match refresh {
        Some(_) => check(&deployments)?,
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

pub fn check_in_background(download: bool) -> Result<Option<Notice>, String> {
    let deployments = luft_app::block_on(Deployments::load())?;
    let update = check(&deployments)?;
    Checked::now()?;
    let Some(update) = update.filter(|update| deployments.lacks(update)) else {
        return Ok(None);
    };
    if !download {
        return Ok(Some(AVAILABLE));
    }
    let quiet = |_: Progress| {};
    luft_app::block_on(image::download(
        Some(update.size),
        Task {
            report: &quiet,
            cancel: &Cancel::default(),
        },
    ))?;
    Ok(Some(READY))
}
