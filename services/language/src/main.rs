mod bus;
mod hub;
mod model;
mod notes;

use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use luft_models::Store;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::mpsc;
use zbus::object_server::SignalEmitter;

use bus::Models;
use hub::{Hub, NAME, PATH};

const WARM_FOR: Duration = Duration::from_secs(180);
const EXIT_WHEN_IDLE_FOR: Duration = Duration::from_secs(30);
const CHECK_EVERY: Duration = Duration::from_secs(5);

fn main() -> Result<()> {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()?
        .block_on(serve())
}

async fn serve() -> Result<()> {
    let (changes, mut changed) = mpsc::unbounded_channel();
    let hub = Arc::new(Hub::new(Store::for_service("luft-language")?, changes));
    let connection = zbus::Connection::session().await?;
    let (writing, models) = bus::serve(&hub);
    connection.object_server().at(PATH, writing).await?;
    connection.object_server().at(PATH, models).await?;
    connection.request_name(NAME).await?;
    let everyone = SignalEmitter::new(&connection, PATH)?;
    tokio::spawn(async move {
        while changed.recv().await.is_some() {
            if let Err(error) = Models::changed(&everyone).await {
                eprintln!("Couldn't send a signal: {error}");
            }
        }
    });
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    let mut tick = tokio::time::interval(CHECK_EVERY);
    loop {
        tokio::select! {
            _ = terminate.recv() => return Ok(()),
            _ = interrupt.recv() => return Ok(()),
            _ = tick.tick() => {
                hub.expire(WARM_FOR);
                if hub.idle_for() >= EXIT_WHEN_IDLE_FOR {
                    return Ok(());
                }
            }
        }
    }
}
