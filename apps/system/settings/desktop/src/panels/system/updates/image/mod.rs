mod switch;
mod watch;

use luft_software::system::image::{
    self, ChannelChoice, Deployments, Release, Section, Status, Update,
};
use luft_software::task::Task;
use luft_software::variant::Channel;
use serde::Serialize;
use specta::Type;

use super::store::{Checked, Found, WhatsNew};

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

fn whats_new(deployments: &Deployments, current: &Release) -> Option<Vec<Section>> {
    let version = current.version.clone()?;
    let saved = WhatsNew::load();
    if saved.version.as_ref() == Some(&version) {
        return saved.notes;
    }
    let notes = deployments.new_since_previous()?;
    let _ = WhatsNew {
        version: Some(version),
        notes: Some(notes.clone()),
    }
    .save();
    Some(notes)
}

fn expected_size() -> Option<u64> {
    Found::load().update.map(|update| update.size)
}

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
    let mut status = deployments.status();
    status.current.notes = whats_new(&deployments, &status.current).or(status.current.notes);
    let available = update
        .filter(|update| deployments.lacks(update))
        .map(|update| Available {
            release: update.release,
            size: update.size,
        });
    Ok(ImageOverview {
        status,
        available,
        channel: deployments.channel_choice(),
        offer: switch::offer(deployments, refreshed),
    })
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
