mod watch;

use luft_software::image::{self, Deployments, Release, Status, Update};
use luft_software::progress::Progress;
use luft_software::task::{Cancel, Task};
use serde::Serialize;

use super::backend::{AVAILABLE, Backend, Notice, READY};
use super::overview::{self, Loaded, System};
use super::store::{Checked, Found};

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
    image::follow(expected_size(), task)
}

impl Backend for Image {
    fn load(&self, refresh: Option<Task>) -> Result<Loaded, String> {
        let deployments = Deployments::load()?;
        let update = match refresh {
            Some(_) => check(&deployments)?,
            None => Found::load().update,
        };
        Ok(Loaded {
            package_apps: 0,
            system: System::Image(Box::new(Overview {
                status: deployments.status(),
                available: update
                    .filter(|update| deployments.lacks(update))
                    .map(|update| Available {
                        release: update.release,
                        size: update.size,
                    }),
            })),
        })
    }

    fn download(&self, task: Task) -> Result<(), String> {
        image::download(expected_size(), task)
    }

    fn downloaded(&self) {
        overview::reload();
    }

    fn rollback(&self, _: Task) -> Result<(), String> {
        image::rollback()
    }

    fn check_in_background(&self, download: bool) -> Result<Option<Notice>, String> {
        let deployments = Deployments::load()?;
        let update = check(&deployments)?;
        Checked::now()?;
        let Some(update) = update.filter(|update| deployments.lacks(update)) else {
            return Ok(None);
        };
        if !download {
            return Ok(Some(AVAILABLE));
        }
        let quiet = |_: Progress| {};
        image::download(
            Some(update.size),
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
