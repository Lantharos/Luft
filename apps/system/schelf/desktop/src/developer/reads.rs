use luft_app::{Commands, Empty};
use sabine::SabineWindow;
use serde::Deserialize;
use specta::Type;

use super::answer::ask;
use super::shapes::{
    Account, ChannelAccess, Members, Namespaces, Project, Projects, PublisherDomain,
    PublisherTools, Release, Releases, Stats, VerificationState,
};

#[derive(Deserialize, Type)]
pub struct Publisher {
    pub publisher: String,
}

#[derive(Deserialize, Type)]
pub struct ProjectOf {
    pub id: String,
}

#[derive(Deserialize, Type)]
struct ReleaseOf {
    id: String,
    release: String,
}

#[derive(Deserialize, Type)]
struct ChannelOf {
    id: String,
    channel: String,
}

#[derive(Deserialize, Type)]
struct StatsOf {
    id: String,
    days: u16,
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("developer_account", |Empty {}| {
            ask::<Account>(|store| store.account())
        })
        .command("developer_projects", |Publisher { publisher }| {
            ask::<Projects>(|store| store.apps(&publisher))
        })
        .command("developer_project", |ProjectOf { id }| {
            ask::<Project>(|store| store.app(&id))
        })
        .command("developer_releases", |ProjectOf { id }| {
            ask::<Releases>(|store| store.releases(&id))
        })
        .command("developer_release", |ReleaseOf { id, release }| {
            ask::<Release>(|store| store.release(&id, &release))
        })
        .command("developer_stats", |StatsOf { id, days }| {
            ask::<Stats>(|store| store.stats(&id, &days.to_string()))
        })
        .command("developer_people", |ChannelOf { id, channel }| {
            ask::<ChannelAccess>(|store| store.channel_access(&id, &channel))
        })
        .command("developer_tools", |Publisher { publisher }| {
            ask::<PublisherTools>(|store| store.tools(&publisher))
        })
        .command("developer_members", |Publisher { publisher }| {
            ask::<Members>(|store| store.members(&publisher))
        })
        .command("developer_verification", |Publisher { publisher }| {
            ask::<VerificationState>(|store| store.verification(&publisher))
        })
        .command("developer_namespaces", |Publisher { publisher }| {
            ask::<Namespaces>(|store| store.namespaces(&publisher))
        })
        .command("developer_domain", |Publisher { publisher }| {
            ask::<PublisherDomain>(|store| store.publisher_domain(&publisher))
        })
}
