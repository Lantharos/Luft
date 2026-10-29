mod audio;
mod bus;
mod dictation;
mod engines;
mod hub;
mod language;
mod models;
mod onnx;
mod plan;
mod preferences;
mod warm;

use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use tokio::signal::unix::{SignalKind, signal};
use tokio::sync::mpsc;
use zbus::object_server::SignalEmitter;

use bus::{Dictation, Models};
use hub::{Event, Hub, NAME, PATH};
use models::Store;

const WARM_FOR: Duration = Duration::from_secs(180);
const EXIT_WHEN_IDLE_FOR: Duration = Duration::from_secs(30);
const CHECK_EVERY: Duration = Duration::from_secs(5);

async fn to_shell(
    connection: &zbus::Connection,
    names: &zbus::fdo::DBusProxy<'_>,
) -> zbus::Result<SignalEmitter<'static>> {
    let shell = names.get_name_owner(bus::SHELL).await?;
    Ok(SignalEmitter::new(connection, PATH)?.set_destination(shell.into_inner().into()))
}

fn main() -> Result<()> {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .enable_all()
        .build()?
        .block_on(serve())
}

async fn serve() -> Result<()> {
    let (events, mut received) = mpsc::unbounded_channel();
    let hub = Arc::new(Hub::new(Store::from_environment()?, events));
    hub.follow();
    let following = hub.clone();
    preferences::watch(move || following.follow())?;
    let connection = zbus::Connection::session().await?;
    let names = zbus::fdo::DBusProxy::new(&connection).await?;
    let (dictation, models) = bus::serve(&hub, names.clone());
    connection.object_server().at(PATH, dictation).await?;
    connection.object_server().at(PATH, models).await?;
    connection.request_name(NAME).await?;
    let everyone = SignalEmitter::new(&connection, PATH)?;
    tokio::spawn(async move {
        while let Some(event) = received.recv().await {
            let sent = async {
                match event {
                    Event::Partial(text) => {
                        Dictation::partial(&to_shell(&connection, &names).await?, &text).await
                    }
                    Event::Typed(text) => {
                        Dictation::typed(&to_shell(&connection, &names).await?, &text).await
                    }
                    Event::Sent(done) => {
                        let _ = done.send(());
                        Ok(())
                    }
                    Event::Level(level) => {
                        Dictation::level(&to_shell(&connection, &names).await?, level).await
                    }
                    Event::Quiet => Dictation::quiet(&to_shell(&connection, &names).await?).await,
                    Event::Changed => Models::changed(&everyone).await,
                }
            };
            if let Err(error) = sent.await {
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
                hub.warm.expire(WARM_FOR);
                if hub.idle_for() >= EXIT_WHEN_IDLE_FOR {
                    return Ok(());
                }
            }
        }
    }
}
