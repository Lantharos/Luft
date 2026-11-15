mod switch;
mod watch;

use luft_software::system::image::{self, ChannelChoice, Deployments, Release, Status, Update};
use luft_software::task::Task;
use luft_software::variant::Channel;
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
    channel: Option<ChannelChoice>,
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

pub fn checked_on_schedule_since() -> bool {
    let on_schedule = luft_app::block_on(image::policy())
        .ok()
        .and_then(|policy| policy.checked);
    on_schedule > Checked::load().at
}

fn follow(task: Task) -> Result<(), String> {
    luft_app::block_on(image::follow(expected_size(), task))
}

pub fn installed() -> Result<Deployments, String> {
    luft_app::block_on(Deployments::load())
}

pub fn known(deployments: Deployments) -> ImageOverview {
    overview(deployments, Found::load().update, false)
}

pub fn checked(deployments: Deployments, refreshed: bool) -> Result<ImageOverview, String> {
    let update = check(&deployments)?;
    Ok(overview(deployments, update, refreshed))
}

fn overview(deployments: Deployments, update: Option<Update>, refreshed: bool) -> ImageOverview {
    let status = deployments.status();
    let available = update
        .filter(|update| deployments.lacks(update))
        .map(|update| Available {
            release: update.release,
            size: update.size,
        });
    ImageOverview {
        status,
        available,
        channel: deployments.channel_choice(),
        offer: switch::offer(deployments, refreshed),
    }
}

pub fn download(task: Task) -> Result<(), String> {
    luft_app::block_on(image::download(expected_size(), task))
}

pub fn rollback(_: Task) -> Result<(), String> {
    luft_app::block_on(image::rollback())
}

pub fn switch_channel(channel: Channel, task: Task) -> Result<(), String> {
    luft_app::block_on(image::switch_channel(channel, task)).map(drop)
}
