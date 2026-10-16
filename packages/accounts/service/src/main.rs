mod accounts;
mod bus;
mod conditions;
mod drives;
mod hub;
mod notify;
mod paths;
mod providers;
mod rclone;
mod signin;
mod store;

use std::sync::Arc;

use anyhow::Result;
use tokio::signal::unix::{SignalKind, signal};

use hub::{Hub, NAME, PATH, Parts};
use paths::Paths;
use rclone::Rclone;
use store::Records;

fn main() -> Result<()> {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()?
        .block_on(serve())
}

async fn serve() -> Result<()> {
    let paths = Paths::from_environment()?;
    let records = Records::load(paths.accounts.clone())?;
    let session = zbus::Connection::session().await?;
    let system = zbus::Connection::system().await?;
    let watchers = conditions::watch(system);
    let rclone = Rclone::start(&paths)?;
    let (watcher, changes) = drives::Watcher::start()?;
    let hub = Arc::new(Hub::new(Parts {
        paths,
        drives: drives::Drives::new(watcher),
        records,
        rclone,
        conditions: watchers.conditions,
        woke: watchers.woke,
        session: session.clone(),
    }));
    let (accounts, files) = bus::serve(&hub);
    session.object_server().at(PATH, accounts).await?;
    session.object_server().at(PATH, files).await?;
    session.request_name(NAME).await?;
    tokio::spawn(hub.notifier.clone().listen());
    tokio::spawn(drives::follow_changes(hub.clone(), changes));
    tokio::spawn(drives::upkeep(hub.clone()));
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    tokio::select! {
        _ = terminate.recv() => {}
        _ = interrupt.recv() => {}
    }
    if let Err(error) = hub.rclone.unmount_all().await {
        eprintln!("Couldn't unmount the cloud drives: {error:#}");
    }
    Ok(())
}
