mod bus;
mod hub;
mod model;
mod notes;

use std::sync::Arc;

use anyhow::Result;
use luft_models::Library;
use tokio::sync::mpsc;
use zbus::object_server::SignalEmitter;

use bus::Models;
use hub::{CATALOG, Hub, NAME, PATH};

fn main() -> Result<()> {
    #[cfg(feature = "measure")]
    if std::env::args().nth(1).as_deref() == Some("measure") {
        notes::measure::notes_of_transcripts();
        return Ok(());
    }
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()?
        .block_on(serve())
}

async fn serve() -> Result<()> {
    let (changes, mut changed) = mpsc::unbounded_channel();
    let models = Library::open("luft-language", &CATALOG, move || {
        let _ = changes.send(());
    })?;
    let hub = Arc::new(Hub::new(models));
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
    Ok(luft_dbus::idle::until_idle(|| hub.busy()).await?)
}
