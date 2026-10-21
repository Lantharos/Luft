mod switch;
mod watch;

use luft_software::progress::Progress;
use luft_software::system::image::{self, Deployments, Release, Status, Update};
use luft_software::task::{Cancel, Task};
use serde::Serialize;

use super::backend::{AVAILABLE, Backend, Notice, READY};
use super::overview::{self, Loaded, System};
use super::store::{Checked, Found};

pub use switch::run as switch;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Available {
    #[serde(flatten)]
    release: Release,
    size: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Overview {
    #[serde(flatten)]
    status: Status,
    available: Option<Available>,
    offer: Option<switch::Offer>,
}

pub struct Image;

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

pub fn follow(task: Task) -> Result<(), String> {
    luft_app::block_on(image::follow(expected_size(), task))
}

impl Backend for Image {
    fn load(&self, refresh: Option<Task>) -> Result<Loaded, String> {
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
        Ok(Loaded {
            package_apps: 0,
            system: System::Image(Box::new(Overview {
                status,
                available,
                offer: switch::offer(deployments, refreshed),
            })),
        })
    }

    fn download(&self, task: Task) -> Result<(), String> {
        luft_app::block_on(image::download(expected_size(), task))
    }

    fn downloaded(&self) {
        overview::reload();
    }

    fn rollback(&self, _: Task) -> Result<(), String> {
        luft_app::block_on(image::rollback())
    }

    fn check_in_background(&self, download: bool) -> Result<Option<Notice>, String> {
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

    fn watch(&self) {
        watch::watch();
    }

    fn scan(&self) {
        luft_app::spawn(watch::scan());
    }
}
